import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'
import { stripe, stripeConfigured } from '@/lib/stripe'
import { planForUserType } from '@/lib/billing'

// Creates a Stripe Checkout Session for the current user's subscription plan
// (Candidate Premium or Recruiter Pro) and returns the hosted checkout URL.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const token = getTokenFromHeader(req.headers.authorization)
  const decoded = verifyToken(token || '')
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' })

  if (!stripeConfigured || !stripe) {
    return res.status(503).json({ error: 'Billing is not configured' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    const plan = planForUserType(user.userType)
    if (!plan) return res.status(400).json({ error: 'No plan available for this account type' })
    if (user.subscriptionTier !== 'free') {
      return res.status(409).json({ error: 'Already subscribed' })
    }

    // Reuse an existing Stripe customer if we have one.
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { userId: user.id } })
      customerId = customer.id
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } })
    }

    const base = (process.env.NEXTAUTH_URL || 'http://localhost:3000').replace(/\/$/, '')
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{
        quantity: 1,
        price_data: {
          currency: 'usd',
          recurring: { interval: plan.interval },
          unit_amount: plan.amount,
          product_data: { name: plan.label },
        },
      }],
      metadata: { userId: user.id, tier: plan.tier },
      success_url: `${base}/dashboard?upgraded=1`,
      cancel_url: `${base}/dashboard?canceled=1`,
    })

    return res.status(200).json({ url: session.url })
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Internal server error' }) }
}

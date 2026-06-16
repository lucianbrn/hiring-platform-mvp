import type { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { validateEmail, validatePassword } from '@/utils/validation'
import { signVerificationToken } from '@/lib/auth'
import { sendVerificationEmail, emailConfigured } from '@/lib/email'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { email, password, userType, firstName, lastName } = req.body
    if (!email || !password || !userType) return res.status(400).json({ error: 'Missing required fields' })
    if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email' })
    if (!validatePassword(password)) return res.status(400).json({ error: 'Password must be 8+ characters' })
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'Email already registered' })
    const passwordHash = await hash(password, 12)
    const user = await prisma.user.create({ data: { email, password: passwordHash, userType, firstName, lastName } })
    if (userType === 'candidate') await prisma.candidate.create({ data: { userId: user.id } })

    // Issue an email-verification token and send the confirmation email.
    const verificationToken = signVerificationToken(user.id)
    await prisma.verificationRecord.create({
      data: { userId: user.id, verificationType: 'email', status: 'pending', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
    })
    await sendVerificationEmail(email, verificationToken)

    const body: Record<string, any> = { user_id: user.id, next_step: 'verify_email' }
    // When email isn't configured (local dev), hand the token back so the flow
    // is still completable. This is never exposed once SendGrid is set up.
    if (!emailConfigured) body.verification_token = verificationToken
    return res.status(201).json(body)
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Internal server error' }) }
}
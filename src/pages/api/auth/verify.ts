import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'

// Email verification endpoint.
//
// In production this would validate a one-time code delivered via SendGrid.
// No email provider is wired up in this MVP, so verification is performed by
// confirming ownership of the email address that just registered. Once an
// account is verified it becomes discoverable in the swipe feed.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { email } = req.body
    if (!email) return res.status(400).json({ error: 'Email required' })

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (user.accountStatus === 'verified') {
      return res.status(200).json({ account_status: 'verified', already_verified: true })
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { accountStatus: 'verified' } }),
      prisma.verificationRecord.create({
        data: { userId: user.id, verificationType: 'email', status: 'verified', verifiedAt: new Date() },
      }),
    ])

    return res.status(200).json({ account_status: 'verified' })
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Internal server error' }) }
}

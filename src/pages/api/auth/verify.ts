import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { verifyVerificationToken } from '@/lib/auth'

// Email verification endpoint.
//
// Activates an account by validating the single-purpose, time-limited token
// delivered in the verification email. Once verified, the account becomes
// discoverable in the swipe feed.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ error: 'Verification token required' })

    const payload = verifyVerificationToken(token)
    if (!payload) return res.status(400).json({ error: 'Invalid or expired verification link' })

    const user = await prisma.user.findUnique({ where: { id: payload.userId } })
    if (!user) return res.status(404).json({ error: 'User not found' })

    if (user.accountStatus === 'verified') {
      return res.status(200).json({ account_status: 'verified', already_verified: true })
    }

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { accountStatus: 'verified' } }),
      prisma.verificationRecord.updateMany({
        where: { userId: user.id, verificationType: 'email', status: 'pending' },
        data: { status: 'verified', verifiedAt: new Date() },
      }),
    ])

    return res.status(200).json({ account_status: 'verified' })
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Internal server error' }) }
}

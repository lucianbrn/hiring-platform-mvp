import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const token = getTokenFromHeader(req.headers.authorization)
  if (!token) return res.status(401).json({ error: 'Unauthorized' })
  const decoded = verifyToken(token)
  if (!decoded) return res.status(401).json({ error: 'Invalid token' })
  try {
    const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { id: true, email: true, firstName: true, lastName: true, userType: true, accountStatus: true, subscriptionTier: true, avatarUrl: true, bio: true, locationCity: true } })
    if (!user) return res.status(404).json({ error: 'User not found' })
    return res.status(200).json(user)
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
}
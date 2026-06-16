import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = getTokenFromHeader(req.headers.authorization)
  const decoded = verifyToken(token || '')
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' })

  // This endpoint exposes every user's email and account data, so it must be
  // restricted to admins. There is no admin role in the schema yet, so access
  // is gated on an allow-list of emails configured via ADMIN_EMAILS. If the
  // env var is unset, the endpoint is locked down (deny by default).
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  if (!adminEmails.includes(String(decoded.email).toLowerCase())) {
    return res.status(403).json({ error: 'Forbidden' })
  }
  try {
    const { userType, status, limit = 50, offset = 0 } = req.query
    const where: any = {}
    if (userType) where.userType = userType
    if (status) where.accountStatus = status
    const users = await prisma.user.findMany({ where, select: { id: true, email: true, firstName: true, lastName: true, userType: true, accountStatus: true, subscriptionTier: true, createdAt: true }, take: parseInt(limit as string), skip: parseInt(offset as string), orderBy: { createdAt: 'desc' } })
    const total = await prisma.user.count({ where })
    return res.status(200).json({ users, total })
  } catch (e) { return res.status(500).json({ error: 'Internal server error' }) }
}
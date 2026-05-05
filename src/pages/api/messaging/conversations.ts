import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const token = getTokenFromHeader(req.headers.authorization)
  const decoded = verifyToken(token || '')
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const where = decoded.userType === 'recruiter' ? { recruiterId: decoded.userId } : { candidateUserId: decoded.userId }
    const threads = await prisma.conversationThread.findMany({ where, include: { recruiter: { select: { firstName: true, lastName: true, company: { select: { companyName: true } } } }, candidate: { select: { firstName: true, lastName: true } }, messages: { orderBy: { createdAt: 'desc' }, take: 1 } }, orderBy: { updatedAt: 'desc' } })
    return res.status(200).json({ conversations: threads })
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Internal server error' }) }
}
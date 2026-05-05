import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const token = getTokenFromHeader(req.headers.authorization)
  const decoded = verifyToken(token || '')
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const { conversationId, content, candidateUserId, jobListingId } = req.body
    if (!content) return res.status(400).json({ error: 'Content required' })
    let threadId = conversationId
    if (!threadId && decoded.userType === 'recruiter' && candidateUserId) {
      const thread = await prisma.conversationThread.upsert({ where: { recruiterId_candidateUserId: { recruiterId: decoded.userId, candidateUserId } }, update: {}, create: { recruiterId: decoded.userId, candidateUserId, jobListingId } })
      threadId = thread.id
    }
    if (!threadId) return res.status(400).json({ error: 'conversationId required' })
    const message = await prisma.message.create({ data: { conversationThreadId: threadId, senderId: decoded.userId, content } })
    await prisma.conversationThread.update({ where: { id: threadId }, data: { lastMessageAt: new Date(), ...(decoded.userType === 'candidate' ? { candidateConsented: true, conversationStatus: 'active' } : {}) } })
    return res.status(201).json(message)
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Internal server error' }) }
}
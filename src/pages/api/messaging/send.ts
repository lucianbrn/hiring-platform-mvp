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
    if (!content || !content.trim()) return res.status(400).json({ error: 'Content required' })

    let threadId = conversationId
    if (!threadId && decoded.userType === 'recruiter' && candidateUserId) {
      // A recruiter can open a new thread with a candidate, unless blocked.
      if (await isBlockedBetween(decoded.userId, candidateUserId)) {
        return res.status(403).json({ error: 'Cannot message this user' })
      }
      const thread = await prisma.conversationThread.upsert({ where: { recruiterId_candidateUserId: { recruiterId: decoded.userId, candidateUserId } }, update: {}, create: { recruiterId: decoded.userId, candidateUserId, jobListingId } })
      threadId = thread.id
    }
    if (!threadId) return res.status(400).json({ error: 'conversationId required' })

    // The sender must be a participant of the thread.
    const thread = await prisma.conversationThread.findUnique({ where: { id: threadId } })
    if (!thread) return res.status(404).json({ error: 'Conversation not found' })
    if (thread.recruiterId !== decoded.userId && thread.candidateUserId !== decoded.userId) {
      return res.status(403).json({ error: 'Forbidden' })
    }
    const otherUserId = thread.recruiterId === decoded.userId ? thread.candidateUserId : thread.recruiterId
    if (await isBlockedBetween(decoded.userId, otherUserId)) {
      return res.status(403).json({ error: 'Cannot message this user' })
    }

    const message = await prisma.message.create({ data: { conversationThreadId: threadId, senderId: decoded.userId, content } })
    await prisma.conversationThread.update({ where: { id: threadId }, data: { lastMessageAt: new Date(), ...(decoded.userType === 'candidate' ? { candidateConsented: true, conversationStatus: 'active' } : {}) } })
    return res.status(201).json(message)
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Internal server error' }) }
}

async function isBlockedBetween(a: string, b: string): Promise<boolean> {
  const block = await prisma.blockMute.findFirst({
    where: {
      blockType: 'block',
      OR: [
        { blockerId: a, blockeeId: b },
        { blockerId: b, blockeeId: a },
      ],
    },
  })
  return !!block
}
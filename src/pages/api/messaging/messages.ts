import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

// Returns the messages of a single conversation thread. Only the two
// participants (recruiter + candidate) may read it, and the reader's unread
// messages are marked read as a side effect.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const token = getTokenFromHeader(req.headers.authorization)
  const decoded = verifyToken(token || '')
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const { conversationId } = req.query
    if (!conversationId) return res.status(400).json({ error: 'conversationId required' })

    const thread = await prisma.conversationThread.findUnique({ where: { id: conversationId as string } })
    if (!thread) return res.status(404).json({ error: 'Conversation not found' })
    if (thread.recruiterId !== decoded.userId && thread.candidateUserId !== decoded.userId) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    const messages = await prisma.message.findMany({
      where: { conversationThreadId: thread.id },
      orderBy: { createdAt: 'asc' },
      select: { id: true, senderId: true, content: true, isRead: true, createdAt: true },
    })

    // Mark messages from the other party as read.
    await prisma.message.updateMany({
      where: { conversationThreadId: thread.id, senderId: { not: decoded.userId }, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })

    return res.status(200).json({ conversationId: thread.id, messages })
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Internal server error' }) }
}

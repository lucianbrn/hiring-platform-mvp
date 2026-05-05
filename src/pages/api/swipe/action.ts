import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const token = getTokenFromHeader(req.headers.authorization)
  const decoded = verifyToken(token || '')
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const { candidateId, jobListingId, action } = req.body
    if (!candidateId || !action) return res.status(400).json({ error: 'candidateId and action required' })
    if (!['like','pass','message'].includes(action)) return res.status(400).json({ error: 'Invalid action' })
    const interaction = await prisma.interaction.upsert({ where: { recruiterId_candidateId: { recruiterId: decoded.userId, candidateId } }, update: { action, jobListingId }, create: { recruiterId: decoded.userId, candidateId, jobListingId, action } })
    return res.status(200).json({ interaction_id: interaction.id, action })
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Internal server error' }) }
}
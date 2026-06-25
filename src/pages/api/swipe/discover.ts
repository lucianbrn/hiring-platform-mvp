import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  const token = getTokenFromHeader(req.headers.authorization)
  const decoded = verifyToken(token || '')
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' })
  try {
    const { limit = 10, jobId } = req.query
    if (decoded.userType === 'recruiter') {
      const already = await prisma.interaction.findMany({ where: { recruiterId: decoded.userId }, select: { candidateId: true } })
      const exclude = already.map(i => i.candidateId)

      // When a job is specified, surface its matched candidate pool ordered by
      // match score so the strongest matches appear first.
      if (jobId) {
        const pool = await prisma.candidatePool.findMany({
          where: { jobListingId: jobId as string, candidateId: { notIn: exclude } },
          include: { candidate: { include: { user: { select: { firstName: true, lastName: true, locationCity: true, locationState: true } }, aiSummary: true } } },
          orderBy: { matchScore: 'desc' },
          take: parseInt(limit as string),
        })
        const candidates = pool.map(p => ({ ...p.candidate, matchScore: p.matchScore, matchReason: p.matchReason }))
        return res.status(200).json({ candidates })
      }

      const candidates = await prisma.candidate.findMany({ where: { id: { notIn: exclude }, isOpenToOpportunities: true, user: { isProfileVisible: true, accountStatus: 'verified' } }, include: { user: { select: { firstName: true, lastName: true, locationCity: true, locationState: true } }, aiSummary: true }, take: parseInt(limit as string) })
      return res.status(200).json({ candidates })
    } else {
      const companies = await prisma.company.findMany({ where: { isVerified: true, isActivelyHiring: true }, include: { jobListings: { where: { isActive: true }, take: 3 } }, take: parseInt(limit as string) })
      return res.status(200).json({ companies })
    }
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Internal server error' }) }
}
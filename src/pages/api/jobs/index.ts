import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'
import { calculateMatchScore } from '@/utils/matching'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = getTokenFromHeader(req.headers.authorization)
  const decoded = verifyToken(token || '')
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' })
  try {
    if (req.method === 'GET') {
      const company = await prisma.company.findUnique({ where: { primaryContactUserId: decoded.userId } })
      if (!company) return res.status(404).json({ error: 'No company found' })
      const jobs = await prisma.jobListing.findMany({ where: { companyId: company.id }, orderBy: { createdAt: 'desc' } })
      return res.status(200).json({ jobs })
    }
    if (req.method === 'POST') {
      const company = await prisma.company.findUnique({ where: { primaryContactUserId: decoded.userId } })
      if (!company) return res.status(404).json({ error: 'Create a company first' })
      const { jobTitle, jobDescription, salaryMin, salaryMax, requiredDegree, targetLocations, remoteOption, willingToTrain } = req.body
      if (!jobTitle) return res.status(400).json({ error: 'Job title required' })
      const job = await prisma.jobListing.create({ data: { companyId: company.id, jobTitle, jobDescription, salaryMin: salaryMin ? parseInt(salaryMin) : undefined, salaryMax: salaryMax ? parseInt(salaryMax) : undefined, requiredDegree, targetLocations: targetLocations || [], remoteOption: remoteOption || 'onsite', willingToTrain: willingToTrain || false } })

      // Auto-generate the candidate pool: score every verified, open candidate
      // against this job and pool everyone above the match threshold. This is the
      // core "intelligent matching" promise of the platform.
      const pooled = await generateCandidatePool(job)

      return res.status(201).json({ ...job, pooledCandidates: pooled })
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Internal server error' }) }
}

const POOL_MATCH_THRESHOLD = 0.5

async function generateCandidatePool(job: any): Promise<number> {
  const candidates = await prisma.candidate.findMany({
    where: { isOpenToOpportunities: true, user: { accountStatus: 'verified', isProfileVisible: true } },
  })

  const rows = candidates
    .map((candidate) => {
      const { score, reason } = calculateMatchScore(candidate, job)
      return { candidate, score, reason }
    })
    .filter((r) => r.score >= POOL_MATCH_THRESHOLD)

  if (!rows.length) return 0

  await prisma.candidatePool.createMany({
    data: rows.map((r) => ({
      jobListingId: job.id,
      candidateId: r.candidate.id,
      matchScore: r.score,
      matchReason: r.reason,
    })),
    skipDuplicates: true,
  })

  return rows.length
}
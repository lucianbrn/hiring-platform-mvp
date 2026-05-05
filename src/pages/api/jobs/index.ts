import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

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
      return res.status(201).json(job)
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Internal server error' }) }
}
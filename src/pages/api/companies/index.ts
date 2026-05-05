import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = getTokenFromHeader(req.headers.authorization)
  const decoded = verifyToken(token || '')
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' })
  try {
    if (req.method === 'GET') {
      const company = await prisma.company.findUnique({ where: { primaryContactUserId: decoded.userId }, include: { jobListings: { where: { isActive: true } } } })
      if (!company) return res.status(404).json({ error: 'Company not found' })
      return res.status(200).json(company)
    }
    if (req.method === 'POST') {
      const { companyName, website, industry, description, companySize, ein } = req.body
      if (!companyName) return res.status(400).json({ error: 'Company name required' })
      const company = await prisma.company.create({ data: { primaryContactUserId: decoded.userId, companyName, website, industry, description, companySize, ein } })
      return res.status(201).json(company)
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Internal server error' }) }
}
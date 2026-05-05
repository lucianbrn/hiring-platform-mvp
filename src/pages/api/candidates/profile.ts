import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { getTokenFromHeader, verifyToken } from '@/lib/auth'
import { calculateProfileCompletion } from '@/utils/validation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = getTokenFromHeader(req.headers.authorization)
  const decoded = verifyToken(token || '')
  if (!decoded) return res.status(401).json({ error: 'Unauthorized' })
  try {
    if (req.method === 'GET') {
      const c = await prisma.candidate.findUnique({ where: { userId: decoded.userId }, include: { user: { select: { email: true, firstName: true, lastName: true, bio: true, avatarUrl: true, locationCity: true, locationState: true, subscriptionTier: true } } } })
      if (!c) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json({ ...c, profileCompletionPct: calculateProfileCompletion(c) })
    }
    if (req.method === 'PUT') {
      const { degreeType, degreeField, schoolName, graduationDate, gpa, topSkills, softSkills, preferredRoles, preferredLocations, willingToRelocate, preferredIndustries } = req.body
      const c = await prisma.candidate.update({ where: { userId: decoded.userId }, data: { degreeType, degreeField, schoolName, graduationDate: graduationDate ? new Date(graduationDate) : undefined, gpa: gpa ? parseFloat(gpa) : undefined, topSkills: topSkills || [], softSkills: softSkills || [], preferredRoles: preferredRoles || [], preferredLocations: preferredLocations || [], willingToRelocate, preferredIndustries: preferredIndustries || [] } })
      return res.status(200).json({ ...c, profileCompletionPct: calculateProfileCompletion(c) })
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Internal server error' }) }
}
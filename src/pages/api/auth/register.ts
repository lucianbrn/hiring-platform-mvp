import type { NextApiRequest, NextApiResponse } from 'next'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { validateEmail, validatePassword } from '@/utils/validation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { email, password, userType, firstName, lastName } = req.body
    if (!email || !password || !userType) return res.status(400).json({ error: 'Missing required fields' })
    if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email' })
    if (!validatePassword(password)) return res.status(400).json({ error: 'Password must be 8+ characters' })
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'Email already registered' })
    const passwordHash = await hash(password, 12)
    const user = await prisma.user.create({ data: { email, password: passwordHash, userType, firstName, lastName } })
    if (userType === 'candidate') await prisma.candidate.create({ data: { userId: user.id } })
    return res.status(201).json({ user_id: user.id, next_step: 'verify_email' })
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Internal server error' }) }
}
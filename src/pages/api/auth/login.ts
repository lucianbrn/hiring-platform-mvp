import type { NextApiRequest, NextApiResponse } from 'next'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !(await compare(password, user.password))) return res.status(401).json({ error: 'Invalid credentials' })
    if (user.accountStatus === 'suspended') return res.status(403).json({ error: 'Account suspended' })
    const token = signToken({ userId: user.id, email: user.email, userType: user.userType })
    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })
    return res.status(200).json({ token, user_id: user.id, user_type: user.userType, account_status: user.accountStatus })
  } catch (e) { console.error(e); return res.status(500).json({ error: 'Internal server error' }) }
}
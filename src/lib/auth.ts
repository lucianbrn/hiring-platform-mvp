import { sign, verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

export function signToken(payload: object) {
  return sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string) {
  try { return verify(token, JWT_SECRET) as any }
  catch { return null }
}

export function getTokenFromHeader(authHeader?: string) {
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.split(' ')[1]
}

// Short-lived, single-purpose token used for email verification links.
export function signVerificationToken(userId: string) {
  return sign({ userId, purpose: 'email_verify' }, JWT_SECRET, { expiresIn: '1d' })
}

export function verifyVerificationToken(token: string): { userId: string } | null {
  try {
    const decoded = verify(token, JWT_SECRET) as any
    if (decoded?.purpose !== 'email_verify' || !decoded?.userId) return null
    return { userId: decoded.userId }
  } catch { return null }
}
import { describe, it, expect } from 'vitest'
import { signVerificationToken, verifyVerificationToken, getTokenFromHeader, signToken } from './auth'

describe('verification tokens', () => {
  it('round-trips a userId through sign/verify', () => {
    const token = signVerificationToken('user-123')
    expect(verifyVerificationToken(token)).toEqual({ userId: 'user-123' })
  })

  it('rejects a garbage token', () => {
    expect(verifyVerificationToken('not-a-real-token')).toBeNull()
  })

  it('rejects a token that is not an email-verify token', () => {
    // A normal auth/session token must not be accepted as a verification token.
    const sessionToken = signToken({ userId: 'user-123', email: 'a@b.com' })
    expect(verifyVerificationToken(sessionToken)).toBeNull()
  })
})

describe('getTokenFromHeader', () => {
  it('extracts a bearer token', () => {
    expect(getTokenFromHeader('Bearer abc.def.ghi')).toBe('abc.def.ghi')
  })
  it('returns null without a bearer prefix', () => {
    expect(getTokenFromHeader('abc.def.ghi')).toBeNull()
    expect(getTokenFromHeader(undefined)).toBeNull()
  })
})

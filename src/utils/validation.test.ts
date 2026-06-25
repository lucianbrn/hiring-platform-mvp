import { describe, it, expect } from 'vitest'
import { validateEmail, validateEduEmail, validatePassword, calculateProfileCompletion } from './validation'

describe('validateEmail', () => {
  it('accepts well-formed addresses', () => {
    expect(validateEmail('a@b.com')).toBe(true)
    expect(validateEmail('jane.doe@example.co.uk')).toBe(true)
  })
  it('rejects malformed addresses', () => {
    expect(validateEmail('no-at-sign')).toBe(false)
    expect(validateEmail('a@b')).toBe(false)
    expect(validateEmail('a b@c.com')).toBe(false)
  })
})

describe('validateEduEmail', () => {
  it('accepts .edu addresses and rejects others', () => {
    expect(validateEduEmail('student@university.edu')).toBe(true)
    expect(validateEduEmail('person@gmail.com')).toBe(false)
  })
})

describe('validatePassword', () => {
  it('requires at least 8 characters', () => {
    expect(validatePassword('short')).toBe(false)
    expect(validatePassword('longenough')).toBe(true)
  })
})

describe('calculateProfileCompletion', () => {
  it('returns 0 for an empty profile', () => {
    expect(calculateProfileCompletion({})).toBe(0)
  })
  it('returns 100 for a fully filled profile', () => {
    const complete = {
      degreeType: 'Bachelor',
      degreeField: 'CS',
      schoolName: 'MIT',
      graduationDate: new Date(),
      topSkills: ['JS'],
      bio: 'hi',
    }
    expect(calculateProfileCompletion(complete)).toBe(100)
  })
  it('ignores empty arrays and blank strings', () => {
    const partial = { degreeType: 'Bachelor', degreeField: '', topSkills: [] }
    expect(calculateProfileCompletion(partial)).toBe(Math.round((1 / 6) * 100))
  })
})

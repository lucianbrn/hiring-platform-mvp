import { describe, it, expect } from 'vitest'
import { planForUserType, PLANS } from './billing'

describe('planForUserType', () => {
  it('returns the Premium plan for candidates', () => {
    expect(planForUserType('candidate')).toEqual(PLANS.candidate)
    expect(planForUserType('candidate')?.amount).toBe(499)
  })

  it('returns the Pro plan for recruiters', () => {
    expect(planForUserType('recruiter')).toEqual(PLANS.recruiter)
    expect(planForUserType('recruiter')?.amount).toBe(9900)
  })

  it('returns null for unknown user types', () => {
    expect(planForUserType('admin')).toBeNull()
    expect(planForUserType('')).toBeNull()
  })

  it('prices are positive monthly amounts in cents', () => {
    for (const plan of Object.values(PLANS)) {
      expect(plan.amount).toBeGreaterThan(0)
      expect(plan.interval).toBe('month')
    }
  })
})

import { describe, it, expect } from 'vitest'
import { calculateMatchScore } from './matching'

describe('calculateMatchScore', () => {
  const strongCandidate = {
    degreeType: 'Bachelor',
    gpa: '3.8',
    topSkills: ['JavaScript', 'React'],
    preferredLocations: ['San Francisco'],
    willingToRelocate: false,
  }

  const job = {
    requiredDegree: 'Bachelor',
    requiredGpa: '3.0',
    targetLocations: ['San Francisco'],
    remoteOption: 'onsite',
  }

  it('gives a near-perfect score to a strong match', () => {
    const { score, reason } = calculateMatchScore(strongCandidate, job)
    expect(score).toBeCloseTo(1, 5)
    expect(reason.meetsDegree).toBe(true)
    expect(reason.meetsGpa).toBe(true)
    expect(reason.hasSkills).toBe(true)
    expect(reason.locationMatch).toBe(true)
  })

  it('penalizes a candidate whose degree is below the requirement', () => {
    const candidate = { ...strongCandidate, degreeType: 'High School' }
    const { score, reason } = calculateMatchScore(candidate, { ...job, requiredDegree: 'Master' })
    expect(reason.meetsDegree).toBe(false)
    expect(score).toBeLessThan(1)
  })

  it('treats a remote role as a location match regardless of preferences', () => {
    const candidate = { ...strongCandidate, preferredLocations: ['Boston'], willingToRelocate: false }
    const { reason } = calculateMatchScore(candidate, { ...job, remoteOption: 'remote', targetLocations: ['NYC'] })
    expect(reason.locationMatch).toBe(true)
  })

  it('treats willingToRelocate as a location match', () => {
    const candidate = { ...strongCandidate, preferredLocations: ['Boston'], willingToRelocate: true }
    const { reason } = calculateMatchScore(candidate, { ...job, targetLocations: ['NYC'] })
    expect(reason.locationMatch).toBe(true)
  })

  it('never returns a score above 1', () => {
    const { score } = calculateMatchScore(strongCandidate, job)
    expect(score).toBeLessThanOrEqual(1)
  })

  it('handles missing candidate data without throwing', () => {
    const { score } = calculateMatchScore({}, job)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(1)
  })
})

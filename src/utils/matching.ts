export interface MatchResult { score: number; reason: Record<string, boolean> }

export function calculateMatchScore(candidate: any, job: any): MatchResult {
  let score = 0
  const reason: Record<string, boolean> = {}

  // Degree match (40%)
  const degreeRank: Record<string, number> = { 'High School': 1, 'Associate': 2, 'Bachelor': 3, 'Master': 4, 'PhD': 5 }
  const candDeg = degreeRank[candidate.degreeType] || 0
  const reqDeg = degreeRank[job.requiredDegree] || 0
  reason.meetsDegree = candDeg >= reqDeg
  if (reason.meetsDegree) score += 0.4

  // GPA match (20%)
  if (job.requiredGpa && candidate.gpa) {
    reason.meetsGpa = parseFloat(candidate.gpa) >= parseFloat(job.requiredGpa)
    score += reason.meetsGpa ? 0.2 : 0.1
  } else { reason.meetsGpa = true; score += 0.15 }

  // Skills (20%)
  reason.hasSkills = (candidate.topSkills?.length || 0) > 0
  if (reason.hasSkills) score += 0.2

  // Location (20%)
  const locations = candidate.preferredLocations || []
  const targets = job.targetLocations || []
  reason.locationMatch = job.remoteOption === 'remote' || candidate.willingToRelocate || locations.some((l: string) => targets.includes(l))
  score += reason.locationMatch ? 0.2 : 0.05

  return { score: Math.min(1, score), reason }
}
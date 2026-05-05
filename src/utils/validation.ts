export const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
export const validateEduEmail = (email: string) => email.endsWith('.edu')
export const validatePassword = (pw: string) => pw.length >= 8

export function calculateProfileCompletion(candidate: any): number {
  const fields = ['degreeType','degreeField','schoolName','graduationDate','topSkills','bio']
  const filled = fields.filter(f => {
    const v = candidate[f]
    return v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
  }).length
  return Math.round((filled / fields.length) * 100)
}
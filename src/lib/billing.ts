// Subscription plan definitions. Amounts are in cents (USD).
export interface Plan {
  tier: string
  label: string
  amount: number
  interval: 'month'
}

export const PLANS: Record<string, Plan> = {
  candidate: { tier: 'premium', label: 'Candidate Premium', amount: 499, interval: 'month' },
  recruiter: { tier: 'pro', label: 'Recruiter Pro', amount: 9900, interval: 'month' },
}

// Returns the upgrade plan for a given user type, or null if that user type has
// no paid plan.
export function planForUserType(userType: string): Plan | null {
  return PLANS[userType] || null
}

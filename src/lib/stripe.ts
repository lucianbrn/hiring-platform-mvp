import Stripe from 'stripe'

const apiKey = process.env.STRIPE_SECRET_KEY

// Treat placeholder keys (e.g. "sk_test_1234567890") as unconfigured so local
// dev doesn't attempt real Stripe calls.
export const stripeConfigured = !!apiKey && apiKey.startsWith('sk_') && apiKey.length > 20

export const stripe: Stripe | null = stripeConfigured
  ? new Stripe(apiKey as string, { apiVersion: '2023-10-16' as any })
  : null

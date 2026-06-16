import sgMail from '@sendgrid/mail'

const FROM = process.env.SENDGRID_FROM_EMAIL || 'noreply@hiringplatform.com'
const apiKey = process.env.SENDGRID_API_KEY

// Treat obvious placeholder keys (e.g. "SG.test") as "not configured" so local
// dev doesn't try to hit SendGrid with a fake key.
export const emailConfigured = !!apiKey && apiKey.startsWith('SG.') && apiKey.length > 12

if (emailConfigured) sgMail.setApiKey(apiKey as string)

export function verificationUrl(token: string) {
  const base = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  return `${base.replace(/\/$/, '')}/auth/verify?token=${encodeURIComponent(token)}`
}

// Sends the verification email. Returns true if an email was actually
// dispatched; false (after logging the link) when email isn't configured, so
// the verification flow remains testable locally without a provider.
export async function sendVerificationEmail(to: string, token: string): Promise<boolean> {
  const url = verificationUrl(token)
  if (!emailConfigured) {
    console.log(`[email] SendGrid not configured — verification link for ${to}: ${url}`)
    return false
  }
  await sgMail.send({
    to,
    from: FROM,
    subject: 'Verify your Hiring Platform account',
    text: `Welcome! Confirm your email to activate your account: ${url}`,
    html: `<p>Welcome to Hiring Platform!</p><p>Confirm your email to activate your account:</p><p><a href="${url}">Verify my email</a></p><p>This link expires in 24 hours.</p>`,
  })
  return true
}

import { useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Link from 'next/link'

export default function Verify() {
  const router = useRouter()
  const email = typeof router.query.email === 'string' ? router.query.email : ''
  const [status, setStatus] = useState<'idle' | 'loading' | 'verified' | 'error'>('idle')
  const [error, setError] = useState('')

  const handleVerify = async () => {
    setStatus('loading')
    setError('')
    try {
      await axios.post('/api/auth/verify', { email })
      setStatus('verified')
    } catch (err: any) {
      setStatus('error')
      setError(err.response?.data?.error || 'Verification failed')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">Verify Your Account</h2>
        {status === 'verified' ? (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm mb-6">
              <strong>Email verified!</strong> Your account is now active.
            </div>
            <Link href="/auth/login" className="btn-primary inline-block">Continue to Sign In</Link>
          </>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              {email
                ? <>We sent a verification link to <strong>{email}</strong>. In this MVP, click below to confirm your email and activate your account.</>
                : 'Check your email for a verification link to activate your account.'}
            </p>
            {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-sm">{error}</div>}
            <button onClick={handleVerify} disabled={!email || status === 'loading'} className="btn-primary w-full disabled:opacity-50">
              {status === 'loading' ? 'Verifying...' : 'Verify Email'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

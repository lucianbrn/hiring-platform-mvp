import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Link from 'next/link'

export default function Verify() {
  const router = useRouter()
  const [status, setStatus] = useState<'idle' | 'loading' | 'verified' | 'error'>('idle')
  const [error, setError] = useState('')
  const attempted = useRef(false)

  // When the page is opened from the verification email it carries a ?token=...
  // Verify automatically as soon as the router has parsed the query string.
  useEffect(() => {
    if (!router.isReady || attempted.current) return
    const token = typeof router.query.token === 'string' ? router.query.token : ''
    if (!token) return
    attempted.current = true
    setStatus('loading')
    axios.post('/api/auth/verify', { token })
      .then(() => setStatus('verified'))
      .catch((err: any) => { setStatus('error'); setError(err.response?.data?.error || 'Verification failed') })
  }, [router.isReady, router.query.token])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">Verify Your Account</h2>

        {status === 'verified' && (
          <>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700 text-sm mb-6">
              <strong>Email verified!</strong> Your account is now active.
            </div>
            <Link href="/auth/login" className="btn-primary inline-block">Continue to Sign In</Link>
          </>
        )}

        {status === 'loading' && <p className="text-gray-600">Verifying your email…</p>}

        {status === 'error' && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm">
            {error}<br />The link may have expired. Please register again to receive a new one.
          </div>
        )}

        {status === 'idle' && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-indigo-700 text-sm">
            We sent a verification link to your email. Click it to activate your account.
          </div>
        )}
      </div>
    </div>
  )
}

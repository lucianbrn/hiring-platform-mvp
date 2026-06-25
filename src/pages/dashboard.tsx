import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Link from 'next/link'
import NavBar from '@/components/NavBar'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userType = localStorage.getItem('userType')
    if (!token) { router.push('/auth/login'); return }
    
    axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setUser(r.data))
      .catch(() => router.push('/auth/login'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!user) return null

  const handleUpgrade = async () => {
    const token = localStorage.getItem('token')
    try {
      const r = await axios.post('/api/billing/checkout', {}, { headers: { Authorization: `Bearer ${token}` } })
      if (r.data?.url) window.location.href = r.data.url
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not start checkout')
    }
  }

  const isPaid = user.subscriptionTier && user.subscriptionTier !== 'free'

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-2">Welcome, {user.firstName}!</h2>
            <p className="text-gray-600 mb-4">Account Type: <span className="font-semibold">{user.userType === 'recruiter' ? 'Recruiter' : 'Candidate'}</span></p>
            <p className="text-gray-600 mb-4">Email: {user.email}</p>
            <p className="text-gray-600 mb-4">Status: <span className={`font-semibold ${user.accountStatus === 'verified' ? 'text-green-600' : 'text-amber-600'}`}>{user.accountStatus === 'verified' ? 'Verified' : 'Pending Verification'}</span></p>
            <p className="text-gray-600 mb-4">Plan: <span className="font-semibold capitalize">{user.subscriptionTier || 'free'}</span></p>
            {!isPaid && (
              <button onClick={handleUpgrade} className="btn-primary">
                Upgrade to {user.userType === 'recruiter' ? 'Pro ($99/mo)' : 'Premium ($4.99/mo)'}
              </button>
            )}
          </div>
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Quick Links</h2>
            <div className="space-y-2">
              {user.userType === 'recruiter' ? (
                <>
                  <Link href="/company" className="block text-indigo-600 hover:underline">→ Company Profile</Link>
                  <Link href="/jobs" className="block text-indigo-600 hover:underline">→ Post a Job</Link>
                  <Link href="/discover" className="block text-indigo-600 hover:underline">→ Discover Candidates</Link>
                </>
              ) : (
                <>
                  <Link href="/discover" className="block text-indigo-600 hover:underline">→ Start Discovering</Link>
                  <Link href="/profile" className="block text-indigo-600 hover:underline">→ Edit Profile</Link>
                </>
              )}
              <Link href="/messages" className="block text-indigo-600 hover:underline">→ Messages</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
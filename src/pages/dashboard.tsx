import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Link from 'next/link'

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

  const handleLogout = () => { localStorage.clear(); router.push('/') }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">Hiring Platform</h1>
          <div className="flex gap-4 items-center">
            <span className="text-gray-700">{user.firstName} {user.lastName}</span>
            <button onClick={handleLogout} className="btn-secondary">Logout</button>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-bold mb-2">Welcome, {user.firstName}!</h2>
            <p className="text-gray-600 mb-4">Account Type: <span className="font-semibold">{user.user_type === 'recruiter' ? 'Recruiter' : 'Candidate'}</span></p>
            <p className="text-gray-600 mb-4">Email: {user.email}</p>
            <p className="text-gray-600 mb-4">Status: <span className="font-semibold text-green-600">{user.account_status === 'verified' ? 'Verified' : 'Pending Verification'}</span></p>
          </div>
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Quick Links</h2>
            <div className="space-y-2">
              <Link href="/discover" className="block text-indigo-600 hover:underline">→ Start Discovering</Link>
              <Link href="/profile" className="block text-indigo-600 hover:underline">→ Edit Profile</Link>
              <Link href="/messages" className="block text-indigo-600 hover:underline">→ Messages</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
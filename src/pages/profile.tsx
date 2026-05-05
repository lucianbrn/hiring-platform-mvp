import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function Profile() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userType = localStorage.getItem('userType')
    if (!token) { router.push('/auth/login'); return }
    if (userType === 'candidate') {
      axios.get('/api/candidates/profile?user_id=me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => { setProfile(r.data); setFormData(r.data); })
        .catch(e => console.error(e))
        .finally(() => setLoading(false))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    try {
      await axios.put('/api/candidates/profile?user_id=me', formData, { headers: { Authorization: `Bearer ${token}` } })
      alert('Profile updated!')
    } catch (e) {
      alert('Error updating profile')
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Degree Type</label>
              <input type="text" value={formData.degreeType || ''} onChange={(e) => setFormData({...formData, degreeType: e.target.value})} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
              <input type="text" value={formData.schoolName || ''} onChange={(e) => setFormData({...formData, schoolName: e.target.value})} className="input" />
            </div>
          </div>
          <button type="submit" className="btn-primary">Save Profile</button>
        </form>
      </div>
    </div>
  )
}
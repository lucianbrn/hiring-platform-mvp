import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function Profile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [completion, setCompletion] = useState(0)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userType = localStorage.getItem('userType')
    if (!token) { router.push('/auth/login'); return }
    if (userType !== 'candidate') { router.push('/dashboard'); return }
    axios.get('/api/candidates/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { setFormData(r.data); setCompletion(r.data.profileCompletionPct || 0) })
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  const set = (field: string, value: any) => setFormData((f: any) => ({ ...f, [field]: value }))
  const setList = (field: string, value: string) => set(field, value.split(',').map(s => s.trim()).filter(Boolean))
  const listValue = (field: string) => Array.isArray(formData[field]) ? formData[field].join(', ') : ''

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const token = localStorage.getItem('token')
    try {
      const r = await axios.put('/api/candidates/profile', {
        degreeType: formData.degreeType,
        degreeField: formData.degreeField,
        schoolName: formData.schoolName,
        gpa: formData.gpa,
        topSkills: formData.topSkills || [],
        preferredLocations: formData.preferredLocations || [],
        willingToRelocate: !!formData.willingToRelocate,
      }, { headers: { Authorization: `Bearer ${token}` } })
      setCompletion(r.data.profileCompletionPct || 0)
      alert('Profile updated!')
    } catch (e) {
      alert('Error updating profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Profile completion</span><span>{completion}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full transition-all" style={{ width: `${completion}%` }} />
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Degree Type</label>
              <select value={formData.degreeType || ''} onChange={(e) => set('degreeType', e.target.value)} className="input">
                <option value="">Select...</option>
                {['High School', 'Associate', 'Bachelor', 'Master', 'PhD'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Field of Study</label>
              <input type="text" value={formData.degreeField || ''} onChange={(e) => set('degreeField', e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
              <input type="text" value={formData.schoolName || ''} onChange={(e) => set('schoolName', e.target.value)} className="input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">GPA</label>
              <input type="number" step="0.01" min="0" max="4" value={formData.gpa ?? ''} onChange={(e) => set('gpa', e.target.value)} className="input" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Top Skills <span className="text-gray-400">(comma-separated)</span></label>
            <input type="text" value={listValue('topSkills')} onChange={(e) => setList('topSkills', e.target.value)} className="input" placeholder="JavaScript, React, Node.js" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Locations <span className="text-gray-400">(comma-separated)</span></label>
            <input type="text" value={listValue('preferredLocations')} onChange={(e) => setList('preferredLocations', e.target.value)} className="input" placeholder="San Francisco, Remote" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={!!formData.willingToRelocate} onChange={(e) => set('willingToRelocate', e.target.checked)} />
            <span className="text-sm text-gray-700">Willing to relocate</span>
          </label>
          <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Save Profile'}</button>
        </form>
      </div>
    </div>
  )
}

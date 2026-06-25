import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Link from 'next/link'
import NavBar from '@/components/NavBar'

export default function CompanyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [company, setCompany] = useState<any>(null)
  const [form, setForm] = useState<any>({})
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    if (localStorage.getItem('userType') !== 'recruiter') { router.push('/dashboard'); return }
    axios.get('/api/companies', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setCompany(r.data))
      .catch(() => { /* 404 = no company yet, show the create form */ })
      .finally(() => setLoading(false))
  }, [])

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError('')
    const token = localStorage.getItem('token')
    try {
      const r = await axios.post('/api/companies', form, { headers: { Authorization: `Bearer ${token}` } })
      setCompany(r.data)
      router.push('/jobs')
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not save company')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Company</h1>

        {company ? (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{company.companyName}</h2>
              {company.isVerified
                ? <span className="text-xs font-semibold bg-green-50 text-green-700 px-2 py-1 rounded-full">✓ Verified</span>
                : <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-2 py-1 rounded-full">Pending verification</span>}
            </div>
            {company.industry && <p className="text-gray-600 mb-1">{company.industry}{company.companySize ? ` · ${company.companySize}` : ''}</p>}
            {company.website && <p className="text-indigo-600 mb-3">{company.website}</p>}
            {company.description && <p className="text-gray-700 mb-6">{company.description}</p>}
            <Link href="/jobs" className="btn-primary inline-block">Manage Job Postings →</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="card space-y-5">
            <p className="text-gray-600">Set up your company profile to start posting jobs and discovering candidates.</p>
            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
              <input type="text" value={form.companyName || ''} onChange={e => set('companyName', e.target.value)} className="input" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                <input type="text" value={form.website || ''} onChange={e => set('website', e.target.value)} className="input" placeholder="https://" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <input type="text" value={form.industry || ''} onChange={e => set('industry', e.target.value)} className="input" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
              <select value={form.companySize || ''} onChange={e => set('companySize', e.target.value)} className="input">
                <option value="">Select...</option>
                {['1-10', '11-50', '51-200', '201-500', '500+'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea value={form.description || ''} onChange={e => set('description', e.target.value)} className="input" rows={3} />
            </div>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Saving...' : 'Create Company'}</button>
          </form>
        )}
      </div>
    </div>
  )
}

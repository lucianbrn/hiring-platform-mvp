import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Link from 'next/link'
import NavBar from '@/components/NavBar'

export default function JobsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [noCompany, setNoCompany] = useState(false)
  const [jobs, setJobs] = useState<any[]>([])
  const [form, setForm] = useState<any>({ remoteOption: 'onsite' })
  const [banner, setBanner] = useState('')
  const [error, setError] = useState('')

  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

  const loadJobs = () =>
    axios.get('/api/jobs', { headers: authHeader() })
      .then(r => setJobs(r.data.jobs || []))
      .catch(err => { if (err.response?.status === 404) setNoCompany(true) })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    if (localStorage.getItem('userType') !== 'recruiter') { router.push('/dashboard'); return }
    loadJobs().finally(() => setLoading(false))
  }, [])

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(''); setBanner('')
    try {
      const payload = {
        ...form,
        targetLocations: (form.targetLocationsText || '').split(',').map((s: string) => s.trim()).filter(Boolean),
      }
      const r = await axios.post('/api/jobs', payload, { headers: authHeader() })
      const n = r.data?.pooledCandidates ?? 0
      setBanner(`✅ "${r.data.jobTitle}" posted — ${n} candidate${n === 1 ? '' : 's'} auto-matched into your pool.`)
      setForm({ remoteOption: 'onsite' })
      await loadJobs()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not post job')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Job Postings</h1>

        {noCompany ? (
          <div className="card text-center">
            <p className="text-gray-600 mb-4">Create your company profile before posting jobs.</p>
            <Link href="/company" className="btn-primary inline-block">Set up company →</Link>
          </div>
        ) : (
          <>
            {banner && <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg mb-6">{banner}</div>}

            <form onSubmit={submit} className="card space-y-5 mb-10">
              <h2 className="text-xl font-bold">Post a new job</h2>
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">{error}</div>}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                <input type="text" value={form.jobTitle || ''} onChange={e => set('jobTitle', e.target.value)} className="input" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea value={form.jobDescription || ''} onChange={e => set('jobDescription', e.target.value)} className="input" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Min ($)</label>
                  <input type="number" value={form.salaryMin || ''} onChange={e => set('salaryMin', e.target.value)} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary Max ($)</label>
                  <input type="number" value={form.salaryMax || ''} onChange={e => set('salaryMax', e.target.value)} className="input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Required Degree</label>
                  <select value={form.requiredDegree || ''} onChange={e => set('requiredDegree', e.target.value)} className="input">
                    <option value="">No requirement</option>
                    {['High School', 'Associate', 'Bachelor', 'Master', 'PhD'].map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Work Mode</label>
                  <select value={form.remoteOption} onChange={e => set('remoteOption', e.target.value)} className="input">
                    {['onsite', 'hybrid', 'remote'].map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Locations <span className="text-gray-400">(comma-separated)</span></label>
                <input type="text" value={form.targetLocationsText || ''} onChange={e => set('targetLocationsText', e.target.value)} className="input" placeholder="San Francisco, Remote" />
              </div>
              <button type="submit" disabled={saving} className="btn-primary disabled:opacity-50">{saving ? 'Posting...' : 'Post Job & Match Candidates'}</button>
            </form>

            <h2 className="text-xl font-bold mb-4">Your jobs ({jobs.length})</h2>
            {!jobs.length ? (
              <p className="text-gray-500">No jobs posted yet.</p>
            ) : (
              <div className="space-y-3">
                {jobs.map(job => (
                  <div key={job.id} className="card flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{job.jobTitle}</h3>
                      <p className="text-gray-500 text-sm">
                        {job.requiredDegree || 'Any degree'} · {job.remoteOption}
                        {job.salaryMin ? ` · $${job.salaryMin.toLocaleString()}+` : ''}
                      </p>
                    </div>
                    <Link href={`/discover?jobId=${job.id}`} className="btn-secondary whitespace-nowrap">View matches →</Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

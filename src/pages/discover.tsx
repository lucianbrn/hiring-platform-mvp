import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import Link from 'next/link'
import NavBar from '@/components/NavBar'

const REASON_LABELS: [string, string][] = [
  ['meetsDegree', 'Degree'],
  ['meetsGpa', 'GPA'],
  ['hasSkills', 'Skills'],
  ['locationMatch', 'Location'],
]

export default function Discover() {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])
  const [jobId, setJobId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRecruiter, setIsRecruiter] = useState(false)

  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

  // Load the candidate pool for a given job (or the plain candidate list).
  const loadCandidates = (selectedJobId: string) =>
    axios.get(`/api/swipe/discover${selectedJobId ? `?jobId=${selectedJobId}` : ''}`, { headers: authHeader() })
      .then(r => { setItems(r.data.candidates || []); setCurrentIndex(0) })
      .catch(e => console.error(e))

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    const recruiter = localStorage.getItem('userType') === 'recruiter'
    setIsRecruiter(recruiter)

    if (recruiter) {
      // Recruiters discover candidates ranked against a specific job's match pool.
      axios.get('/api/jobs', { headers: authHeader() })
        .then(async r => {
          const list = r.data.jobs || []
          setJobs(list)
          const initial = (typeof router.query.jobId === 'string' && router.query.jobId) || list[0]?.id || ''
          setJobId(initial)
          await loadCandidates(initial)
        })
        .catch(() => {})
        .finally(() => setLoading(false))
    } else {
      // Candidates discover companies.
      axios.get('/api/swipe/discover', { headers: authHeader() })
        .then(r => setItems(r.data.companies || []))
        .catch(e => console.error(e))
        .finally(() => setLoading(false))
    }
  }, [router.isReady])

  const onJobChange = async (id: string) => { setJobId(id); setLoading(true); await loadCandidates(id); setLoading(false) }

  const handleSwipe = async (action: 'like' | 'pass') => {
    const item = items[currentIndex]
    if (isRecruiter) {
      try {
        await axios.post('/api/swipe/action', { candidateId: item.id, jobListingId: jobId || undefined, action }, { headers: authHeader() })
      } catch (e) { console.error(e) }
    }
    setCurrentIndex(currentIndex + 1)
  }

  if (loading) return <div className="min-h-screen bg-gray-50"><NavBar /><div className="flex items-center justify-center py-32">Loading...</div></div>

  // Recruiter with no jobs yet → prompt to post one.
  if (isRecruiter && !jobs.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <div className="max-w-md mx-auto px-4 py-24 text-center">
          <p className="text-gray-600 mb-4">Post a job to generate your matched candidate pool.</p>
          <Link href="/jobs" className="btn-primary inline-block">Post a job →</Link>
        </div>
      </div>
    )
  }

  const job = jobs.find(j => j.id === jobId)
  const done = !items.length || currentIndex >= items.length
  const item = done ? null : items[currentIndex]
  const score = item?.matchScore != null ? Math.round(parseFloat(item.matchScore) * 100) : null
  const reason = item?.matchReason || {}
  const title = isRecruiter ? `${item?.user?.firstName ?? ''} ${item?.user?.lastName ?? ''}`.trim() : item?.companyName

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 min-h-[calc(100vh-57px)] flex flex-col items-center justify-center p-4">
        {isRecruiter && jobs.length > 0 && (
          <div className="w-full max-w-md mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Matching for job</label>
            <select value={jobId} onChange={e => onJobChange(e.target.value)} className="input bg-white">
              {jobs.map(j => <option key={j.id} value={j.id}>{j.jobTitle}</option>)}
            </select>
          </div>
        )}

        {done ? (
          <div className="text-gray-500 py-16">No more cards{job ? ` for "${job.jobTitle}"` : ''}!</div>
        ) : (
          <div className="w-full max-w-md">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              <div className="relative h-64 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                {item.schoolName || item.companyName}
                {score != null && (
                  <span className="absolute top-4 right-4 bg-white/95 text-indigo-700 text-sm font-bold px-3 py-1 rounded-full shadow">
                    {score}% match
                  </span>
                )}
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-1">{title}</h2>
                <p className="text-gray-600 mb-3">{isRecruiter ? [item.user?.locationCity, item.user?.locationState].filter(Boolean).join(', ') : item.industry}</p>
                <p className="text-gray-700 mb-4">{item.degreeField || item.description}</p>

                {isRecruiter && score != null && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {REASON_LABELS.map(([key, label]) => (
                      <span key={key} className={`text-xs font-medium px-2 py-1 rounded-full ${reason[key] ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {reason[key] ? '✓' : '✕'} {label}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-4 justify-center">
                  <button onClick={() => handleSwipe('pass')} className="px-8 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:border-red-500 hover:text-red-500 transition">
                    Pass
                  </button>
                  <button onClick={() => handleSwipe('like')} className="px-8 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition">
                    Like
                  </button>
                </div>
              </div>
            </div>
            <p className="text-center mt-6 text-gray-600">{currentIndex + 1} of {items.length}</p>
          </div>
        )}
      </div>
    </div>
  )
}

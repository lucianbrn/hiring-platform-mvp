import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function Discover() {
  const router = useRouter()
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isRecruiter, setIsRecruiter] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    setIsRecruiter(localStorage.getItem('userType') === 'recruiter')

    axios.get('/api/swipe/discover', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setItems(r.data.candidates || r.data.companies || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  const handleSwipe = async (action: 'like' | 'pass') => {
    const token = localStorage.getItem('token')
    const item = items[currentIndex]
    // The swipe endpoint records recruiter -> candidate interactions. Candidates
    // browsing companies just advance locally (no candidate->company action yet).
    if (isRecruiter) {
      try {
        await axios.post('/api/swipe/action', { candidateId: item.id, action }, { headers: { Authorization: `Bearer ${token}` } })
      } catch (e) { console.error(e) }
    }
    setCurrentIndex(currentIndex + 1)
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  if (!items.length || currentIndex >= items.length) return <div className="flex items-center justify-center min-h-screen text-gray-500">No more cards!</div>

  const item = items[currentIndex]
  const title = isRecruiter
    ? `${item.user?.firstName ?? ''} ${item.user?.lastName ?? ''}`.trim()
    : item.companyName
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="h-64 bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
            {item.schoolName || item.companyName}
          </div>
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-2">{title}</h2>
            <p className="text-gray-600 mb-4">{isRecruiter ? [item.user?.locationCity, item.user?.locationState].filter(Boolean).join(', ') : item.industry}</p>
            <p className="text-gray-700 mb-6">{item.degreeField || item.description}</p>
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
    </div>
  )
}
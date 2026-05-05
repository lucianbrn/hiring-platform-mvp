import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'

export default function Messages() {
  const router = useRouter()
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    
    axios.get('/api/messaging/conversations', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setConversations(r.data.conversations || []))
      .catch(e => console.error(e))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>
        {!conversations.length ? (
          <div className="text-center text-gray-500 py-12">No conversations yet</div>
        ) : (
          <div className="space-y-4">
            {conversations.map(conv => (
              <div key={conv.id} className="card hover:shadow-md transition cursor-pointer">
                <h3 className="font-semibold text-lg mb-1">{conv.recruiter?.firstName || conv.candidate?.firstName}</h3>
                <p className="text-gray-600 text-sm">{conv.recruiter?.company?.companyName}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
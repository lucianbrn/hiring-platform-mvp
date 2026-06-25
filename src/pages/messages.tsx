import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import axios from 'axios'
import NavBar from '@/components/NavBar'

export default function Messages() {
  const router = useRouter()
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [draft, setDraft] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` })

  const loadConversations = () => {
    return axios.get('/api/messaging/conversations', { headers: authHeader() })
      .then(r => setConversations(r.data.conversations || []))
      .catch(e => console.error(e))
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    setUserId(localStorage.getItem('userId'))
    loadConversations().finally(() => setLoading(false))
  }, [])

  const openConversation = async (conv: any) => {
    setActive(conv)
    setMessages([])
    try {
      const r = await axios.get(`/api/messaging/messages?conversationId=${conv.id}`, { headers: authHeader() })
      setMessages(r.data.messages || [])
    } catch (e) { console.error(e) }
  }

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.trim() || !active) return
    setSending(true)
    try {
      await axios.post('/api/messaging/send', { conversationId: active.id, content: draft }, { headers: authHeader() })
      setDraft('')
      await openConversation(active)
      await loadConversations()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const titleFor = (conv: any) => {
    // Show the other participant: recruiters see the candidate, candidates see the recruiter.
    const r = conv.recruiter || {}
    const c = conv.candidate || {}
    const recruiterName = `${r.firstName || ''} ${r.lastName || ''}`.trim()
    const candidateName = `${c.firstName || ''} ${c.lastName || ''}`.trim()
    return conv.recruiterId === userId ? (candidateName || 'Candidate') : (recruiterName || 'Recruiter')
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>
        {!conversations.length ? (
          <div className="text-center text-gray-500 py-12">No conversations yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3 md:col-span-1">
              {conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv)}
                  className={`card w-full text-left hover:shadow-md transition ${active?.id === conv.id ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  <h3 className="font-semibold text-lg mb-1">{titleFor(conv)}</h3>
                  <p className="text-gray-600 text-sm">{conv.recruiter?.company?.companyName}</p>
                  <p className="text-gray-400 text-xs mt-1 truncate">{conv.messages?.[0]?.content || 'No messages yet'}</p>
                </button>
              ))}
            </div>
            <div className="md:col-span-2">
              {!active ? (
                <div className="card text-center text-gray-500 py-12">Select a conversation</div>
              ) : (
                <div className="card flex flex-col h-[28rem]">
                  <h2 className="font-bold text-lg mb-4 border-b pb-2">{titleFor(active)}</h2>
                  <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                    {messages.length === 0 ? (
                      <p className="text-gray-400 text-sm">No messages yet. Say hello!</p>
                    ) : messages.map(m => (
                      <div key={m.id} className={`flex ${m.senderId === userId ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${m.senderId === userId ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'}`}>
                          {m.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  <form onSubmit={sendReply} className="flex gap-2">
                    <input
                      type="text"
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      placeholder="Type a message..."
                      className="input flex-1"
                    />
                    <button type="submit" disabled={sending || !draft.trim()} className="btn-primary disabled:opacity-50">
                      {sending ? '...' : 'Send'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

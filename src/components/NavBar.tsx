import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

// Shared top navigation for the authenticated app. Links are role-aware:
// recruiters get Company/Jobs, candidates get Profile.
export default function NavBar() {
  const router = useRouter()
  const [userType, setUserType] = useState<string | null>(null)

  useEffect(() => { setUserType(localStorage.getItem('userType')) }, [])

  const links: [string, string][] = userType === 'recruiter'
    ? [['/dashboard', 'Dashboard'], ['/company', 'Company'], ['/jobs', 'Jobs'], ['/discover', 'Discover'], ['/messages', 'Messages']]
    : [['/dashboard', 'Dashboard'], ['/discover', 'Discover'], ['/profile', 'Profile'], ['/messages', 'Messages']]

  const logout = () => { localStorage.clear(); router.push('/') }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold text-indigo-600">Hiring Platform</Link>
        <div className="flex gap-1 items-center">
          {links.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                router.pathname === href
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          ))}
          <button onClick={logout} className="ml-2 text-sm text-gray-500 hover:text-gray-800 px-3 py-2">Logout</button>
        </div>
      </div>
    </nav>
  )
}

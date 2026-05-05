import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
      <div className="text-center text-white px-4">
        <h1 className="text-6xl font-bold mb-4">Hiring Platform</h1>
        <p className="text-xl mb-8 opacity-90">Private swipe-based hiring for full-time careers</p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/auth/login" className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            Sign In
          </Link>
          <Link href="/auth/register" className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
            Sign Up
          </Link>
        </div>
        <p className="mt-8 text-sm opacity-75">Built with Next.js, PostgreSQL, Stripe</p>
      </div>
    </div>
  )
}
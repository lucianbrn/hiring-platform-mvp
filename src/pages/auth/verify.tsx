export default function Verify() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">Verify Your Account</h2>
        <p className="text-gray-600 mb-6">Check your email for a verification code. Once verified, you can sign in and start using the platform.</p>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 text-indigo-700 text-sm">
          <strong>Account Status:</strong> Pending verification
        </div>
      </div>
    </div>
  )
}
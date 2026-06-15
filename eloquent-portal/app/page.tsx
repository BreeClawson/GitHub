import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-violet-950 via-violet-800 to-purple-900 text-white px-4">
      <div className="text-center max-w-lg">
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">Eloquent Digital Marketing</h1>
          <p className="text-violet-200 text-lg">Your client portal — everything in one place.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="px-8 py-3 bg-white text-violet-900 font-semibold rounded-xl hover:bg-violet-50 transition">Sign In</Link>
          <Link href="/register" className="px-8 py-3 border border-white/40 text-white font-semibold rounded-xl hover:bg-white/10 transition">Create Account</Link>
        </div>
      </div>
    </main>
  )
}

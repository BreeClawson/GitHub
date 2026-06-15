'use client'
import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'

export default function LoginPage() {
  const [state, formAction] = useActionState(login, undefined)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-950 via-violet-900 to-purple-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Eloquent Digital Marketing</h1>
          <p className="text-violet-300 mt-1 text-sm">Client Portal</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Sign in to your account</h2>
          {state?.error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{state.error}</div>}
          <form action={formAction} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input id="email" name="email" type="email" autoComplete="email" required className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition" placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full rounded-lg bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-800 transition">Sign in</button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">Don&apos;t have an account?{' '}<Link href="/register" className="font-medium text-violet-700 hover:underline">Register here</Link></p>
        </div>
      </div>
    </div>
  )
}

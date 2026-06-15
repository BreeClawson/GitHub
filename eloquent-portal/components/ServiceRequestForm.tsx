'use client'
import { useState } from 'react'

const SERVICES = ['Social Media Management','Content Creation','SEO Optimization','Email Marketing','Paid Advertising','Website Design','Brand Strategy','Other']

export default function ServiceRequestForm({ onSuccess }: { onSuccess?: () => void }) {
  const [service, setService] = useState(SERVICES[0])
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) { setError('Please describe what you need'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/services', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ service, description, budget }) })
      if (!res.ok) { const data = await res.json() as { error?: string }; setError(data.error ?? 'Failed to submit') }
      else { setSuccess(true); setService(SERVICES[0]); setDescription(''); setBudget(''); onSuccess?.(); setTimeout(() => setSuccess(false), 6000) }
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold text-gray-800">Request a Service</h2>
      {success && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 font-medium">Request submitted! We will review it and get back to you shortly.</div>}
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
        <div><label className="mb-1.5 block text-sm font-medium text-gray-700">Service Type</label><select value={service} onChange={e => setService(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200">{SERVICES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
        <div><label className="mb-1.5 block text-sm font-medium text-gray-700">Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} required placeholder="Describe what you need and any specific goals..." className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 resize-none" /></div>
        <div><label className="mb-1.5 block text-sm font-medium text-gray-700">Budget <span className="text-gray-400 font-normal">(optional)</span></label><input type="text" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. $500/month or $2,000 one-time" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200" /></div>
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition">{loading ? 'Submitting…' : 'Submit Request'}</button>
      </form>
    </div>
  )
}

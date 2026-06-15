'use client'
import { useState } from 'react'

const TITLES = ['Strategy Call', 'Monthly Review', 'New Project Discussion', 'General Consultation']
const DURATIONS = [{ value: 30, label: '30 minutes' }, { value: 60, label: '60 minutes' }, { value: 90, label: '90 minutes' }]

export default function BookingForm({ onSuccess }: { onSuccess?: () => void }) {
  const [title, setTitle] = useState(TITLES[0])
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [duration, setDuration] = useState(60)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) { setError('Please select a date and time'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description, date, duration }) })
      if (!res.ok) { const data = await res.json() as { error?: string }; setError(data.error ?? 'Failed to book') }
      else { setSuccess(true); setTitle(TITLES[0]); setDescription(''); setDate(''); setDuration(60); onSuccess?.(); setTimeout(() => setSuccess(false), 5000) }
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-5 text-lg font-semibold text-gray-800">Schedule a Meeting</h2>
      {success && <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 font-medium">Booking request submitted! We will confirm shortly.</div>}
      {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
      <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
        <div><label className="mb-1.5 block text-sm font-medium text-gray-700">Meeting Type</label><select value={title} onChange={e => setTitle(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200">{TITLES.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
        <div><label className="mb-1.5 block text-sm font-medium text-gray-700">Date & Time</label><input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} required className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200" /></div>
        <div><label className="mb-1.5 block text-sm font-medium text-gray-700">Duration</label><select value={duration} onChange={e => setDuration(Number(e.target.value))} className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200">{DURATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}</select></div>
        <div><label className="mb-1.5 block text-sm font-medium text-gray-700">Description <span className="text-gray-400 font-normal">(optional)</span></label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="What would you like to discuss?" className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 resize-none" /></div>
        <button type="submit" disabled={loading} className="w-full rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition">{loading ? 'Submitting…' : 'Request Booking'}</button>
      </form>
    </div>
  )
}

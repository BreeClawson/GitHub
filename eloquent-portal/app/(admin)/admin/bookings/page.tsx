import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800', completed: 'bg-emerald-100 text-emerald-800', cancelled: 'bg-gray-100 text-gray-600' }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status] ?? 'bg-gray-100 text-gray-800'}`}>{status}</span>
}

export default async function AdminBookingsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')
  const bookings = await prisma.booking.findMany({ orderBy: { date: 'desc' }, include: { user: { select: { id: true, email: true, profile: { select: { pointPerson: true, businessName: true } } } } } })
  const statusCounts = bookings.reduce<Record<string, number>>((acc, b) => { acc[b.status] = (acc[b.status] ?? 0) + 1; return acc }, {})
  const statuses = ['pending', 'confirmed', 'completed', 'cancelled']
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-violet-700 to-purple-700 px-8 py-6 text-white shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-violet-200">Admin</p>
        <h1 className="mt-1 text-2xl font-bold">Booking Management</h1>
      </div>
      <div className="rounded-xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm text-violet-800"><span className="font-semibold">Update booking status</span> via <code className="rounded bg-violet-100 px-1.5 py-0.5 font-mono text-xs">PUT /api/bookings</code> with booking <code className="rounded bg-violet-100 px-1.5 py-0.5 font-mono text-xs">id</code> and new <code className="rounded bg-violet-100 px-1.5 py-0.5 font-mono text-xs">status</code>.</div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statuses.map(s => {
          const accentMap: Record<string, string> = { pending: 'border-yellow-200 bg-yellow-50 text-yellow-900', confirmed: 'border-blue-200 bg-blue-50 text-blue-900', completed: 'border-emerald-200 bg-emerald-50 text-emerald-900', cancelled: 'border-gray-200 bg-gray-50 text-gray-700' }
          return <div key={s} className={`rounded-xl border px-5 py-4 ${accentMap[s]}`}><p className="text-xs font-semibold uppercase tracking-wider opacity-70 capitalize">{s}</p><p className="mt-1 text-2xl font-bold">{statusCounts[s] ?? 0}</p></div>
        })}
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr>{['Client','Title','Date & Time','Duration','Status','Meeting Link'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-100">
            {bookings.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">No bookings found.</td></tr> : bookings.map(b => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4"><p className="text-sm font-medium text-gray-900">{b.user.profile?.pointPerson ?? b.user.email}</p>{b.user.profile?.businessName && <p className="text-xs text-gray-400">{b.user.profile.businessName}</p>}</td>
                <td className="px-6 py-4"><p className="text-sm font-medium text-gray-800">{b.title}</p>{b.description && <p className="mt-0.5 max-w-xs truncate text-xs text-gray-500">{b.description}</p>}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700"><p>{new Date(b.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</p><p className="text-xs text-gray-500">{new Date(b.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p></td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{b.duration} min</td>
                <td className="whitespace-nowrap px-6 py-4"><StatusBadge status={b.status} /></td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">{b.meetingLink ? <a href={b.meetingLink} target="_blank" rel="noopener noreferrer" className="font-medium text-violet-600 hover:underline">Join</a> : <span className="text-gray-400">—</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

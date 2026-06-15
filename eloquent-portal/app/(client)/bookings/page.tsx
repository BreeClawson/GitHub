import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import BookingForm from '@/components/BookingForm'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800' }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>{status}</span>
}

export default async function BookingsPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  const bookings = await prisma.booking.findMany({ where: { userId: session.userId, date: { gte: new Date() } }, orderBy: { date: 'asc' } })
  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-violet-700 to-purple-700 px-8 py-6 text-white shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-violet-200">Schedule</p>
        <h1 className="mt-1 text-2xl font-bold">Bookings</h1>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Upcoming Meetings</h2>
          {bookings.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-gray-500">No upcoming bookings. Schedule one using the form!</div>
          ) : (
            <div className="space-y-3">
              {bookings.map(b => (
                <div key={b.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">{b.title}</p>
                      {b.description && <p className="mt-1 text-sm text-gray-500 truncate">{b.description}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span>{new Date(b.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <span>{new Date(b.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                        <span>{b.duration} min</span>
                        {b.meetingLink && <a href={b.meetingLink} target="_blank" rel="noopener noreferrer" className="font-medium text-violet-600 hover:underline">Join meeting</a>}
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div><h2 className="mb-4 text-lg font-semibold text-gray-800">Request a Meeting</h2><BookingForm /></div>
      </div>
    </div>
  )
}

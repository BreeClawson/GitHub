import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'

function StatCard({ label, value, accent }: { label: string; value: string | number; accent: string }) {
  return (
    <div className={`rounded-xl border px-6 py-5 ${accent}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { paid: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', overdue: 'bg-red-100 text-red-800', confirmed: 'bg-blue-100 text-blue-800', cancelled: 'bg-gray-100 text-gray-600' }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status] ?? 'bg-gray-100 text-gray-800'}`}>{status}</span>
}

export default async function AdminDashboardPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const [totalClients, paidInvoicesAgg, pendingInvoicesCount, unreadMessages, upcomingBookings, newServiceRequests, recentClients, recentBookings] = await Promise.all([
    prisma.user.count({ where: { role: { not: 'admin' } } }),
    prisma.invoice.aggregate({ where: { status: 'paid' }, _sum: { amount: true } }),
    prisma.invoice.count({ where: { status: 'pending' } }),
    prisma.message.count({ where: { receiverId: session.userId, read: false } }),
    prisma.booking.count({ where: { date: { gte: new Date() }, status: { not: 'cancelled' } } }),
    prisma.serviceRequest.count({ where: { status: 'new' } }),
    prisma.user.findMany({ where: { role: { not: 'admin' } }, orderBy: { createdAt: 'desc' }, take: 5, include: { profile: true } }),
    prisma.booking.findMany({ orderBy: { date: 'desc' }, take: 5, include: { user: { include: { profile: true } } } }),
  ])

  const totalRevenue = paidInvoicesAgg._sum.amount ?? 0

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-violet-700 to-purple-700 px-8 py-7 text-white shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-violet-200">Eloquent Digital Marketing</p>
        <h1 className="mt-1 text-3xl font-bold">Admin Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Clients" value={totalClients} accent="border-violet-200 bg-violet-50 text-violet-900" />
        <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} accent="border-green-200 bg-green-50 text-green-900" />
        <StatCard label="Pending Invoices" value={pendingInvoicesCount} accent="border-yellow-200 bg-yellow-50 text-yellow-900" />
        <StatCard label="Unread Messages" value={unreadMessages} accent="border-blue-200 bg-blue-50 text-blue-900" />
        <StatCard label="Upcoming Bookings" value={upcomingBookings} accent="border-indigo-200 bg-indigo-50 text-indigo-900" />
        <StatCard label="New Service Requests" value={newServiceRequests} accent="border-purple-200 bg-purple-50 text-purple-900" />
      </div>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Recent Clients</h2>
          <Link href="/admin/clients" className="text-sm font-medium text-violet-700 hover:underline">View all</Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>{['Email','Business','Point Person','Joined'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {recentClients.length === 0 ? <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">No clients yet.</td></tr> : recentClients.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-violet-700">{c.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{c.profile?.businessName ?? '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{c.profile?.pointPerson ?? '—'}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-sm font-medium text-violet-700 hover:underline">View all</Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>{['Client','Title','Date','Status'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {recentBookings.length === 0 ? <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-400">No bookings yet.</td></tr> : recentBookings.map(b => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">{b.user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium">{b.title}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{new Date(b.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="whitespace-nowrap px-6 py-4"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

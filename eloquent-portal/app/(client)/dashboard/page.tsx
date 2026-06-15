import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { paid: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', overdue: 'bg-red-100 text-red-800' }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status] ?? 'bg-gray-100 text-gray-800'}`}>{status}</span>
}

const quickLinks = [
  { href: '/profile', label: 'Profile', description: 'Update your business info', icon: '👤' },
  { href: '/invoices', label: 'Invoices', description: 'View & download invoices', icon: '🧾' },
  { href: '/messages', label: 'Messages', description: 'Chat with your team', icon: '💬' },
  { href: '/bookings', label: 'Book a Meeting', description: 'Schedule time with us', icon: '📅' },
  { href: '/services', label: 'Request Service', description: 'Submit a new request', icon: '⚡' },
]

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const [profile, recentInvoices, unreadCount, upcomingBookings, pendingInvoiceCount] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: session.userId } }),
    prisma.invoice.findMany({ where: { userId: session.userId }, orderBy: { createdAt: 'desc' }, take: 3 }),
    prisma.message.count({ where: { receiverId: session.userId, read: false } }),
    prisma.booking.count({ where: { userId: session.userId, date: { gte: new Date() }, status: { not: 'cancelled' } } }),
    prisma.invoice.count({ where: { userId: session.userId, status: 'pending' } }),
  ])

  const displayName = profile?.pointPerson ?? session.email

  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-violet-700 to-purple-700 px-8 py-7 text-white shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-violet-200">Welcome back</p>
        <h1 className="mt-1 text-3xl font-bold">{displayName}!</h1>
        {profile?.businessName && <p className="mt-1 text-violet-200 text-sm">{profile.businessName}</p>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 px-6 py-5"><p className="text-xs font-semibold uppercase tracking-wider text-yellow-700">Pending Invoices</p><p className="mt-2 text-4xl font-bold text-yellow-800">{pendingInvoiceCount}</p></div>
        <div className="rounded-xl border border-violet-200 bg-violet-50 px-6 py-5"><p className="text-xs font-semibold uppercase tracking-wider text-violet-700">Unread Messages</p><p className="mt-2 text-4xl font-bold text-violet-800">{unreadCount}</p></div>
        <div className="rounded-xl border border-green-200 bg-green-50 px-6 py-5"><p className="text-xs font-semibold uppercase tracking-wider text-green-700">Upcoming Bookings</p><p className="mt-2 text-4xl font-bold text-green-800">{upcomingBookings}</p></div>
      </div>
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-800">Quick Links</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {quickLinks.map(({ href, label, description, icon }) => (
            <Link key={href} href={href} className="group flex flex-col gap-2 rounded-xl border border-gray-200 bg-white px-5 py-5 shadow-sm transition hover:border-violet-300 hover:shadow-md">
              <span className="text-2xl">{icon}</span>
              <span className="font-semibold text-gray-800 group-hover:text-violet-700">{label}</span>
              <span className="text-xs text-gray-500">{description}</span>
            </Link>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Recent Invoices</h2>
          <Link href="/invoices" className="text-sm font-medium text-violet-700 hover:underline">View all</Link>
        </div>
        {recentInvoices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-gray-500">No invoices yet.</div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50"><tr>{['Invoice #','Description','Amount','Due Date','Status'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-100">
                {recentInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-violet-700">#{inv.number}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{inv.description}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="whitespace-nowrap px-6 py-4"><StatusBadge status={inv.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

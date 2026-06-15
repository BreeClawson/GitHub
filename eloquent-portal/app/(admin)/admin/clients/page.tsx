import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

export default async function AdminClientsPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')
  const clients = await prisma.user.findMany({ where: { role: { not: 'admin' } }, orderBy: { createdAt: 'desc' }, include: { profile: true } })
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Client Management</h1><p className="mt-1 text-sm text-gray-500">All registered clients and their profile details.</p></div>
      <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-4 py-1.5"><span className="text-sm font-semibold text-violet-800">{clients.length} {clients.length === 1 ? 'client' : 'clients'} total</span></div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr>{['Name (Point Person)','Business','Email','Phone','Joined'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-100">
            {clients.length === 0 ? <tr><td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-400">No clients registered yet.</td></tr> : clients.map(c => (
              <tr key={c.id} className="hover:bg-violet-50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{c.profile?.pointPerson ?? <span className="text-gray-400 italic">Not set</span>}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{c.profile?.businessName ?? <span className="text-gray-400 italic">Not set</span>}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-violet-700">{c.email}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{c.profile?.phone ?? <span className="text-gray-400 italic">—</span>}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

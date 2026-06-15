import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { paid: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', overdue: 'bg-red-100 text-red-800' }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status] ?? 'bg-gray-100 text-gray-800'}`}>{status}</span>
}

function fmt(amount: number) { return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` }

export default async function AdminInvoicesPage() {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')
  const [invoices, totals] = await Promise.all([
    prisma.invoice.findMany({ orderBy: { createdAt: 'desc' }, include: { user: { include: { profile: true } } } }),
    prisma.invoice.groupBy({ by: ['status'], _sum: { amount: true }, _count: { id: true } }),
  ])
  const totalsByStatus = totals.reduce<Record<string, { sum: number; count: number }>>((acc, row) => { acc[row.status] = { sum: row._sum.amount ?? 0, count: row._count.id }; return acc }, {})
  const statuses = ['paid', 'pending', 'overdue']
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Invoice Management</h1><p className="mt-1 text-sm text-gray-500">All invoices across all clients.</p></div>
      <div className="rounded-xl border border-violet-200 bg-violet-50 px-5 py-4 text-sm text-violet-800"><span className="font-semibold">To add an invoice:</span> Use <code className="rounded bg-violet-100 px-1.5 py-0.5 font-mono text-xs">POST /api/invoices</code> or insert directly into the database.</div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statuses.map(s => {
          const data = totalsByStatus[s] ?? { sum: 0, count: 0 }
          const accentMap: Record<string, string> = { paid: 'border-green-200 bg-green-50 text-green-900', pending: 'border-yellow-200 bg-yellow-50 text-yellow-900', overdue: 'border-red-200 bg-red-50 text-red-900' }
          return <div key={s} className={`rounded-xl border px-6 py-5 ${accentMap[s]}`}><p className="text-xs font-semibold uppercase tracking-wider opacity-70 capitalize">{s}</p><p className="mt-1 text-2xl font-bold">{fmt(data.sum)}</p><p className="mt-0.5 text-xs opacity-60">{data.count} invoice{data.count !== 1 ? 's' : ''}</p></div>
        })}
      </div>
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50"><tr>{['Client','Invoice #','Description','Amount','Due Date','Status'].map(h => <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-gray-100">
            {invoices.length === 0 ? <tr><td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400">No invoices found.</td></tr> : invoices.map(inv => (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-800">{inv.user.profile?.pointPerson ?? inv.user.email}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-violet-700">#{inv.number}</td>
                <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{inv.description}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-gray-900">{fmt(inv.amount)}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                <td className="whitespace-nowrap px-6 py-4"><StatusBadge status={inv.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { paid: 'bg-green-100 text-green-800', pending: 'bg-yellow-100 text-yellow-800', overdue: 'bg-red-100 text-red-800' }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status] ?? 'bg-gray-100 text-gray-800'}`}>{status}</span>
}

export default async function InvoicesPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  const invoices = await prisma.invoice.findMany({ where: { userId: session.userId }, orderBy: { createdAt: 'desc' } })
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Invoices</h1><p className="mt-1 text-sm text-gray-500">A complete record of all invoices for your account.</p></div>
      {invoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <p className="text-4xl mb-3">🧾</p>
          <p className="text-lg font-semibold text-gray-700">No invoices yet</p>
          <p className="mt-1 text-sm text-gray-500">Invoices will appear here once created for your account.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50"><tr>{['Invoice #','Description','Amount ($)','Due Date','Status'].map(h => <th key={h} className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map(inv => (
                <tr key={inv.id} className="hover:bg-violet-50 transition-colors">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-violet-700">#{inv.number}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{inv.description}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">${inv.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="whitespace-nowrap px-6 py-4"><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 text-xs text-gray-500">{invoices.length} invoice{invoices.length !== 1 ? 's' : ''} total</div>
        </div>
      )}
    </div>
  )
}

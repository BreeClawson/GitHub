import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import ServiceRequestForm from '@/components/ServiceRequestForm'

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = { new: 'bg-violet-100 text-violet-800', reviewing: 'bg-blue-100 text-blue-800', approved: 'bg-green-100 text-green-800', declined: 'bg-red-100 text-red-800' }
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>{status.replace('_', ' ')}</span>
}

export default async function ServicesPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  const serviceRequests = await prisma.serviceRequest.findMany({ where: { userId: session.userId }, orderBy: { createdAt: 'desc' } })
  return (
    <div className="space-y-8">
      <div className="rounded-2xl bg-gradient-to-r from-violet-700 to-purple-700 px-8 py-6 text-white shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-violet-200">Services</p>
        <h1 className="mt-1 text-2xl font-bold">Service Requests</h1>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Your Requests</h2>
          {serviceRequests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-gray-500">No service requests yet. Submit one using the form.</div>
          ) : (
            <div className="space-y-3">
              {serviceRequests.map(req => (
                <div key={req.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">{req.service}</p>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{req.description}</p>
                      {req.budget && <p className="mt-1.5 text-xs font-medium text-violet-700">Budget: {req.budget}</p>}
                      <p className="mt-2 text-xs text-gray-400">Submitted {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div><h2 className="mb-4 text-lg font-semibold text-gray-800">New Request</h2><ServiceRequestForm /></div>
      </div>
    </div>
  )
}

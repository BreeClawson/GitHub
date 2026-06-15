import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import Sidebar from '@/components/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'admin') redirect('/dashboard')
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role="admin" />
      <main className="ml-64 min-h-screen overflow-y-auto p-8">{children}</main>
    </div>
  )
}

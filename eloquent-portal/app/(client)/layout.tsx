import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import Sidebar from '@/components/Sidebar'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role === 'admin') redirect('/admin/dashboard')
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role="client" />
      <main className="ml-64 min-h-screen overflow-y-auto p-8">{children}</main>
    </div>
  )
}

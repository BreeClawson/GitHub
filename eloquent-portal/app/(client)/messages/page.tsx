import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import MessageThread from '@/components/MessageThread'

export default async function MessagesPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const admin = await prisma.user.findFirst({ where: { role: 'admin' }, select: { id: true, email: true, profile: { select: { pointPerson: true } } } })
  if (!admin) return <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center text-gray-500">Messaging is not available yet.</div>

  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: session.userId, receiverId: admin.id }, { receiverId: session.userId, senderId: admin.id }] },
    include: { sender: { select: { id: true, email: true, role: true, profile: { select: { pointPerson: true, businessName: true } } } } },
    orderBy: { createdAt: 'asc' },
  })

  await prisma.message.updateMany({ where: { receiverId: session.userId, read: false }, data: { read: true } })

  const adminName = admin.profile?.pointPerson ?? admin.email

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-violet-700 to-purple-700 px-8 py-6 text-white shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-violet-200">Messages</p>
        <h1 className="mt-1 text-2xl font-bold">Your Conversation</h1>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-violet-700 font-bold text-sm">{adminName.charAt(0).toUpperCase()}</div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">{adminName}</p>
            <p className="text-xs text-gray-500">Eloquent Digital Marketing</p>
          </div>
        </div>
        <div className="h-[520px] flex flex-col p-4">
          <MessageThread messages={messages.map(m => ({ ...m, createdAt: m.createdAt.toISOString() }))} currentUserId={session.userId} partnerId={admin.id} />
        </div>
      </div>
    </div>
  )
}

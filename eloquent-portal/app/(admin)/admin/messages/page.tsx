import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MessageThread from '@/components/MessageThread'

export default async function AdminMessagesPage({ searchParams }: { searchParams: Promise<{ client?: string }> }) {
  const session = await getSession()
  if (!session || session.role !== 'admin') redirect('/login')

  const { client: selectedClientId } = await searchParams

  const clients = await prisma.user.findMany({
    where: { role: { not: 'admin' } },
    orderBy: { createdAt: 'desc' },
    include: { profile: { select: { pointPerson: true, businessName: true } } },
  })

  const clientSummaries = await Promise.all(clients.map(async (client) => {
    const [lastMessage, unreadCount] = await Promise.all([
      prisma.message.findFirst({ where: { OR: [{ senderId: client.id, receiverId: session.userId }, { senderId: session.userId, receiverId: client.id }] }, orderBy: { createdAt: 'desc' } }),
      prisma.message.count({ where: { senderId: client.id, receiverId: session.userId, read: false } }),
    ])
    return { client, lastMessage, unreadCount }
  }))

  clientSummaries.sort((a, b) => {
    if (a.lastMessage && b.lastMessage) return b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
    if (a.lastMessage) return -1
    if (b.lastMessage) return 1
    return 0
  })

  const threadMessages = selectedClientId ? await prisma.message.findMany({
    where: { OR: [{ senderId: selectedClientId, receiverId: session.userId }, { senderId: session.userId, receiverId: selectedClientId }] },
    include: { sender: { select: { id: true, email: true, role: true, profile: { select: { pointPerson: true, businessName: true } } } } },
    orderBy: { createdAt: 'asc' },
  }).then(async msgs => { await prisma.message.updateMany({ where: { senderId: selectedClientId, receiverId: session.userId, read: false }, data: { read: true } }); return msgs }) : null

  const selectedClient = selectedClientId ? clients.find(c => c.id === selectedClientId) : null

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-violet-700 to-purple-700 px-8 py-6 text-white shadow-lg">
        <p className="text-sm font-semibold uppercase tracking-widest text-violet-200">Admin</p>
        <h1 className="mt-1 text-2xl font-bold">Messages</h1>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-100 px-5 py-3"><h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Clients ({clients.length})</h2></div>
            {clientSummaries.length === 0 ? <p className="px-5 py-10 text-center text-sm text-gray-400">No clients yet.</p> : (
              <ul className="divide-y divide-gray-100">
                {clientSummaries.map(({ client, lastMessage, unreadCount }) => {
                  const isSelected = client.id === selectedClientId
                  const displayName = client.profile?.pointPerson ?? client.email
                  return (
                    <li key={client.id}>
                      <Link href={`/admin/messages?client=${client.id}`} className={`flex items-start gap-3 px-5 py-4 transition-colors hover:bg-violet-50 ${isSelected ? 'bg-violet-50 border-l-4 border-violet-600' : ''}`}>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">{displayName.charAt(0).toUpperCase()}</div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
                            {unreadCount > 0 && <span className="inline-flex items-center justify-center rounded-full bg-violet-600 px-2 py-0.5 text-xs font-bold text-white">{unreadCount}</span>}
                          </div>
                          {client.profile?.businessName && <p className="truncate text-xs text-gray-400">{client.profile.businessName}</p>}
                          <p className="mt-0.5 truncate text-xs text-gray-500">{lastMessage ? (lastMessage.content.length > 50 ? lastMessage.content.slice(0, 50) + '…' : lastMessage.content) : 'No messages yet'}</p>
                        </div>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
        <div className="lg:col-span-2">
          {selectedClient && threadMessages ? (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center gap-4 border-b border-gray-100 px-6 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">{(selectedClient.profile?.pointPerson ?? selectedClient.email).charAt(0).toUpperCase()}</div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedClient.profile?.pointPerson ?? selectedClient.email}</p>
                  {selectedClient.profile?.businessName && <p className="text-xs text-gray-500">{selectedClient.profile.businessName}</p>}
                </div>
              </div>
              <div className="h-[540px] flex flex-col p-4">
                <MessageThread messages={threadMessages.map(m => ({ id: m.id, senderId: m.senderId, receiverId: m.receiverId, content: m.content, read: m.read, createdAt: m.createdAt.toISOString(), sender: m.sender }))} currentUserId={session.userId} partnerId={selectedClient.id} />
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-center">
              <p className="text-sm text-gray-500">Select a client from the list to view their conversation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

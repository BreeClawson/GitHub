import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

async function getAdmin() { return prisma.user.findFirst({ where: { role: 'admin' } }) }

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = await getAdmin()
  if (!admin) return NextResponse.json({ error: 'No admin found' }, { status: 500 })
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: session.userId, receiverId: admin.id }, { receiverId: session.userId, senderId: admin.id }] },
    include: { sender: { select: { id: true, email: true, role: true, profile: { select: { pointPerson: true, businessName: true } } } } },
    orderBy: { createdAt: 'asc' },
  })
  await prisma.message.updateMany({ where: { receiverId: session.userId, read: false }, data: { read: true } })
  return NextResponse.json({ messages })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: Record<string, unknown>
  try { body = (await req.json()) as Record<string, unknown> } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const content = typeof body.content === 'string' ? body.content.trim() : ''
  if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 })
  let receiverId: string
  if (session.role === 'admin') {
    receiverId = typeof body.receiverId === 'string' ? body.receiverId : ''
    if (!receiverId) return NextResponse.json({ error: 'receiverId required' }, { status: 400 })
  } else {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No admin found' }, { status: 500 })
    receiverId = admin.id
  }
  const message = await prisma.message.create({ data: { senderId: session.userId, receiverId, content }, include: { sender: { select: { id: true, email: true, role: true, profile: { select: { pointPerson: true, businessName: true } } } } } })
  return NextResponse.json({ message }, { status: 201 })
}

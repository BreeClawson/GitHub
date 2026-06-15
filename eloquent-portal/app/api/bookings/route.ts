import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const bookings = await prisma.booking.findMany({ where: { userId: session.userId }, orderBy: { date: 'asc' } })
  return NextResponse.json({ bookings })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: Record<string, unknown>
  try { body = (await req.json()) as Record<string, unknown> } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const dateStr = typeof body.date === 'string' ? body.date : ''
  if (!title || !dateStr) return NextResponse.json({ error: 'title and date required' }, { status: 400 })
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return NextResponse.json({ error: 'Invalid date' }, { status: 400 })
  const duration = typeof body.duration === 'number' ? body.duration : Number(body.duration) || 60
  const description = typeof body.description === 'string' ? body.description.trim() || null : null
  const booking = await prisma.booking.create({ data: { userId: session.userId, title, description, date, duration } })
  return NextResponse.json({ booking }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  let body: Record<string, unknown>
  try { body = (await req.json()) as Record<string, unknown> } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const id = typeof body.id === 'string' ? body.id : ''
  const status = typeof body.status === 'string' ? body.status : ''
  if (!id || !status) return NextResponse.json({ error: 'id and status required' }, { status: 400 })
  const data: Record<string, unknown> = { status }
  if (typeof body.meetingLink === 'string') data.meetingLink = body.meetingLink || null
  if (typeof body.notes === 'string') data.notes = body.notes || null
  const booking = await prisma.booking.update({ where: { id }, data })
  return NextResponse.json({ booking })
}

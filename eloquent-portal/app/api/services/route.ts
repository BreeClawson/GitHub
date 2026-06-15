import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const serviceRequests = await prisma.serviceRequest.findMany({ where: { userId: session.userId }, orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ serviceRequests })
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: Record<string, unknown>
  try { body = (await req.json()) as Record<string, unknown> } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const service = typeof body.service === 'string' ? body.service.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''
  if (!service || !description) return NextResponse.json({ error: 'service and description required' }, { status: 400 })
  const budget = typeof body.budget === 'string' ? body.budget.trim() || null : null
  const serviceRequest = await prisma.serviceRequest.create({ data: { userId: session.userId, service, description, budget } })
  return NextResponse.json({ serviceRequest }, { status: 201 })
}

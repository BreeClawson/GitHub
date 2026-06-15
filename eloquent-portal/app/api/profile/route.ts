import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let body: Record<string, unknown>
  try { body = (await req.json()) as Record<string, unknown> } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const { photoUrl, businessName, pointPerson, phone, email, website, facebook, instagram, linkedin, title, bio } = body
  const data = {
    photoUrl: typeof photoUrl === 'string' ? photoUrl : null,
    businessName: typeof businessName === 'string' ? businessName.trim() || null : null,
    pointPerson: typeof pointPerson === 'string' ? pointPerson.trim() || null : null,
    phone: typeof phone === 'string' ? phone.trim() || null : null,
    email: typeof email === 'string' ? email.trim() || null : null,
    website: typeof website === 'string' ? website.trim() || null : null,
    facebook: typeof facebook === 'string' ? facebook.trim() || null : null,
    instagram: typeof instagram === 'string' ? instagram.trim() || null : null,
    linkedin: typeof linkedin === 'string' ? linkedin.trim() || null : null,
    title: typeof title === 'string' ? title.trim() || null : null,
    bio: typeof bio === 'string' ? bio.trim() || null : null,
  }
  try {
    await prisma.profile.upsert({ where: { userId: session.userId }, update: data, create: { userId: session.userId, ...data } })
    return NextResponse.json({ success: true })
  } catch (err) { console.error(err); return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 }) }
}

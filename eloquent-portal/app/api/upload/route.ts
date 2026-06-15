import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  let formData: FormData
  try { formData = await req.formData() } catch { return NextResponse.json({ error: 'Invalid form data' }, { status: 400 }) }
  const file = formData.get('file')
  if (!file || !(file instanceof Blob)) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  const originalName = file instanceof File ? file.name : 'upload'
  const safeOriginalName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filename = `${Date.now()}-${safeOriginalName}`
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadsDir, { recursive: true })
  await writeFile(path.join(uploadsDir, filename), Buffer.from(await file.arrayBuffer()))
  return NextResponse.json({ url: `/uploads/${filename}` })
}

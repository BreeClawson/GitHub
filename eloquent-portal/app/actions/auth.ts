'use server'
import { prisma } from '@/lib/prisma'
import { createSession, deleteSession } from '@/lib/session'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'

export async function register(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const name = formData.get('name') as string
  if (!email || !password) return { error: 'Email and password required' }
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { error: 'Email already registered' }
  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, password: hashed, profile: { create: { pointPerson: name, email } } },
  })
  await createSession({ userId: user.id, role: user.role, email: user.email })
  redirect('/dashboard')
}

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { error: 'Invalid email or password' }
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return { error: 'Invalid email or password' }
  await createSession({ userId: user.id, role: user.role, email: user.email })
  if (user.role === 'admin') redirect('/admin/dashboard')
  redirect('/dashboard')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const secretKey = new TextEncoder().encode(process.env.SESSION_SECRET)
const publicPaths = ['/login', '/register', '/']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isPublic = publicPaths.some(p => path === p || path.startsWith('/api/upload'))
  const token = request.cookies.get('session')?.value

  if (!token) {
    if (isPublic) return NextResponse.next()
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const { payload } = await jwtVerify(token, secretKey, { algorithms: ['HS256'] })
    const role = payload.role as string
    if (path.startsWith('/admin') && role !== 'admin') return NextResponse.redirect(new URL('/dashboard', request.url))
    if ((path === '/login' || path === '/register') && token) return NextResponse.redirect(new URL(role === 'admin' ? '/admin/dashboard' : '/dashboard', request.url))
    return NextResponse.next()
  } catch {
    if (isPublic) return NextResponse.next()
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'] }

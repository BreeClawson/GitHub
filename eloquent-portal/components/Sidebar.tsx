'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'

interface SidebarProps { role: 'client' | 'admin' }

const clientLinks = [
  { href: '/dashboard', label: '🏠 Dashboard' },
  { href: '/profile', label: '👤 Profile' },
  { href: '/invoices', label: '🧾 Invoices' },
  { href: '/messages', label: '💬 Messages' },
  { href: '/bookings', label: '📅 Bookings' },
  { href: '/services', label: '⚡ Services' },
]

const adminLinks = [
  { href: '/admin/dashboard', label: '🏠 Dashboard' },
  { href: '/admin/clients', label: '👥 Clients' },
  { href: '/admin/invoices', label: '🧾 Invoices' },
  { href: '/admin/messages', label: '💬 Messages' },
  { href: '/admin/bookings', label: '📅 Bookings' },
]

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname()
  const links = role === 'admin' ? adminLinks : clientLinks
  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-violet-900 text-white flex flex-col z-20">
      <div className="px-5 py-6 border-b border-violet-800">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-400">Eloquent Digital Marketing</p>
        <p className="text-lg font-bold text-white mt-0.5">Client Portal</p>
        {role === 'admin' && <span className="inline-block mt-1.5 rounded-full bg-violet-600 px-2 py-0.5 text-xs font-medium text-violet-100">Admin</span>}
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {links.map(({ href, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href} className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${ isActive ? 'bg-violet-700 text-white' : 'text-violet-200 hover:bg-violet-800 hover:text-white' }`}>{label}</Link>
          )
        })}
      </nav>
      <div className="px-3 py-4 border-t border-violet-800">
        <form action={logout}>
          <button type="submit" className="w-full flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-violet-200 hover:bg-violet-800 hover:text-white transition-colors">🚪 Sign out</button>
        </form>
      </div>
    </aside>
  )
}

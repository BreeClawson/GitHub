import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import ProfileForm from '@/components/ProfileForm'

export default async function ProfilePage() {
  const session = await getSession()
  if (!session) redirect('/login')
  const profile = await prisma.profile.findUnique({ where: { userId: session.userId } })
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Keep your business information up to date so your team can serve you better.</p>
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <ProfileForm profile={profile} userId={session.userId} />
      </div>
    </div>
  )
}

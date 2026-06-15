'use client'
import { useState, useRef, ChangeEvent, FormEvent } from 'react'
import Image from 'next/image'

export type Profile = {
  id: string; userId: string; photoUrl: string | null; businessName: string | null;
  pointPerson: string | null; phone: string | null; email: string | null;
  website: string | null; facebook: string | null; instagram: string | null;
  linkedin: string | null; title: string | null; bio: string | null;
  createdAt: Date; updatedAt: Date;
}

export default function ProfileForm({ profile, userId }: { profile: Profile | null; userId: string }) {
  const [status, setStatus] = useState<'idle'|'saving'|'success'|'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile?.photoUrl ?? null)
  const [photoUrl, setPhotoUrl] = useState<string | null>(profile?.photoUrl ?? null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    businessName: profile?.businessName ?? '', pointPerson: profile?.pointPerson ?? '',
    phone: profile?.phone ?? '', email: profile?.email ?? '', website: profile?.website ?? '',
    facebook: profile?.facebook ?? '', instagram: profile?.instagram ?? '', linkedin: profile?.linkedin ?? '',
    title: profile?.title ?? '', bio: profile?.bio ?? '',
  })

  function handleChange(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoPreview(URL.createObjectURL(file))
    const fd = new FormData()
    fd.append('file', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload failed')
      const data = (await res.json()) as { url: string }
      setPhotoUrl(data.url)
    } catch { setErrorMsg('Photo upload failed.'); setStatus('error') }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus('saving')
    setErrorMsg('')
    try {
      const res = await fetch('/api/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, photoUrl }) })
      const data = (await res.json()) as { success?: boolean; error?: string }
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Failed to save')
      setStatus('success')
    } catch (err) { setErrorMsg(err instanceof Error ? err.message : 'An error occurred'); setStatus('error') }
  }

  const inputCls = 'w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-200 transition'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
      <div className="px-8 py-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Profile Photo</h2>
        <div className="flex items-center gap-6">
          <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-full bg-violet-100">
            {photoPreview ? <Image src={photoPreview} alt="Profile" fill className="object-cover" unoptimized /> : <span className="flex h-full w-full items-center justify-center text-3xl text-violet-400">👤</span>}
          </div>
          <div>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-lg border border-violet-300 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-100 transition">{photoPreview ? 'Change photo' : 'Upload photo'}</button>
            <p className="mt-1.5 text-xs text-gray-500">JPG, PNG or GIF. Max 5 MB.</p>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </div>
        </div>
      </div>
      <div className="px-8 py-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Business Information</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div><label className={labelCls}>Business Name</label><input name="businessName" value={form.businessName} onChange={handleChange} className={inputCls} placeholder="Acme Inc." /></div>
          <div><label className={labelCls}>Point of Contact</label><input name="pointPerson" value={form.pointPerson} onChange={handleChange} className={inputCls} placeholder="Jane Smith" /></div>
          <div><label className={labelCls}>Title / Role</label><input name="title" value={form.title} onChange={handleChange} className={inputCls} placeholder="CEO" /></div>
          <div><label className={labelCls}>Phone (textable)</label><input name="phone" type="tel" value={form.phone} onChange={handleChange} className={inputCls} placeholder="+1 (555) 000-0000" /></div>
          <div><label className={labelCls}>Email</label><input name="email" type="email" value={form.email} onChange={handleChange} className={inputCls} placeholder="you@company.com" /></div>
          <div><label className={labelCls}>Website</label><input name="website" type="url" value={form.website} onChange={handleChange} className={inputCls} placeholder="https://yoursite.com" /></div>
          <div className="sm:col-span-2"><label className={labelCls}>Bio / Business Overview</label><textarea name="bio" value={form.bio} onChange={handleChange} rows={4} className={inputCls} placeholder="Tell us about your business..." /></div>
        </div>
      </div>
      <div className="px-8 py-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Social Links</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div><label className={labelCls}>Facebook</label><input name="facebook" type="url" value={form.facebook} onChange={handleChange} className={inputCls} placeholder="https://facebook.com/page" /></div>
          <div><label className={labelCls}>Instagram</label><input name="instagram" type="url" value={form.instagram} onChange={handleChange} className={inputCls} placeholder="https://instagram.com/handle" /></div>
          <div><label className={labelCls}>LinkedIn</label><input name="linkedin" type="url" value={form.linkedin} onChange={handleChange} className={inputCls} placeholder="https://linkedin.com/in/you" /></div>
        </div>
      </div>
      <div className="px-8 py-5 flex items-center justify-between gap-4">
        <div className="flex-1">
          {status === 'success' && <p className="text-sm font-medium text-green-700">Profile saved successfully!</p>}
          {status === 'error' && <p className="text-sm font-medium text-red-700">{errorMsg || 'Something went wrong.'}</p>}
        </div>
        <button type="submit" disabled={status === 'saving'} className="rounded-lg bg-violet-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-60 transition">{status === 'saving' ? 'Saving...' : 'Save Profile'}</button>
      </div>
    </form>
  )
}

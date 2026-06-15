'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

interface Message {
  id: string; senderId: string; receiverId: string; content: string; read: boolean; createdAt: string;
  sender: { id: string; email: string; role: string; profile: { pointPerson: string | null; businessName: string | null } | null }
}

export default function MessageThread({ messages: initialMessages, currentUserId, partnerId }: { messages: Message[]; currentUserId: string; partnerId: string }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/messages')
      if (res.ok) { const data = await res.json() as { messages: Message[] }; setMessages(data.messages) }
    } catch {}
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { const interval = setInterval(fetchMessages, 5000); return () => clearInterval(interval) }, [fetchMessages])

  const handleSend = async () => {
    const trimmed = content.trim()
    if (!trimmed || sending) return
    setSending(true); setError('')
    try {
      const res = await fetch('/api/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: trimmed, receiverId: partnerId }) })
      if (!res.ok) { const data = await res.json() as { error?: string }; setError(data.error ?? 'Failed to send') }
      else { setContent(''); await fetchMessages() }
    } catch { setError('Network error') }
    finally { setSending(false) }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-gray-50 rounded-xl min-h-0">
        {messages.length === 0 && <p className="text-center text-sm text-gray-400 mt-8">No messages yet. Start the conversation!</p>}
        {messages.map(msg => {
          const isOwn = msg.senderId === currentUserId
          const senderName = msg.sender.profile?.pointPerson ?? msg.sender.email
          const time = new Date(msg.createdAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
          const date = new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {!isOwn && <span className="text-xs text-gray-500 font-medium px-1">{senderName}</span>}
                <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${isOwn ? 'bg-violet-600 text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'}`}>{msg.content}</div>
                <span className="text-xs text-gray-400 px-1">{date} {time}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <textarea value={content} onChange={e => setContent(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSend() } }} placeholder="Type a message… (Enter to send)" rows={2} className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200 resize-none" />
          <button onClick={() => void handleSend()} disabled={sending || !content.trim()} className="self-end rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50 transition">{sending ? 'Sending…' : 'Send'}</button>
        </div>
      </div>
    </div>
  )
}

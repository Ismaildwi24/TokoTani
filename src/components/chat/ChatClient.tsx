'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeftIcon,
  PaperClipIcon,
  ArrowUpIcon,
  ArrowTopRightOnSquareIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline'

interface Message {
  id: string
  content: string | null
  attachmentUrl: string | null
  senderId: string
  createdAt: string
}

interface ChatClientProps {
  conversation: {
    id: string
    customer: { id: string; fullName: string; avatarUrl: string | null }
    petani: {
      userId: string
      farmName: string
      user: { fullName: string; avatarUrl: string | null }
    }
    order?: {
      id: string
      orderCode: string
      orderSellers: Array<{
        status: string
        items: Array<{
          productNameSnapshot: string
          quantity: number
          product: { images: Array<{ url: string }> }
        }>
      }>
      shippingAddress: { fullAddress: string; city: string; province: string }
    } | null
  }
  messages: Message[]
  currentUserId: string
}

export default function ChatClient({ conversation, messages: initialMessages, currentUserId }: ChatClientProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const isPetani = currentUserId === conversation.petani.userId
  const otherName = isPetani
    ? conversation.customer.fullName
    : conversation.petani.user.fullName
  const otherAvatar = isPetani
    ? conversation.customer.avatarUrl
    : conversation.petani.user.avatarUrl

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || sending) return
    setSending(true)
    const msgText = text
    setText('')
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: conversation.id, content: msgText }),
      })
      const data = await res.json()
      if (res.ok && data.message) {
        setMessages((prev) => [...prev, data.message])
      }
    } catch {
      setText(msgText)
    } finally {
      setSending(false)
    }
  }

  const order = conversation.order
  const orderSeller = order?.orderSellers?.[0]

  const statusLabel: Record<string, string> = {
    MENUNGGU_PEMBAYARAN: 'Menunggu Pembayaran',
    DIPROSES: 'Sedang Diproses',
    DIKIRIM: 'Dikirim',
    SELESAI: 'Selesai',
    DIBATALKAN: 'Dibatalkan',
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-[#E7E8EC] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/chat" className="text-gray-500 hover:text-[#006E2F]">
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <div className="relative">
              <div className="h-9 w-9 rounded-full bg-[#006E2F] flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                {otherAvatar ? (
                  <img src={otherAvatar} alt={otherName} className="w-full h-full object-cover" />
                ) : (
                  otherName[0]
                )}
              </div>
              <div className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-[#22C55E] border-2 border-white rounded-full" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{otherName}</p>
              <p className="text-[11px] text-[#22C55E] font-medium">Online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-extrabold text-[#006E2F]">Toko Tani</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Context Banner */}
          {order && (
            <div className="bg-gray-100 px-5 py-2 text-xs text-[#8F9093] text-center">
              Anda menghubungi {otherName} terkait Order #{order.orderCode}
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-[#8F9093] text-sm py-8">
                Mulai percakapan Anda...
              </div>
            )}
            {messages.map((msg) => {
              const isMe = msg.senderId === currentUserId
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                      isMe
                        ? 'bg-[#006E2F] text-white rounded-br-sm'
                        : 'bg-white border border-[#E7E8EC] text-gray-900 rounded-bl-sm shadow-sm'
                    }`}
                  >
                    {msg.content}
                    {msg.attachmentUrl && (
                      <img src={msg.attachmentUrl} alt="attachment" className="mt-2 rounded-lg max-h-40 object-cover" />
                    )}
                    <p className={`text-[10px] mt-1 ${isMe ? 'text-white/60' : 'text-[#8F9093]'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="bg-white border-t border-[#E7E8EC] p-4">
            <form onSubmit={sendMessage} className="flex items-center gap-3">
              <button
                id="chat-attach-btn"
                type="button"
                className="p-2 text-gray-400 hover:text-[#006E2F] transition-colors rounded-full hover:bg-[#E6EEFF]"
              >
                <PaperClipIcon className="h-5 w-5" />
              </button>
              <input
                id="chat-input"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Tulis pesan untuk ${otherName}...`}
                className="flex-1 px-4 py-2.5 rounded-full border border-[#E7E8EC] bg-[#F8F9FF] text-sm focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
              />
              <button
                id="chat-send-btn"
                type="submit"
                disabled={!text.trim() || sending}
                className="h-10 w-10 rounded-full bg-[#22C55E] hover:bg-[#16a34a] disabled:opacity-50 text-white flex items-center justify-center transition-colors"
              >
                <ArrowUpIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar — Order Detail */}
        {order && orderSeller && (
          <div className="w-72 border-l border-[#E7E8EC] bg-white hidden lg:flex flex-col">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-900">Detail Pesanan</h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${
                    orderSeller.status === 'DIPROSES'
                      ? 'bg-blue-100 text-blue-700'
                      : orderSeller.status === 'DIKIRIM'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {statusLabel[orderSeller.status] || orderSeller.status}
                </span>
              </div>
              <p className="text-xs text-[#8F9093] mb-4">#{order.orderCode}</p>

              <div className="space-y-2 mb-4">
                {orderSeller.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                      {item.product.images[0] ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.productNameSnapshot}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-900 line-clamp-1">
                        {item.productNameSnapshot}
                      </p>
                      <p className="text-[11px] text-[#8F9093]">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#F8F9FF] rounded-xl p-3 mb-4">
                <p className="text-[10px] font-semibold text-[#8F9093] uppercase tracking-wide mb-1.5">
                  Alamat Pengiriman
                </p>
                <div className="flex gap-1.5">
                  <MapPinIcon className="h-3.5 w-3.5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {order.shippingAddress.fullAddress}, {order.shippingAddress.city}, {order.shippingAddress.province}
                  </p>
                </div>
              </div>

              <Link
                href={`/pesanan/${order.id}`}
                className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-[#006E2F] text-[#006E2F] text-sm font-semibold rounded-xl hover:bg-[#006E2F] hover:text-white transition-colors"
              >
                Lihat Detail Penuh
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>

      <footer className="text-center text-xs text-[#8F9093] py-3 border-t border-[#E7E8EC] bg-white">
        © 2026 Toko Tani Ecosystem. Memberdayakan Petani Lokal.
      </footer>
    </div>
  )
}

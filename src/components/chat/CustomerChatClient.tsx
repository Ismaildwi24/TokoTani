'use client'

import { useState, useRef, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { ArrowLeftIcon, PaperAirplaneIcon, UserCircleIcon, ChatBubbleLeftEllipsisIcon } from '@heroicons/react/24/outline'

const fetcher = (url: string) => fetch(url).then(res => res.json())

interface ChatMessage {
  id: string
  content: string
  isMine: boolean
  createdAt: string
  readAt: string | null
}

interface ChatConversation {
  id: string
  partnerId: string
  partnerName: string
  partnerAvatar: string | null
  lastMessage: ChatMessage | null
  orderId: string | null
}

export default function CustomerChatClient({ userId, isMitra = false }: { userId: string, isMitra?: boolean }) {
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: convosData, mutate: mutateConvos } = useSWR('/api/chat', fetcher, { refreshInterval: 5000 })
  const { data: messagesData, mutate: mutateMessages } = useSWR(activeConvoId ? `/api/chat/${activeConvoId}` : null, fetcher, { refreshInterval: 2000 })

  const conversations: ChatConversation[] = convosData?.conversations || []
  const messages: ChatMessage[] = messagesData?.messages || []

  const activeConvo = conversations.find(c => c.id === activeConvoId)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !activeConvoId) return

    const prevMessage = message
    setMessage('')
    
    // Optimistic update
    mutateMessages({ messages: [...messages, { id: 'temp', content: prevMessage, isMine: true, createdAt: new Date().toISOString(), readAt: null }] }, false)

    await fetch(`/api/chat/${activeConvoId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: prevMessage })
    })

    mutateMessages()
    mutateConvos()
  }

  const formatTime = (isoString: string) => {
    const d = new Date(isoString)
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col h-screen bg-[#F8F9FF] overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-[#E7E8EC] h-14 flex items-center px-4 flex-shrink-0 z-10">
        <div className="max-w-5xl mx-auto w-full flex items-center gap-3">
          {activeConvoId ? (
            <>
              <button onClick={() => setActiveConvoId(null)} className="md:hidden p-1 -ml-1 text-gray-500 hover:text-[#006E2F]">
                <ArrowLeftIcon className="h-5 w-5" />
              </button>
              <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                {activeConvo?.partnerAvatar ? (
                  <img src={activeConvo.partnerAvatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserCircleIcon className="h-full w-full text-gray-400" />
                )}
              </div>
              <div>
                <h2 className="font-bold text-gray-900 leading-tight">{activeConvo?.partnerName}</h2>
                {activeConvo?.orderId && <p className="text-[10px] text-gray-500">Terkait Pesanan</p>}
              </div>
            </>
          ) : (
            <>
              <Link href={isMitra ? "/mitra" : "/"} className="p-1 -ml-1 text-gray-500 hover:text-[#006E2F]">
                <ArrowLeftIcon className="h-5 w-5" />
              </Link>
              <h1 className="text-lg font-extrabold text-[#006E2F]">Pesan</h1>
            </>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full flex overflow-hidden">
        {/* Sidebar (List) */}
        <div className={`w-full md:w-80 border-r border-[#E7E8EC] bg-white flex flex-col ${activeConvoId ? 'hidden md:flex' : 'flex'}`}>
          <div className="overflow-y-auto flex-1">
            {conversations.length === 0 && !convosData ? (
              <div className="p-4 text-center text-sm text-gray-400 mt-10">Memuat pesan...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400 mt-10 flex flex-col items-center">
                <ChatBubbleLeftEllipsisIcon className="h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm">Belum ada percakapan.</p>
              </div>
            ) : (
              conversations.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveConvoId(c.id)}
                  className={`w-full text-left p-4 flex items-center gap-3 hover:bg-gray-50 border-b border-gray-100 transition-colors ${activeConvoId === c.id ? 'bg-[#E6EEFF] hover:bg-[#E6EEFF]' : ''}`}
                >
                  <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {c.partnerAvatar ? (
                      <img src={c.partnerAvatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <UserCircleIcon className="h-full w-full text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className="font-bold text-gray-900 truncate pr-2">{c.partnerName}</h3>
                      {c.lastMessage && (
                        <span className="text-[10px] text-gray-400 flex-shrink-0">
                          {formatTime(c.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {c.lastMessage ? (
                      <p className={`text-sm truncate ${c.lastMessage.isMine || c.lastMessage.readAt ? 'text-gray-500' : 'text-gray-900 font-semibold'}`}>
                        {c.lastMessage.isMine ? 'Anda: ' : ''}{c.lastMessage.content}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Mulai percakapan</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-[#F0F2F5] relative ${!activeConvoId ? 'hidden md:flex' : 'flex'}`}>
          {!activeConvoId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="h-24 w-24 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                <ChatBubbleLeftEllipsisIcon className="h-10 w-10 text-[#006E2F]" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Toko Tani Chat</h2>
              <p className="text-gray-500 text-sm max-w-xs">
                Pilih percakapan dari daftar di sebelah kiri untuk mulai mengirim pesan.
              </p>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m, idx) => {
                  const showDate = idx === 0 || new Date(messages[idx-1].createdAt).toDateString() !== new Date(m.createdAt).toDateString();
                  return (
                    <div key={m.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="bg-white/80 backdrop-blur-sm shadow-sm text-gray-500 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                            {new Date(m.createdAt).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${m.isMine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] px-4 py-2 rounded-2xl relative group ${m.isMine ? 'bg-[#006E2F] text-white rounded-tr-sm' : 'bg-white text-gray-900 rounded-tl-sm shadow-sm'}`}>
                          <p className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">{m.content}</p>
                          <div className={`text-[10px] mt-1 text-right flex items-center justify-end gap-1 ${m.isMine ? 'text-green-100' : 'text-gray-400'}`}>
                            {formatTime(m.createdAt)}
                            {m.isMine && (
                              <span className={m.readAt ? 'text-blue-300' : 'opacity-70'}>
                                ✓✓
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} className="h-1" />
              </div>

              {/* Input Area */}
              <div className="bg-[#F0F2F5] p-3 flex-shrink-0">
                <form onSubmit={sendMessage} className="flex gap-2 max-w-3xl mx-auto">
                  <input
                    type="text"
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Ketik pesan..."
                    className="flex-1 bg-white rounded-full px-5 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#006E2F]/20 shadow-sm"
                  />
                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="h-12 w-12 rounded-full bg-[#006E2F] flex items-center justify-center text-white flex-shrink-0 disabled:opacity-50 disabled:bg-gray-400 transition-colors shadow-sm"
                  >
                    <PaperAirplaneIcon className="h-5 w-5 -ml-0.5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

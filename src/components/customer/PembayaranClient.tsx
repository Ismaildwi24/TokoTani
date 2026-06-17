'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BellIcon, ShoppingCartIcon, PlusIcon, CreditCardIcon, PencilSquareIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface PaymentMethod {
  id: string
  providerName: string
  accountNumber: string
  accountHolder: string
  isDefault: boolean
}

interface User {
  id: string
  fullName: string
}

export default function PembayaranClient({ initialMethods, user }: { initialMethods: PaymentMethod[], user: User }) {
  const router = useRouter()
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [form, setForm] = useState({
    providerName: '',
    accountNumber: '',
    accountHolder: '',
    isDefault: false
  })

  function openCreateModal() {
    setForm({
      providerName: '',
      accountNumber: '',
      accountHolder: user.fullName,
      isDefault: methods.length === 0
    })
    setEditingId(null)
    setIsModalOpen(true)
  }

  function openEditModal(method: PaymentMethod) {
    setForm({
      providerName: method.providerName,
      accountNumber: method.accountNumber,
      accountHolder: method.accountHolder,
      isDefault: method.isDefault
    })
    setEditingId(method.id)
    setIsModalOpen(true)
  }

  function closeModal() {
    setIsModalOpen(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    try {
      const isEditing = !!editingId
      const url = '/api/payment-method'
      const httpMethod = isEditing ? 'PATCH' : 'POST'
      
      const body = isEditing ? { id: editingId, ...form } : form
      
      const res = await fetch(url, {
        method: httpMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (res.ok) {
        closeModal()
        router.refresh()
        const { method } = await res.json()
        if (isEditing) {
          setMethods(prev => {
            const mapped = prev.map(m => m.id === method.id ? method : m)
            if (method.isDefault) {
              return mapped.map(m => m.id !== method.id ? { ...m, isDefault: false } : m)
            }
            return mapped
          })
        } else {
          setMethods(prev => {
            if (method.isDefault) {
              return [...prev.map(m => ({ ...m, isDefault: false })), method]
            }
            return [...prev, method]
          })
        }
      } else {
        alert('Gagal menyimpan metode pembayaran')
      }
    } catch (e) {
      alert('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus metode pembayaran ini?')) return
    
    try {
      const res = await fetch(`/api/payment-method?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
        setMethods(prev => prev.filter(m => m.id !== id))
      } else {
        alert('Gagal menghapus metode pembayaran')
      }
    } catch (e) {
      alert('Terjadi kesalahan')
    }
  }

  async function handleSetDefault(id: string) {
    try {
      const res = await fetch('/api/payment-method', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isDefault: true })
      })
      if (res.ok) {
        router.refresh()
        setMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })))
      }
    } catch (e) {
      alert('Terjadi kesalahan')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FF]">
      {/* Header */}
      <header className="bg-white border-b border-[#E7E8EC] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold text-[#006E2F]">Toko Tani</Link>
          <div className="flex items-center gap-3">
            <BellIcon className="h-5 w-5 text-gray-500 hover:text-[#006E2F] cursor-pointer" />
            <ShoppingCartIcon className="h-5 w-5 text-gray-500 hover:text-[#006E2F] cursor-pointer" />
            <div className="h-8 w-8 rounded-full bg-[#006E2F] flex items-center justify-center text-white text-xs font-bold">
              {user.fullName[0]}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/profil" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#006E2F] mb-6 transition-colors">
          ← Kembali ke Profil
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">Metode Pembayaran Tersimpan</h1>
          <Button onClick={openCreateModal} className="flex-shrink-0">
            <PlusIcon className="h-5 w-5" />
            Tambah Rekening / E-Wallet
          </Button>
        </div>

        {methods.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E7E8EC] p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <CreditCardIcon className="h-8 w-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Belum ada metode pembayaran</h3>
            <p className="text-gray-500 max-w-sm mb-6">
              Anda belum menyimpan rekening bank atau e-wallet. Tambahkan sekarang untuk mempermudah transaksi.
            </p>
            <Button onClick={openCreateModal}>Tambah Metode Pertama</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {methods.sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1)).map((method) => (
              <div key={method.id} className={`bg-white rounded-2xl border p-6 flex flex-col transition-colors ${method.isDefault ? 'border-[#22C55E] bg-green-50/30' : 'border-[#E7E8EC] hover:border-gray-300'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <CreditCardIcon className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{method.providerName}</h3>
                      {method.isDefault && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-[#22C55E] text-white">
                          <CheckCircleIcon className="h-3 w-3" /> Utama
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(method)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(method.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Hapus">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="mt-auto">
                  <p className="text-lg font-mono font-medium text-gray-800 tracking-wider mb-1">{method.accountNumber}</p>
                  <p className="text-sm text-gray-500 uppercase tracking-wide">A.N. {method.accountHolder}</p>
                </div>

                {!method.isDefault && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                    <button onClick={() => handleSetDefault(method.id)} className="text-sm font-semibold text-[#006E2F] hover:underline">
                      Jadikan Utama
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#E7E8EC] flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Metode Pembayaran' : 'Tambah Rekening / E-Wallet'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-2">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Nama Bank / E-Wallet"
                placeholder="Contoh: BCA, Mandiri, GoPay, OVO"
                value={form.providerName}
                onChange={e => setForm(f => ({ ...f, providerName: e.target.value }))}
                required
              />
              
              <Input
                label="Nomor Rekening / Nomor HP"
                type="text"
                value={form.accountNumber}
                onChange={e => setForm(f => ({ ...f, accountNumber: e.target.value }))}
                required
              />

              <Input
                label="Nama Pemilik Rekening"
                placeholder="Sesuai buku tabungan / aplikasi"
                value={form.accountHolder}
                onChange={e => setForm(f => ({ ...f, accountHolder: e.target.value }))}
                required
              />

              {!form.isDefault && (
                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[#22C55E] focus:ring-[#22C55E] h-4 w-4"
                    checked={form.isDefault}
                    onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))}
                  />
                  <span className="text-sm text-gray-700">Jadikan sebagai metode utama</span>
                </label>
              )}

              <div className="pt-4 flex gap-3 justify-end border-t border-[#E7E8EC] mt-6">
                <Button type="button" variant="ghost" onClick={closeModal} disabled={loading}>
                  Batal
                </Button>
                <Button type="submit" loading={loading}>
                  Simpan
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

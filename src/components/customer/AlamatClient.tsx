'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { BellIcon, ShoppingCartIcon, PlusIcon, MapPinIcon, PencilSquareIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { MapPinIcon as MapPinIconSolid } from '@heroicons/react/24/solid'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Address {
  id: string
  label: string
  recipientName: string
  phone: string
  fullAddress: string
  city: string
  province: string
  postalCode: string
  isDefault: boolean
}

interface User {
  id: string
  fullName: string
}

export default function AlamatClient({ initialAddresses, user }: { initialAddresses: Address[], user: User }) {
  const router = useRouter()
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const [form, setForm] = useState({
    label: '',
    recipientName: '',
    phone: '',
    fullAddress: '',
    city: '',
    province: '',
    postalCode: '',
    isDefault: false
  })

  function openCreateModal() {
    setForm({
      label: '',
      recipientName: user.fullName,
      phone: '',
      fullAddress: '',
      city: '',
      province: '',
      postalCode: '',
      isDefault: addresses.length === 0
    })
    setEditingId(null)
    setIsModalOpen(true)
  }

  function openEditModal(addr: Address) {
    setForm({
      label: addr.label,
      recipientName: addr.recipientName,
      phone: addr.phone,
      fullAddress: addr.fullAddress,
      city: addr.city,
      province: addr.province,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault
    })
    setEditingId(addr.id)
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
      const url = '/api/address'
      const method = isEditing ? 'PATCH' : 'POST'
      
      const body = isEditing ? { id: editingId, ...form } : form
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      
      if (res.ok) {
        closeModal()
        router.refresh() // Trigger RSC reload
        // Optimistic update
        const { address } = await res.json()
        if (isEditing) {
          setAddresses(prev => {
            const mapped = prev.map(a => a.id === address.id ? address : a)
            if (address.isDefault) {
              return mapped.map(a => a.id !== address.id ? { ...a, isDefault: false } : a)
            }
            return mapped
          })
        } else {
          setAddresses(prev => {
            if (address.isDefault) {
              return [...prev.map(a => ({ ...a, isDefault: false })), address]
            }
            return [...prev, address]
          })
        }
      } else {
        alert('Gagal menyimpan alamat')
      }
    } catch (e) {
      alert('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Hapus alamat ini?')) return
    
    try {
      const res = await fetch(`/api/address?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
        setAddresses(prev => prev.filter(a => a.id !== id))
      } else {
        alert('Gagal menghapus alamat')
      }
    } catch (e) {
      alert('Terjadi kesalahan')
    }
  }

  async function handleSetDefault(id: string) {
    try {
      const res = await fetch('/api/address', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isDefault: true })
      })
      if (res.ok) {
        router.refresh()
        setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))
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
          <h1 className="text-2xl font-extrabold text-gray-900">Daftar Alamat Pengiriman</h1>
          <Button onClick={openCreateModal} className="flex-shrink-0">
            <PlusIcon className="h-5 w-5" />
            Tambah Alamat Baru
          </Button>
        </div>

        {addresses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E7E8EC] p-12 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <MapPinIcon className="h-8 w-8 text-[#22C55E]" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Belum ada alamat</h3>
            <p className="text-gray-500 max-w-sm mb-6">
              Anda belum menambahkan alamat pengiriman. Tambahkan alamat sekarang untuk mempermudah proses checkout.
            </p>
            <Button onClick={openCreateModal}>Tambah Alamat Pertama</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.sort((a, b) => (a.isDefault === b.isDefault ? 0 : a.isDefault ? -1 : 1)).map((addr) => (
              <div key={addr.id} className={`bg-white rounded-2xl border p-6 flex flex-col md:flex-row gap-6 transition-colors ${addr.isDefault ? 'border-[#22C55E] bg-green-50/30' : 'border-[#E7E8EC] hover:border-gray-300'}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      {addr.label}
                    </h3>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#22C55E] text-white">
                        <CheckCircleIcon className="h-3.5 w-3.5" />
                        Utama
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1">{addr.recipientName}</h4>
                  <p className="text-sm text-gray-600 mb-2">{addr.phone}</p>
                  <p className="text-sm text-gray-600">{addr.fullAddress}</p>
                  <p className="text-sm text-gray-600">{addr.city}, {addr.province} {addr.postalCode}</p>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEditModal(addr)} className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                      <PencilSquareIcon className="h-5 w-5" />
                    </button>
                    <button onClick={() => handleDelete(addr.id)} className="p-2 text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg transition-colors" title="Hapus">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                  {!addr.isDefault && (
                    <button onClick={() => handleSetDefault(addr.id)} className="text-sm font-semibold text-[#006E2F] hover:underline whitespace-nowrap">
                      Jadikan Utama
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[#E7E8EC] flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? 'Edit Alamat' : 'Tambah Alamat Baru'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-2">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <Input
                label="Label Alamat"
                placeholder="Contoh: Rumah, Kantor, Kosan"
                value={form.label}
                onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                required
              />
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nama Penerima"
                  value={form.recipientName}
                  onChange={e => setForm(f => ({ ...f, recipientName: e.target.value }))}
                  required
                />
                <Input
                  label="Nomor Telepon"
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Lengkap</label>
                <textarea
                  className="w-full rounded-xl border border-[#E7E8EC] px-4 py-3 text-sm focus:border-[#22C55E] focus:outline-none focus:ring-1 focus:ring-[#22C55E] transition-all resize-none"
                  rows={3}
                  placeholder="Nama jalan, gedung, nomor rumah"
                  value={form.fullAddress}
                  onChange={e => setForm(f => ({ ...f, fullAddress: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Kota / Kabupaten"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  required
                />
                <Input
                  label="Provinsi"
                  value={form.province}
                  onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                  required
                />
              </div>

              <Input
                label="Kode Pos"
                value={form.postalCode}
                onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))}
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
                  <span className="text-sm text-gray-700">Jadikan sebagai alamat utama</span>
                </label>
              )}

              <div className="pt-4 flex gap-3 justify-end border-t border-[#E7E8EC] mt-6">
                <Button type="button" variant="ghost" onClick={closeModal} disabled={loading}>
                  Batal
                </Button>
                <Button type="submit" loading={loading}>
                  Simpan Alamat
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

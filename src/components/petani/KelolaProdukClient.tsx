'use client'

import { useState } from 'react'
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

type Product = {
  id: string
  name: string
  price: number
  stock: number
  isActive: boolean
  unit: string
  images: { url: string }[]
}

export default function KelolaProdukClient({ initialProducts }: { initialProducts: Product[] }) {
  const router = useRouter()
  const [products, setProducts] = useState(initialProducts)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [editPrice, setEditPrice] = useState<number>(0)
  const [editStock, setEditStock] = useState<number>(0)
  const [isUpdating, setIsUpdating] = useState(false)
  
  const handleEditClick = (p: Product) => {
    setEditingId(p.id)
    setEditPrice(p.price)
    setEditStock(p.stock)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
  }

  const handleSave = async (id: string) => {
    setIsUpdating(true)
    try {
      const res = await fetch(`/api/product/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: editPrice, stock: editStock })
      })

      if (res.ok) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, price: editPrice, stock: editStock } : p))
        setEditingId(null)
        router.refresh()
      } else {
        alert('Gagal memperbarui produk')
      }
    } catch (e) {
      alert('Terjadi kesalahan')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return

    try {
      const res = await fetch(`/api/product/${id}`, {
        method: 'DELETE'
      })
      
      const data = await res.json()
      
      if (res.ok) {
        if (data.softDeleted) {
          // It was soft deleted because it has order history
          setProducts(prev => prev.map(p => p.id === id ? { ...p, isActive: false } : p))
          alert(data.message)
        } else {
          // Hard deleted
          setProducts(prev => prev.filter(p => p.id !== id))
        }
        router.refresh()
      } else {
        alert(data.error || 'Gagal menghapus produk')
      }
    } catch (e) {
      alert('Terjadi kesalahan')
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#E7E8EC] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-[#E7E8EC] text-gray-500">
            <tr>
              <th className="px-6 py-4 font-semibold">Produk</th>
              <th className="px-6 py-4 font-semibold">Harga</th>
              <th className="px-6 py-4 font-semibold">Stok</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E7E8EC]">
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Belum ada produk yang di-upload.
                </td>
              </tr>
            ) : (
              products.map(product => {
                const isEditing = editingId === product.id
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          <img 
                            src={product.images[0]?.url || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80'} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.unit}</p>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500">Rp</span>
                          <input 
                            type="number" 
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#006E2F]"
                            value={editPrice}
                            onChange={(e) => setEditPrice(parseInt(e.target.value) || 0)}
                          />
                        </div>
                      ) : (
                        <span className="font-medium text-gray-900">
                          Rp {new Intl.NumberFormat('id-ID').format(product.price)}
                        </span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input 
                          type="number" 
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#006E2F]"
                          value={editStock}
                          onChange={(e) => setEditStock(parseInt(e.target.value) || 0)}
                        />
                      ) : (
                        <span className="text-gray-700">{product.stock}</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {product.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleSave(product.id)}
                            disabled={isUpdating}
                            className="p-1.5 bg-[#006E2F] text-white rounded hover:bg-[#005a26] transition-colors disabled:opacity-50"
                            title="Simpan"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={handleCancelEdit}
                            disabled={isUpdating}
                            className="p-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors disabled:opacity-50"
                            title="Batal"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEditClick(product)}
                            className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                            title="Edit Cepat"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                            title="Hapus Produk"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

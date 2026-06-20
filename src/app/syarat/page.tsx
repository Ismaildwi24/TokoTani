import Link from 'next/link'
import { ArrowLeftIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { getAuthUser } from '@/lib/auth-guard'

export const metadata = {
  title: 'Syarat & Ketentuan | Toko Tani',
  description: 'Syarat dan ketentuan penggunaan platform Toko Tani',
}

export default async function SyaratKetentuanPage() {
  const user = await getAuthUser()
  const homeUrl = user?.role === 'PETANI' ? '/mitra' : user?.role === 'ADMIN' ? '/admin' : '/'

  return (
    <div className="min-h-screen bg-[#F8F9FF] pb-12">
      {/* Header */}
      <header className="bg-white border-b border-[#E7E8EC] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={homeUrl} className="text-lg font-extrabold text-[#006E2F]">Toko Tani</Link>
          <Link href={homeUrl} className="text-sm font-medium text-gray-500 hover:text-[#006E2F] flex items-center gap-1">
            <ArrowLeftIcon className="h-4 w-4" />
            Kembali
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-[#006E2F] text-white pt-16 pb-20 px-4 text-center">
        <div className="flex justify-center mb-4">
          <DocumentTextIcon className="h-16 w-16 text-green-200" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Syarat & Ketentuan</h1>
        <p className="text-green-100 max-w-2xl mx-auto text-lg">
          Harap baca syarat dan ketentuan ini dengan saksama sebelum menggunakan layanan Toko Tani.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-10">
        {/* Content Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E7E8EC] p-8 md:p-10 mb-8 space-y-8 text-gray-700 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Ketentuan Umum</h2>
            <p>
              Dengan mengakses dan menggunakan platform Toko Tani, Anda setuju untuk mematuhi semua Syarat & Ketentuan yang berlaku. 
              Platform ini ditujukan untuk memfasilitasi transaksi jual beli produk pertanian langsung dari petani (Mitra) kepada pelanggan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Akun Pengguna</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Pengguna wajib memberikan informasi yang akurat, lengkap, dan terkini saat mendaftar.</li>
              <li>Pengguna bertanggung jawab atas kerahasiaan kata sandi dan seluruh aktivitas yang terjadi pada akunnya.</li>
              <li>Toko Tani berhak menangguhkan atau menghapus akun yang terindikasi melakukan penipuan, pelanggaran hukum, atau aktivitas mencurigakan.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Transaksi & Pembayaran</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Harga yang tertera sudah final kecuali terdapat biaya pengiriman tambahan yang akan dihitung otomatis saat checkout.</li>
              <li>Pembayaran dilakukan secara aman melalui metode pihak ketiga (Payment Gateway).</li>
              <li>Pesanan yang sudah dibayar (LUNAS) tidak dapat dibatalkan kecuali ada persetujuan dari pihak penjual (petani) karena kendala stok/ketersediaan.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Pengiriman & Kualitas Produk</h2>
            <p className="mb-3">
              Toko Tani mengupayakan kualitas terbaik dari produk pertanian yang dikirim. Namun karena sifat produk pangan segar, 
              kerusakan dapat terjadi.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Petani bertanggung jawab atas pengemasan yang wajar dan aman.</li>
              <li>Waktu pengiriman bergantung pada estimasi kurir yang dipilih oleh pelanggan.</li>
              <li>Komplain terkait kualitas produk (busuk/rusak) harus diajukan maksimal 1x24 jam setelah barang diterima melalui menu Laporan/Keluhan.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Batasan Tanggung Jawab</h2>
            <p>
              Toko Tani bertindak sebagai perantara yang menghubungkan petani dengan konsumen. Kami tidak menjamin ketersediaan absolut setiap produk. 
              Tanggung jawab atas produk secara langsung berada pada mitra petani, meskipun Toko Tani akan menengahi penyelesaian jika terjadi sengketa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Perubahan Syarat & Ketentuan</h2>
            <p>
              Toko Tani berhak untuk sewaktu-waktu memperbarui atau mengubah Syarat & Ketentuan ini. Penggunaan platform secara terus-menerus 
              berarti Anda menyetujui perubahan tersebut.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}

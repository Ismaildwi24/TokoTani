import Link from 'next/link'
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { getAuthUser } from '@/lib/auth-guard'

export const metadata = {
  title: 'Kebijakan Privasi | Toko Tani',
  description: 'Kebijakan privasi dan perlindungan data pengguna Toko Tani',
}

export default async function PrivasiPage() {
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
          <ShieldCheckIcon className="h-16 w-16 text-green-200" />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Kebijakan Privasi</h1>
        <p className="text-green-100 max-w-2xl mx-auto text-lg">
          Keamanan dan privasi data Anda adalah prioritas utama kami. 
          Berikut adalah bagaimana Toko Tani mengelola, menggunakan, dan melindungi informasi Anda.
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-10">
        {/* Content Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E7E8EC] p-8 md:p-10 mb-8 space-y-8 text-gray-700 leading-relaxed">
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Informasi yang Kami Kumpulkan</h2>
            <p className="mb-3">Kami mengumpulkan informasi yang Anda berikan secara langsung saat Anda menggunakan layanan kami, antara lain:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Informasi profil (Nama, Email, Nomor Telepon, Kata Sandi).</li>
              <li>Alamat pengiriman dan data lokasi terkait.</li>
              <li>Informasi transaksi dan detail pesanan (tidak termasuk data kartu kredit/debit secara utuh, yang dikelola langsung oleh mitra payment gateway kami, Midtrans).</li>
              <li>Percakapan obrolan (chat) antara Pelanggan dan Petani/Admin untuk keperluan pelayanan.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Penggunaan Informasi</h2>
            <p className="mb-3">Informasi yang kami kumpulkan digunakan untuk tujuan berikut:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Memfasilitasi transaksi antara konsumen dan petani.</li>
              <li>Memastikan kelancaran proses pengiriman produk pertanian ke alamat Anda.</li>
              <li>Menyediakan layanan pelanggan (Customer Service) dan menyelesaikan keluhan.</li>
              <li>Meningkatkan kualitas layanan platform Toko Tani melalui analitik dan umpan balik pengguna.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Berbagi Informasi</h2>
            <p className="mb-3">
              Kami tidak akan menjual, menyewakan, atau membagikan data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran komersial. 
              Data Anda hanya akan dibagikan kepada:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Petani (Mitra Toko Tani):</strong> Nama dan alamat Anda diberikan kepada petani guna proses pengiriman pesanan.</li>
              <li><strong>Mitra Pengiriman:</strong> Detail alamat dan nomor telepon untuk memfasilitasi logistik/kurir.</li>
              <li><strong>Penyedia Layanan Pembayaran:</strong> Informasi transaksi yang dibutuhkan oleh Payment Gateway (Midtrans) untuk memproses pembayaran Anda secara aman.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Keamanan Data</h2>
            <p>
              Kami mengambil langkah-langkah keamanan teknis yang wajar, termasuk enkripsi kata sandi dan penggunaan protokol HTTPS/SSL, 
              untuk melindungi data pribadi Anda dari akses, penggunaan, modifikasi, atau pengungkapan yang tidak sah.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Hak Pengguna</h2>
            <p>
              Anda memiliki hak untuk mengakses, memperbarui, atau menghapus informasi pribadi Anda yang ada di sistem kami. 
              Anda juga dapat mengelola alamat atau menarik permintaan kapan pun melalui menu "Profil" di akun Anda.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Perubahan Kebijakan</h2>
            <p>
              Toko Tani dapat merevisi Kebijakan Privasi ini dari waktu ke waktu. Setiap perubahan signifikan akan kami beritahukan 
              melalui pemberitahuan di dalam platform atau email yang terdaftar.
            </p>
          </section>

          <hr className="border-[#E7E8EC] my-8" />

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Hubungi Kami</h2>
            <p>
              Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini, silakan hubungi kami melalui halaman <Link href="/bantuan/laporan" className="text-[#006E2F] font-semibold hover:underline">Keluhan & Laporan</Link> atau hubungi layanan pelanggan kami.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}

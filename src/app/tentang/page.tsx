import Link from 'next/link'
import { ArrowLeftIcon, HeartIcon, GlobeAsiaAustraliaIcon, UserGroupIcon } from '@heroicons/react/24/outline'

export const metadata = {
  title: 'Tentang Kami | Toko Tani',
  description: 'Mengenal lebih dekat Toko Tani - Memberdayakan Petani Lokal Indonesia',
}

export default function TentangKamiPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FF] pb-12">
      {/* Header */}
      <header className="bg-white border-b border-[#E7E8EC] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold text-[#006E2F]">Toko Tani</Link>
          <Link href="/" className="text-sm font-medium text-gray-500 hover:text-[#006E2F] flex items-center gap-1">
            <ArrowLeftIcon className="h-4 w-4" />
            Kembali
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-[#006E2F] text-white pt-16 pb-20 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Tentang Toko Tani</h1>
        <p className="text-green-100 max-w-2xl mx-auto text-lg">
          Platform digital yang menghubungkan petani lokal secara langsung dengan konsumen, 
          menciptakan ekosistem pertanian yang adil, berkelanjutan, dan transparan.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-10">
        {/* Core Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-[#E7E8EC] p-6 text-center">
            <div className="h-14 w-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#006E2F]">
              <HeartIcon className="h-7 w-7" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Pemberdayaan Petani</h3>
            <p className="text-sm text-gray-600">Membantu petani mendapatkan harga yang lebih adil dan memutus rantai distribusi yang panjang.</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-[#E7E8EC] p-6 text-center">
            <div className="h-14 w-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#006E2F]">
              <GlobeAsiaAustraliaIcon className="h-7 w-7" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Segar dari Kebun</h3>
            <p className="text-sm text-gray-600">Konsumen mendapatkan produk pertanian yang lebih segar karena dikirim langsung setelah panen.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#E7E8EC] p-6 text-center">
            <div className="h-14 w-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#006E2F]">
              <UserGroupIcon className="h-7 w-7" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Komunitas Lokal</h3>
            <p className="text-sm text-gray-600">Membangun komunitas agrikultur yang kuat antara konsumen dan produsen pangan lokal.</p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E7E8EC] p-8 md:p-10 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Kisah Kami</h2>
          
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              Berawal dari keresahan melihat petani yang sering kali mendapatkan keuntungan sangat minim dari hasil panen mereka, 
              sementara konsumen harus membayar dengan harga yang tinggi di pasar, Toko Tani hadir sebagai solusi penengah.
            </p>
            <p>
              Kami percaya bahwa dengan teknologi, jarak antara kebun dan meja makan dapat dipersingkat. 
              Toko Tani didirikan pada tahun 2026 dengan visi untuk mendigitalisasi sektor pertanian lokal 
              dan memberikan akses pasar yang seluas-luasnya bagi para petani skala kecil dan menengah.
            </p>
            <p>
              Di Toko Tani, setiap transaksi yang Anda lakukan bukan sekadar aktivitas belanja rutin, 
              melainkan sebuah bentuk dukungan nyata terhadap kesejahteraan pahlawan pangan lokal kita.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-green-50 rounded-2xl border border-green-100 p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Mari Tumbuh Bersama</h2>
          <p className="text-green-800 mb-6">Jadilah bagian dari perubahan ekosistem pertanian Indonesia.</p>
          <Link href="/produk" className="inline-block px-8 py-3 bg-[#006E2F] text-white font-bold rounded-full hover:bg-[#005525] transition-colors shadow-md">
            Mulai Belanja Sekarang
          </Link>
        </div>
      </div>
    </div>
  )
}

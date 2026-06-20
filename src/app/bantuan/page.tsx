import Link from 'next/link'
import { QuestionMarkCircleIcon, ChatBubbleLeftRightIcon, BookOpenIcon, ArrowLeftIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline'

export const metadata = {
  title: 'Pusat Bantuan | Toko Tani',
  description: 'Temukan jawaban untuk pertanyaan Anda seputar layanan Toko Tani',
}

const faqs = [
  {
    question: 'Bagaimana cara berbelanja di Toko Tani?',
    answer: 'Anda dapat mencari produk hasil tani yang Anda inginkan, menambahkannya ke keranjang, dan melakukan checkout. Setelah itu, pilih metode pembayaran dan kurir pengiriman.'
  },
  {
    question: 'Apakah sayuran dan buah yang dijual segar?',
    answer: 'Tentu! Toko Tani menghubungkan Anda langsung dengan petani lokal, sehingga produk yang Anda terima dikirim langsung dari kebun setelah dipanen.'
  },
  {
    question: 'Bagaimana jika pesanan saya rusak saat sampai?',
    answer: 'Kami memberikan jaminan kualitas. Jika produk rusak, segera ambil foto produk beserta resi pengiriman dan hubungi Customer Service kami dalam waktu 1x24 jam untuk proses refund atau pengiriman ulang.'
  },
  {
    question: 'Berapa lama waktu pengiriman pesanan?',
    answer: 'Waktu pengiriman bergantung pada lokasi Anda dan mitra petani. Umumnya memakan waktu 1-3 hari kerja untuk pengiriman standar, dan tersedia pengiriman instan untuk wilayah tertentu.'
  },
  {
    question: 'Metode pembayaran apa saja yang tersedia?',
    answer: 'Kami menerima pembayaran melalui transfer bank (BCA, Mandiri, BNI, BRI), e-wallet (GoPay, OVO, Dana), dan Virtual Account.'
  }
]

export default function BantuanPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FF] pb-12">
      {/* Header */}
      <header className="bg-white border-b border-[#E7E8EC] sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold text-[#006E2F]">Toko Tani</Link>
          <Link href="/profil" className="text-sm font-medium text-gray-500 hover:text-[#006E2F] flex items-center gap-1">
            <ArrowLeftIcon className="h-4 w-4" />
            Kembali
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-[#006E2F] text-white pt-16 pb-20 px-4 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Halo, ada yang bisa kami bantu?</h1>
        <p className="text-green-100 max-w-xl mx-auto">
          Temukan solusi, panduan, dan jawaban atas pertanyaan umum seputar layanan Toko Tani di bawah ini.
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-10">
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="bg-white rounded-2xl shadow-sm border border-[#E7E8EC] p-6 flex flex-col items-center text-center hover:border-[#006E2F] transition-colors cursor-pointer">
            <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center mb-4 text-[#006E2F]">
              <BookOpenIcon className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Panduan Belanja</h3>
            <p className="text-sm text-gray-500">Langkah mudah bertransaksi di Toko Tani</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-sm border border-[#E7E8EC] p-6 flex flex-col items-center text-center hover:border-[#006E2F] transition-colors cursor-pointer">
            <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center mb-4 text-[#006E2F]">
              <QuestionMarkCircleIcon className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Pertanyaan Umum (FAQ)</h3>
            <p className="text-sm text-gray-500">Jawaban cepat untuk kendala Anda</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#E7E8EC] p-6 flex flex-col items-center text-center hover:border-[#006E2F] transition-colors cursor-pointer">
            <div className="h-12 w-12 bg-green-50 rounded-full flex items-center justify-center mb-4 text-[#006E2F]">
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Live Chat</h3>
            <p className="text-sm text-gray-500">Ngobrol langsung dengan tim kami</p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E7E8EC] p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Pertanyaan yang Sering Diajukan</h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="group border border-[#E7E8EC] rounded-xl overflow-hidden cursor-pointer bg-gray-50 open:bg-white transition-colors">
                <summary className="flex items-center justify-between p-4 font-semibold text-gray-900 select-none">
                  {faq.question}
                  <span className="text-[#006E2F] text-xl font-bold group-open:rotate-45 transition-transform duration-300">+</span>
                </summary>
                <div className="p-4 pt-0 text-gray-600 text-sm leading-relaxed border-t border-[#E7E8EC] bg-white">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-[#006E2F]/5 rounded-2xl border border-[#006E2F]/20 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Masih Butuh Bantuan?</h2>
            <p className="text-gray-600 max-w-md">
              Tim Customer Service kami siap membantu Anda setiap hari dari pukul 08:00 hingga 20:00 WIB.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link href="/bantuan/laporan" className="flex items-center justify-center gap-2 bg-white text-[#006E2F] border border-[#006E2F] px-6 py-3 rounded-xl font-bold hover:bg-[#E6EEFF] transition-colors">
              <ChatBubbleLeftRightIcon className="h-5 w-5" />
              Buat Laporan / Keluhan
            </Link>
            <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#20bd5a] transition-colors">
              <PhoneIcon className="h-5 w-5" />
              WhatsApp
            </a>
            <a href="mailto:support@tokotani.com" className="flex items-center justify-center gap-2 bg-white border border-[#E7E8EC] text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">
              <EnvelopeIcon className="h-5 w-5" />
              Email Kami
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

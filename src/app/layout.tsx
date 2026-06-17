import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toko Tani — Sayur Segar Langsung dari Petani Lokal",
  description:
    "Beli sayur, buah, dan bumbu segar langsung dari petani lokal terpercaya. Dukung ketahanan pangan nasional dan petani Indonesia.",
  keywords: "sayur segar, buah lokal, petani, organik, belanja sayur online",
  openGraph: {
    title: "Toko Tani",
    description: "Marketplace sayur segar langsung dari petani lokal",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

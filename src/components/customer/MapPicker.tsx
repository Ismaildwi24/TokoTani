'use client'

import dynamic from 'next/dynamic'

// Dynamic import with ssr: false ensures that leaflet is only loaded on the client side
// preventing 'window is not defined' errors during SSR build
const Map = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => (
    <div className="h-64 w-full bg-gray-100 animate-pulse rounded-xl flex items-center justify-center text-sm text-gray-500 border border-[#E7E8EC]">
      Memuat Peta...
    </div>
  )
})

interface MapPickerProps {
  position: { lat: number; lng: number } | null
  onPositionChange: (pos: { lat: number; lng: number }) => void
}

export default function MapPicker(props: MapPickerProps) {
  return <Map {...props} />
}

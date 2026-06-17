'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
})

interface MapComponentProps {
  position: { lat: number; lng: number } | null
  onPositionChange: (pos: { lat: number; lng: number }) => void
}

function LocationMarker({ position, onPositionChange }: MapComponentProps) {
  useMapEvents({
    click(e) {
      onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })

  return position === null ? null : (
    <Marker position={position} icon={icon}></Marker>
  )
}

export default function MapComponent({ position, onPositionChange }: MapComponentProps) {
  const defaultPosition = { lat: -6.200000, lng: 106.816666 } // Default ke Jakarta

  return (
    <div className="h-64 w-full rounded-xl overflow-hidden border border-[#E7E8EC] relative" style={{ zIndex: 0 }}>
      <MapContainer
        center={position || defaultPosition}
        zoom={13}
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} onPositionChange={onPositionChange} />
      </MapContainer>
    </div>
  )
}

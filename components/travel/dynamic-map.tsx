"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import type { Marker as LeafletMarker } from "leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { ExternalLink, Navigation } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  googleMapsUrl,
  type ActivityType,
  type DayItinerary,
  type ItineraryItem,
} from "@/lib/itinerary"

interface DynamicMapProps {
  itinerary: DayItinerary[] | null
  destination: string | null
  selectedItemId: string | null
  onSelectItem: (id: string | null) => void
  previewLocation?: [number, number] | null
  userCoords?: [number, number]
}

const PIN_COLORS: Record<ActivityType, string> = {
  breakfast: "bg-amber-500",
  morning: "bg-sky-500",
  lunch: "bg-emerald-500",
  afternoon: "bg-orange-500",
  dinner: "bg-indigo-500",
}

// Convert our Tailwind classes into hex colors for fallback or simple styles if needed
const PIN_COLORS_HEX: Record<ActivityType, string> = {
  breakfast: "#f59e0b",
  morning: "#0ea5e9",
  lunch: "#10b981",
  afternoon: "#f97316",
  dinner: "#6366f1",
}

function createCustomIcon(type: ActivityType, isSelected: boolean) {
  const colorClass = PIN_COLORS[type]
  const colorHex = PIN_COLORS_HEX[type]

  const sizeClass = isSelected ? "width: 40px; height: 40px; transform: scale(1.1);" : "width: 28px; height: 28px;"
  const iconSize = isSelected ? 20 : 16
  const pingHtml = isSelected ? `<span class="absolute left-1/2 top-1/2 -z-10 h-10 w-10 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full opacity-50 ${colorClass}" style="background-color: ${colorHex}"></span>` : ''

  const html = `
    <div class="relative flex flex-col items-center group focus:outline-none">
      ${pingHtml}
      <div class="flex items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white transition-all ${colorClass}" style="background-color: ${colorHex}; ${sizeClass}">
        <svg xmlns="http://www.w3.org/2000/svg" width="${iconSize}" height="${iconSize}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
    </div>
  `

  return L.divIcon({
    html,
    className: "custom-leaflet-icon",
    iconSize: isSelected ? [40, 40] : [28, 28],
    iconAnchor: isSelected ? [20, 40] : [14, 28],
    popupAnchor: [0, -40],
  })
}

function MapController({ items, selectedItemId, onSelectItem, previewLocation }: { items: ItineraryItem[], selectedItemId: string | null, onSelectItem: (id: string | null) => void, previewLocation?: [number, number] | null }) {
  const map = useMapEvents({
    click() {
      onSelectItem(null)
    }
  })

  // Fly to preview location if selected from search
  useEffect(() => {
    if (previewLocation && items.length === 0) {
      map.flyTo(previewLocation, 13)
    }
  }, [previewLocation, map, items.length])

  useEffect(() => {
    if (items.length === 0) {
      map.locate({ setView: true, maxZoom: 13 })
    }
  }, [items.length, map])
  
  useEffect(() => {
    if (items.length > 0) {
      // Create a bounding box for all items
      // We will map the mock x, y from our data to dummy lat/lng for now if they don't have real coordinates.
      // Since the mock data only has percentages for x/y (left/top), we need to map them to some coordinates.
      // Let's assume a default center like Paris (48.8566, 2.3522) if no items, or map the percentages to a small area around a default center.
      
      const bounds = L.latLngBounds(items.map(item => {
        return [item.lat, item.lng]
      }))
      
      if (selectedItemId) {
        const selectedItem = items.find(i => i.id === selectedItemId)
        if (selectedItem) {
          map.flyTo([selectedItem.lat, selectedItem.lng], 15)
        }
      } else {
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [items, selectedItemId, map])

  return null
}

export default function DynamicMap({
  itinerary,
  destination,
  selectedItemId,
  onSelectItem,
  previewLocation,
  userCoords,
}: DynamicMapProps) {
  const [mounted, setMounted] = useState(false)
  const mapRef = useRef<L.Map>(null)
  const markerRefs = useRef<Map<string, LeafletMarker>>(new Map())

  useEffect(() => {
    setMounted(true)
  }, [])

  // Open the popup of the selected marker whenever selection changes from the itinerary list
  useEffect(() => {
    if (!selectedItemId) return
    const marker = markerRefs.current.get(selectedItemId)
    if (marker) {
      // Small timeout so the map has finished flying before the popup opens
      setTimeout(() => marker.openPopup(), 350)
    }
  }, [selectedItemId])

  if (!mounted) return null

  const allItems: ItineraryItem[] = itinerary?.flatMap((day) => day.items) ?? []
  const selectedItem = allItems.find((item) => item.id === selectedItemId) ?? null

  const defaultCenter: [number, number] = userCoords ?? [19.4326, -99.1332] // Fallback to Mexico City

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#e8eef4]">
      <MapContainer
        center={defaultCenter}
        zoom={13}
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController items={allItems} selectedItemId={selectedItemId} onSelectItem={onSelectItem} previewLocation={previewLocation} />

        {allItems.map((item) => {
          const isSelected = item.id === selectedItemId

          return (
            <Marker
              key={item.id}
              position={[item.lat, item.lng]}
              icon={createCustomIcon(item.type, isSelected)}
              eventHandlers={{
                click: () => onSelectItem(isSelected ? null : item.id),
              }}
              zIndexOffset={isSelected ? 1000 : 0}
              ref={(markerInstance) => {
                if (markerInstance) markerRefs.current.set(item.id, markerInstance)
                else markerRefs.current.delete(item.id)
              }}
            >
              {destination && (
                <Popup offset={[0, -10]} className="custom-popup">
                  <div className="flex flex-col gap-2 min-w-[200px] p-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary m-0">
                          {item.time}
                        </span>
                        <span className="text-sm font-semibold text-foreground m-0 leading-tight">
                          {item.title}
                        </span>
                      </div>
                      <a
                        href={googleMapsUrl(item, destination)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors hover:bg-primary/20"
                        title="Open in Google Maps"
                      >
                        <ExternalLink className="size-3.5" />
                      </a>
                    </div>
                    
                    {item.info && (
                      <p className="text-xs text-muted-foreground m-0 leading-snug border-t border-border pt-2 mt-1">
                        {item.info}
                      </p>
                    )}
                  </div>
                </Popup>
              )}
            </Marker>
          )
        })}
      </MapContainer>

      {/* Map controls (top-right) */}
      <div className="absolute right-4 top-4 flex flex-col gap-2 z-10">
        <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-md">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); mapRef.current?.zoomIn() }}
            className="flex size-9 items-center justify-center text-foreground transition-colors hover:bg-muted"
            aria-label="Zoom in"
          >
            <span className="text-lg font-medium">+</span>
          </button>
          <div className="h-px w-full bg-border" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); mapRef.current?.zoomOut() }}
            className="flex size-9 items-center justify-center text-foreground transition-colors hover:bg-muted"
            aria-label="Zoom out"
          >
            <span className="text-lg font-medium">-</span>
          </button>
        </div>
      </div>

      {/* Locate button (bottom-right) */}
      <button
        type="button"
        onClick={(e) => { 
          e.stopPropagation(); 
          if (allItems.length > 0) {
            const bounds = L.latLngBounds(allItems.map(item => {
              return [item.lat, item.lng]
            }))
            mapRef.current?.fitBounds(bounds, { padding: [50, 50] })
          } else {
            mapRef.current?.locate({ setView: true, maxZoom: 13 })
          }
        }}
        className="absolute bottom-6 right-6 flex size-11 items-center justify-center rounded-full border border-border bg-card text-primary shadow-lg transition-colors hover:bg-muted z-10"
        aria-label="Center on current location"
      >
        <Navigation className="size-5" />
      </button>



      {/* Global styles for Leaflet custom popup to match our theme */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-popup-content-wrapper {
          border-radius: 0.5rem;
          border: 1px solid hsl(var(--border));
          background-color: hsl(var(--card));
          color: hsl(var(--card-foreground));
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
        }
        .leaflet-popup-tip-container {
          display: none;
        }
        .leaflet-popup-content {
          margin: 12px 16px;
          line-height: 1.4;
        }
        .custom-leaflet-icon {
          background: transparent;
          border: none;
        }
      `}} />
    </div>
  )
}

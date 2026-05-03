"use client"

import dynamic from "next/dynamic"
import { type DayItinerary } from "@/lib/itinerary"

interface MapPlaceholderProps {
  itinerary: DayItinerary[] | null
  destination: string | null
  selectedItemId: string | null
  onSelectItem: (id: string | null) => void
  previewLocation?: [number, number] | null
  userCoords?: [number, number]
}

const DynamicMap = dynamic(() => import("./dynamic-map"), {
  ssr: false,
  loading: () => (
    <div className="relative h-full w-full overflow-hidden bg-[#e8eef4] flex items-center justify-center">
      <div className="animate-pulse rounded-full h-12 w-12 border-4 border-primary border-t-transparent animate-spin"></div>
    </div>
  ),
})

export function MapPlaceholder(props: MapPlaceholderProps) {
  return <DynamicMap {...props} />
}

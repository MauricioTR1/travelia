"use client"

import { Plane } from "lucide-react"
import { TravelForm } from "./travel-form"
import { LoadingState } from "./loading-state"
import { ItineraryResults } from "./itinerary-results"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { PlannerState, TravelData } from "@/app/page"
import type { DayItinerary } from "@/lib/itinerary"

interface TravelSidebarProps {
  state: PlannerState
  travelData: TravelData | null
  itinerary: DayItinerary[] | null
  selectedItemId: string | null
  onSelectItem: (id: string | null) => void
  onSubmit: (data: TravelData) => void
  onBack: () => void
  onPreviewLocation?: (lat: number, lng: number) => void
}

export function TravelSidebar({
  state,
  travelData,
  itinerary,
  selectedItemId,
  onSelectItem,
  onSubmit,
  onBack,
  onPreviewLocation,
}: TravelSidebarProps) {
  return (
    <aside className="flex h-[50vh] w-full shrink-0 flex-col overflow-hidden border-b border-border bg-card shadow-lg lg:h-full lg:w-[400px] lg:border-b-0 lg:border-r">
      {/* Static Header — never scrolls */}
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Plane className="size-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Travelia</h1>
          <p className="text-sm text-muted-foreground">Plan your perfect trip</p>
        </div>
      </header>

      {/* Scrollable content area — only this region scrolls when itinerary is long */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="p-5">
          {state === "form" && <TravelForm onSubmit={onSubmit} onLocationSelect={onPreviewLocation} initialData={travelData} />}
          {state === "loading" && travelData && (
            <LoadingState destination={travelData.destination} />
          )}
          {state === "results" && travelData && itinerary && (
            <ItineraryResults
              destination={travelData.destination}
              itinerary={itinerary}
              selectedItemId={selectedItemId}
              onSelectItem={onSelectItem}
              onBack={onBack}
            />
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}

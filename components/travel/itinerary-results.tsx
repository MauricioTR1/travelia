"use client"

import { useEffect, useRef } from "react"
import { ArrowLeft, Coffee, Sun, Utensils, Sunset, Moon, ExternalLink, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { googleMapsUrl, type ActivityType, type DayItinerary } from "@/lib/itinerary"

interface ItineraryResultsProps {
  destination: string
  itinerary: DayItinerary[]
  selectedItemId: string | null
  onSelectItem: (id: string | null) => void
  onBack: () => void
}

const ACTIVITY_ICONS: Record<ActivityType, typeof Coffee> = {
  breakfast: Coffee,
  morning: Sun,
  lunch: Utensils,
  afternoon: Sunset,
  dinner: Moon,
}

const ACTIVITY_COLORS: Record<ActivityType, string> = {
  breakfast: "border-l-amber-400",
  morning: "border-l-sky-400",
  lunch: "border-l-emerald-400",
  afternoon: "border-l-orange-400",
  dinner: "border-l-indigo-400",
}

export function ItineraryResults({
  destination,
  itinerary,
  selectedItemId,
  onSelectItem,
  onBack,
}: ItineraryResultsProps) {
  const days = itinerary.length
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  // Scroll the selected item into view when selection changes (e.g. clicking a pin on the map)
  useEffect(() => {
    if (!selectedItemId) return
    const el = itemRefs.current.get(selectedItemId)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [selectedItemId])

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="size-9">
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Your {destination} Itinerary
          </h2>
          <p className="text-sm text-muted-foreground">
            {days} {days === 1 ? "day" : "days"} of adventure
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex flex-col gap-6 pb-4">
        {itinerary.map((dayData) => (
          <div key={dayData.day} className="flex flex-col gap-3">
            {/* Day Header */}
            <div className="sticky top-0 z-10 -mx-4 bg-card/95 px-4 py-2 backdrop-blur-sm">
              <h3 className="text-sm font-bold uppercase tracking-wide text-primary">
                Day {dayData.day}
              </h3>
            </div>

            {/* Activities */}
            <div className="flex flex-col gap-2 pl-2">
              {dayData.items.map((item) => {
                const Icon = ACTIVITY_ICONS[item.type]
                const isSelected = selectedItemId === item.id

                return (
                  <button
                    key={item.id}
                    ref={(el) => {
                      if (el) itemRefs.current.set(item.id, el)
                      else itemRefs.current.delete(item.id)
                    }}
                    onClick={() => onSelectItem(isSelected ? null : item.id)}
                    className={cn(
                      "group relative flex items-start gap-3 rounded-lg border border-l-4 bg-card p-3 text-left shadow-sm transition-all hover:shadow-md",
                      ACTIVITY_COLORS[item.type],
                      isSelected && "ring-2 ring-primary/40 shadow-md bg-primary/5"
                    )}
                  >
                    {/* Icon */}
                    <div
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-full transition-colors",
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col gap-0.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium text-muted-foreground">
                            {item.time}
                          </span>
                          <span
                            className={cn(
                              "font-medium text-foreground transition-colors",
                              isSelected ? "text-primary" : "group-hover:text-primary"
                            )}
                          >
                            {item.title}
                          </span>
                        </div>
                        {item.info && (
                          <div 
                            title={item.info} 
                            className="mt-1 shrink-0 text-muted-foreground hover:text-primary transition-colors cursor-help"
                            onClick={(e) => {
                              // Prevent selecting the card if just clicking the info icon (optional, though title works on hover)
                              e.stopPropagation()
                            }}
                          >
                            <Info className="size-4" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {item.description}
                      </span>

                      {/* Google Maps hyperlink — appears when item is selected */}
                      {isSelected && (
                        <a
                          href={googleMapsUrl(item, destination)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                        >
                          <ExternalLink className="size-3" />
                          Open in Google Maps
                        </a>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

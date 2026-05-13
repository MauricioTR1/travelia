"use client"

import { useState, useEffect } from "react"
import { MapPin, Minus, Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { LocationAutocomplete } from "./location-autocomplete"
import { cn } from "@/lib/utils"

const PREFERENCES = [
  "Explore historical sites",
  "Hang out",
  "Drinking/Bars",
  "Nature & Outdoors",
  "Local Cuisine",
  "Shopping",
  "Art & Museums",
]



interface TravelFormProps {
  initialData?: {
    destination: string
    days: number
    preferences: string[]
    startTime: string
    endTime: string
    userCoords?: [number, number]
  } | null
  onLocationSelect?: (lat: number, lng: number) => void
  onSubmit: (data: {
    destination: string
    days: number
    preferences: string[]
    startTime: string
    endTime: string
    userCoords?: [number, number]
  }) => void
}

export function TravelForm({ onSubmit, onLocationSelect, initialData }: TravelFormProps) {
  const [destination, setDestination] = useState(initialData?.destination || "")
  const [days, setDays] = useState(initialData?.days || 3)
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>(initialData?.preferences || [])
  const [startTime, setStartTime] = useState(initialData?.startTime || "09:00")
  const [endTime, setEndTime] = useState(initialData?.endTime || "22:00")
  const [fromLocation, setFromLocation] = useState("")
  const [isLocating, setIsLocating] = useState(false)
  const [userCoords, setUserCoords] = useState<[number, number] | undefined>(initialData?.userCoords || undefined)

  useEffect(() => {
    if ("geolocation" in navigator) {
      setIsLocating(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords
            setUserCoords([latitude, longitude])
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            const data = await response.json()
            if (data && data.address) {
              const city = data.address.city || data.address.town || data.address.village || ""
              const state = data.address.state || ""
              const country = data.address.country || ""
              const locationString = [city || state, country].filter(Boolean).join(", ")
              setFromLocation(locationString)
            }
          } catch (error) {
            console.error("Error fetching location details:", error)
          } finally {
            setIsLocating(false)
          }
        },
        (error) => {
          console.error("Geolocation error:", error)
          setIsLocating(false)
        }
      )
    }
  }, [])

  const togglePreference = (pref: string) => {
    setSelectedPreferences((prev) =>
      prev.includes(pref) ? prev.filter((p) => p !== pref) : [...prev, pref]
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!destination.trim()) return
    onSubmit({
      destination,
      days,
      preferences: selectedPreferences,
      startTime,
      endTime,
      userCoords,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Current Location */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">
          From
        </label>
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/50 px-3 py-2">
          <MapPin className={cn("size-4 text-muted-foreground", isLocating && "animate-pulse text-primary")} />
          <input
            type="text"
            value={fromLocation}
            onChange={(e) => setFromLocation(e.target.value)}
            placeholder={isLocating ? "Locating..." : "Enter your starting location"}
            className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/50"
          />
        </div>
      </div>

      {/* Destination Selector */}
      <div className="flex flex-col gap-2">
        <label
          htmlFor="destination-trigger"
          className="text-sm font-medium text-foreground"
        >
          Destination
        </label>
        <LocationAutocomplete 
          value={destination}
          onChange={setDestination}
          onSelectLocation={onLocationSelect}
        />
      </div>

      {/* Duration Selector */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">
          Duration (days)
        </label>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setDays((d) => Math.max(1, d - 1))}
            disabled={days <= 1}
            className="size-10"
          >
            <Minus className="size-4" />
          </Button>
          <div className="flex h-10 min-w-[4rem] items-center justify-center rounded-md bg-muted/50 px-4 font-semibold text-foreground">
            {days} {days === 1 ? "day" : "days"}
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setDays((d) => Math.min(7, d + 1))}
            disabled={days >= 7}
            className="size-10"
          >
            <Plus className="size-4" />
          </Button>
        </div>
      </div>

      {/* Preferences */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">
          Preferences
        </label>
        <div className="flex flex-wrap gap-2">
          {PREFERENCES.map((pref) => (
            <button
              key={pref}
              type="button"
              onClick={() => togglePreference(pref)}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm font-medium transition-all",
                selectedPreferences.includes(pref)
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {pref}
            </button>
          ))}
        </div>
      </div>

      {/* Time Range */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">
          Daily Schedule
        </label>
        <div className="flex items-center gap-3">
          <div className="flex flex-1 items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
            <Clock className="size-4 text-muted-foreground" />
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none"
            />
          </div>
          <span className="text-sm text-muted-foreground">to</span>
          <div className="flex flex-1 items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
            <Clock className="size-4 text-muted-foreground" />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        disabled={!destination.trim()}
        className="mt-2 h-12 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30"
      >
        Generate Itinerary
      </Button>
    </form>
  )
}

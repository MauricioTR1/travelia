"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Search, Loader2 } from "lucide-react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface LocationSearchResult {
  display_name: string
  lat: string
  lon: string
}

interface LocationAutocompleteProps {
  value: string
  onChange: (value: string) => void
  onSelectLocation?: (lat: number, lng: number) => void
}

export function LocationAutocomplete({ value, onChange, onSelectLocation }: LocationAutocompleteProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState<LocationSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Custom simple debounce if hook doesn't exist, but assuming it exists or we can just implement it here
  const [debouncedQuery, setDebouncedQuery] = useState("")

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery)
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    if (!debouncedQuery) {
      setResults([])
      return
    }

    let isMounted = true
    const fetchLocations = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(debouncedQuery)}&limit=5`
        )
        const data = await response.json()
        if (isMounted) {
          setResults(data)
        }
      } catch (error) {
        console.error("Error fetching locations:", error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchLocations()

    return () => {
      isMounted = false
    }
  }, [debouncedQuery])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-start border-border bg-muted/50 text-left font-normal"
        >
          <Search className="mr-2 size-4 shrink-0 opacity-50" />
          <span className="truncate">
            {value || "Search for a destination..."}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type a city or place..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList className="max-h-[200px] sm:max-h-[300px]">
            <CommandEmpty>
              {isLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="size-4 animate-spin text-muted-foreground" />
                </div>
              ) : (
                "No places found."
              )}
            </CommandEmpty>
            <CommandGroup>
              {results.map((result, index) => (
                <CommandItem
                  key={`${result.lat}-${result.lon}-${index}`}
                  value={result.display_name}
                  onSelect={() => {
                    onChange(result.display_name.split(',')[0]) // Just take the main name for the input
                    if (onSelectLocation) {
                      onSelectLocation(parseFloat(result.lat), parseFloat(result.lon))
                    }
                    setOpen(false)
                    setSearchQuery("")
                  }}
                  className="flex items-start gap-2 py-3"
                >
                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <span className="line-clamp-2 text-sm">{result.display_name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

"use server"

import { generateItinerary, type DayItinerary } from "@/lib/itinerary"

export async function generateItineraryAction(
  destination: string, 
  numDays: number, 
  preferences: string[] = [],
  startTime: string = "09:00",
  endTime: string = "22:00",
  userCoords?: [number, number]
): Promise<DayItinerary[]> {
  return generateItinerary(destination, numDays, preferences, startTime, endTime, userCoords)
}

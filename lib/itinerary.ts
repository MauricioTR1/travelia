export type ActivityType = "breakfast" | "morning" | "lunch" | "afternoon" | "dinner"

export interface ItineraryItem {
  id: string
  time: string
  title: string
  description: string
  type: ActivityType
  lat: number
  lng: number
  info?: string
}

export interface DayItinerary {
  day: number
  items: ItineraryItem[]
}

export interface OSMNode {
  lat: number
  lon: number
  tags: { name: string; [key: string]: any }
}

// Helper to shuffle arrays
function shuffle<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

function generateInfo(node: OSMNode, preferences: string[]): string {
  const tags = node.tags || {}
  let type = "Local place"
  if (tags.amenity === "restaurant") type = "Restaurant"
  else if (tags.amenity === "cafe") type = "Cafe"
  else if (tags.amenity === "bar" || tags.amenity === "pub") type = "Bar/Pub"
  else if (tags.tourism === "museum") type = "Museum"
  else if (tags.tourism === "gallery") type = "Art Gallery"
  else if (tags.historic) type = "Historical Site"
  else if (tags.leisure === "park") type = "Park"
  else if (tags.shop) type = "Shop"
  
  let match = ""
  if (preferences.includes("Local Cuisine") && (tags.amenity === "restaurant" || tags.amenity === "cafe" || tags.cuisine)) match = "Matches your interest in Local Cuisine."
  else if (preferences.includes("Explore historical sites") && tags.historic) match = "Matches your interest in exploring historical sites."
  else if (preferences.includes("Art & Museums") && (tags.tourism === "museum" || tags.tourism === "gallery" || tags.tourism === "artwork")) match = "Perfect for your interest in Art & Museums."
  else if (preferences.includes("Drinking/Bars") && (tags.amenity === "bar" || tags.amenity === "pub" || tags.amenity === "biergarten")) match = "Matches your interest in bars."
  else if (preferences.includes("Shopping") && tags.shop) match = "Great for your shopping preference."
  else if ((preferences.includes("Nature & Outdoors") || preferences.includes("Hang out")) && (tags.leisure === "park" || tags.leisure === "garden" || tags.natural)) match = "Great outdoor spot to hang out."
  else if (preferences.includes("Adventure") && (tags.leisure === "theme_park" || tags.tourism === "theme_park" || tags.leisure === "water_park")) match = "Matches your interest in Adventure."
  
  let hoursText = ""
  if (tags.opening_hours) {
    hoursText = ` (Hours: ${tags.opening_hours})`
  }
  
  return `${type}. ${match}${hoursText}`.trim()
}

function parseTime(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + (m || 0)
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24
  const m = Math.floor(minutes % 60)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

function getActivityInfo(minutes: number, isFood: boolean): { type: ActivityType, titlePrefix: string, descPrefix: string } {
  let h = Math.floor(minutes / 60) % 24
  if (h < 0) h += 24
  
  if (h >= 5 && h < 11) {
    return isFood 
      ? { type: "breakfast", titlePrefix: "Breakfast at", descPrefix: "Start your day with food at" } 
      : { type: "morning", titlePrefix: "Morning visit to", descPrefix: "Explore" }
  } else if (h >= 11 && h < 16) {
    return isFood 
      ? { type: "lunch", titlePrefix: "Lunch at", descPrefix: "Enjoy a midday meal at" } 
      : { type: "afternoon", titlePrefix: "Afternoon activity at", descPrefix: "Discover" }
  } else if (h >= 16 && h < 21) {
    return isFood 
      ? { type: "dinner", titlePrefix: "Dinner at", descPrefix: "Have a wonderful dinner at" } 
      : { type: "afternoon", titlePrefix: "Evening visit to", descPrefix: "Experience the evening at" }
  } else {
    return isFood 
      ? { type: "dinner", titlePrefix: "Late night food at", descPrefix: "Grab a late bite at" } 
      : { type: "dinner", titlePrefix: "Night out at", descPrefix: "Enjoy the nightlife at" }
  }
}

export async function generateItinerary(
  destination: string, 
  numDays: number, 
  preferences: string[] = [],
  startTime: string = "09:00",
  endTime: string = "22:00",
  userCoords?: [number, number]
): Promise<DayItinerary[]> {
  // 1. Get destination coordinates via Nominatim
  let lat = userCoords ? userCoords[0] : 19.4326 // Default to Mexico City if no user coords
  let lon = userCoords ? userCoords[1] : -99.1332

  try {
    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`, {
      headers: {
        "User-Agent": "TraveliaApp/1.0"
      }
    })
    
    if (geoRes.ok) {
      const geoData = await geoRes.json()
      if (geoData && geoData.length > 0) {
        lat = parseFloat(geoData[0].lat)
        lon = parseFloat(geoData[0].lon)
      } else if (!userCoords) {
        throw new Error("Destination not found and no user location available")
      }
    } else {
      console.warn("Nominatim API error:", geoRes.status)
      if (!userCoords) throw new Error("Destination not found and no user location available")
    }
  } catch (err) {
    console.warn("Failed to fetch coordinates:", err)
    if (!userCoords) {
      console.warn("Using default coordinates for Mexico City")
    }
  }

  // 2. Build dynamic query based on preferences
  // Using nwr (nodes, ways, relations) to capture places mapped as areas
  let attractionQueries = `
    nwr["tourism"~"museum|attraction|gallery|viewpoint"](around:5000,${lat},${lon});
    nwr["historic"~"monument|ruins"](around:5000,${lat},${lon});
  `
  
  if (preferences.includes("Explore historical sites")) {
    attractionQueries += `nwr["historic"](around:5000,${lat},${lon});\n`
  }
  if (preferences.includes("Nature & Outdoors") || preferences.includes("Hang out")) {
    attractionQueries += `nwr["leisure"~"park|garden|nature_reserve"](around:5000,${lat},${lon});\n`
    attractionQueries += `nwr["natural"~"beach|peak|water"](around:5000,${lat},${lon});\n`
  }
  if (preferences.includes("Shopping")) {
    attractionQueries += `nwr["shop"~"mall|department_store|clothes|boutique|gift"](around:5000,${lat},${lon});\n`
  }
  if (preferences.includes("Art & Museums")) {
    attractionQueries += `nwr["tourism"~"museum|gallery|artwork"](around:5000,${lat},${lon});\n`
  }
  if (preferences.includes("Drinking/Bars")) {
    attractionQueries += `nwr["amenity"~"bar|pub|biergarten"](around:5000,${lat},${lon});\n`
  }
  if (preferences.includes("Adventure")) {
    attractionQueries += `nwr["leisure"~"water_park|theme_park|escape_game"](around:5000,${lat},${lon});\n`
    attractionQueries += `nwr["tourism"="theme_park"](around:5000,${lat},${lon});\n`
  }

  const overpassQuery = `
    [out:json][timeout:15];
    (
      nwr["amenity"~"restaurant|cafe"](around:5000,${lat},${lon});
      ${attractionQueries}
    );
    out center 300;
  `
  
  const endpoints = [
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://z.overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter"
  ]

  let elements: any[] = []
  let success = false

  for (const endpoint of endpoints) {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)
      
      const overpassRes = await fetch(endpoint, {
        method: "POST",
        body: overpassQuery,
        headers: {
          "User-Agent": "TraveliaApp/1.0",
          "Content-Type": "application/x-www-form-urlencoded"
        },
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (overpassRes.ok) {
        const overpassData = await overpassRes.json()
        elements = overpassData.elements || []
        success = true
        break
      } else {
        console.warn(`Overpass API ${endpoint} failed with status:`, overpassRes.status)
      }
    } catch (error) {
      console.warn(`Error fetching from ${endpoint}:`, error)
    }
  }

  if (!success) {
    console.error("All Overpass API endpoints failed. Using mock data.")
  }

  // 3. Categorize results and extract coordinates properly
  const extractCoords = (e: any) => {
    if (e.lat && e.lon) return { lat: e.lat, lon: e.lon };
    if (e.center && e.center.lat && e.center.lon) return { lat: e.center.lat, lon: e.center.lon };
    return { lat, lon }; // fallback to query center
  };

  const parsedElements = elements.map((e: any) => ({
    ...e,
    lat: extractCoords(e).lat,
    lon: extractCoords(e).lon
  }));

  const cafes = parsedElements.filter((e: any) => e.tags?.amenity === "cafe" && e.tags.name) as OSMNode[]
  const restaurants = parsedElements.filter((e: any) => e.tags?.amenity === "restaurant" && e.tags.name) as OSMNode[]
  const attractions = parsedElements.filter((e: any) => 
    (e.tags?.tourism || e.tags?.historic || e.tags?.leisure || e.tags?.natural || e.tags?.shop || (e.tags?.amenity && e.tags.amenity !== "cafe" && e.tags.amenity !== "restaurant")) && e.tags.name
  ) as OSMNode[]

  // Fallback mock pools if Overpass didn't find enough places
  const mockCafes: OSMNode[] = [
    { tags: { name: "Local Café" }, lat: lat + 0.001, lon: lon + 0.001 },
    { tags: { name: "Morning Brew" }, lat: lat - 0.001, lon: lon - 0.002 },
  ]
  const mockRestaurants: OSMNode[] = [
    { tags: { name: "City Restaurant" }, lat: lat + 0.002, lon: lon - 0.001 },
    { tags: { name: "Traditional Tavern" }, lat: lat - 0.002, lon: lon + 0.001 },
  ]
  const mockAttractions: OSMNode[] = [
    { tags: { name: "City Center Square" }, lat: lat + 0.003, lon: lon },
    { tags: { name: "Historic Viewpoint" }, lat: lat, lon: lon + 0.003 },
  ]

  const availableCafes = cafes.length > 0 ? shuffle(cafes) : mockCafes
  const availableRestaurants = restaurants.length > 0 ? shuffle(restaurants) : mockRestaurants
  const availableAttractions = attractions.length > 0 ? shuffle(attractions) : mockAttractions

  const startMin = parseTime(startTime)
  let endMin = parseTime(endTime)
  if (endMin <= startMin) endMin += 24 * 60 // Handle overnight schedules
  const diff = endMin - startMin
  
  let numActivities = 1
  if (diff >= 8 * 60) numActivities = 5
  else if (diff >= 6 * 60) numActivities = 4
  else if (diff >= 4 * 60) numActivities = 3
  else if (diff >= 2 * 60) numActivities = 2

  const step = numActivities > 1 ? diff / (numActivities - 1) : 0

  // 4. Construct days
  return Array.from({ length: numDays }, (_, dayIndex) => {
    const day = dayIndex + 1
    
    const items: ItineraryItem[] = []
    
    for (let i = 0; i < numActivities; i++) {
      const min = startMin + step * i
      const isFood = i % 2 === 0
      
      const info = getActivityInfo(min, isFood)
      let place: OSMNode
      if (isFood) {
        const h = Math.floor((min % (24 * 60)) / 60)
        if (h >= 5 && h < 11) {
          place = availableCafes[(dayIndex * numActivities + i) % availableCafes.length]
        } else {
          place = availableRestaurants[(dayIndex * numActivities + i) % availableRestaurants.length]
        }
      } else {
        place = availableAttractions[(dayIndex * numActivities + i) % availableAttractions.length]
      }
      
      items.push({
        id: `${day}-item-${i}`,
        time: formatTime(min),
        title: `${info.titlePrefix} ${place.tags.name}`,
        description: `${info.descPrefix} ${destination}`,
        type: info.type,
        lat: place.lat,
        lng: place.lon,
        info: generateInfo(place, preferences),
      })
    }

    return { day, items }
  })
}

export function googleMapsUrl(item: ItineraryItem, destination: string): string {
  // Use exact coordinates for Google Maps instead of just name query if we have them
  if (item.lat && item.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${item.lat},${item.lng}`
  }
  const query = encodeURIComponent(`${item.title}, ${destination}`)
  return `https://www.google.com/maps/search/?api=1&query=${query}`
}

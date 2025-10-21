"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// Declare google global
declare global {
  interface Window {
    google: typeof google
  }
}

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void
  initialLat?: number
  initialLng?: number
  initialAddress?: string
}

export function MapPicker({ onLocationSelect, initialLat, initialLng, initialAddress }: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [address, setAddress] = useState(initialAddress || "")
  const [isLoading, setIsLoading] = useState(false)
  const [coordinates, setCoordinates] = useState({
    lat: initialLat || 0,
    lng: initialLng || 0,
  })
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    const initializeMap = async () => {
      if (typeof window === "undefined" || !mapRef.current) return

      setIsLoading(true)

      try {
        // Load Google Maps script if not already loaded
        if (!window.google?.maps) {
          // Check if script is already being loaded
          const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
          
          if (!existingScript) {
            const script = document.createElement('script')
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMaps`
            script.async = true
            script.defer = true
            
            await new Promise<void>((resolve, reject) => {
              // Create global callback function
              (window as any).initGoogleMaps = () => {
                delete (window as any).initGoogleMaps // Cleanup
                resolve()
              }
              script.onerror = () => reject(new Error('Failed to load Google Maps'))
              document.head.appendChild(script)
            })
          } else {
            // Script is loading, wait for it to be ready
            await new Promise<void>((resolve) => {
              const checkGoogleMaps = setInterval(() => {
                if (window.google?.maps?.Map) {
                  clearInterval(checkGoogleMaps)
                  resolve()
                }
              }, 100)
            })
          }
        }

        // Initialize map
        const initialPosition = { 
          lat: initialLat || 0, 
          lng: initialLng || 0 
        }

        const googleMap = new google.maps.Map(mapRef.current, {
          center: initialPosition,
          zoom: initialLat ? 15 : 2,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        })

        setMap(googleMap)

        // Add initial marker if coordinates exist
        if (initialLat && initialLng) {
          const googleMarker = new google.maps.Marker({
            position: initialPosition,
            map: googleMap,
            draggable: true,
          })

          setMarker(googleMarker)

          // Handle marker drag
          googleMarker.addListener("dragend", async () => {
            const position = googleMarker.getPosition()
            if (position) {
              const lat = position.lat()
              const lng = position.lng()
              setCoordinates({ lat, lng })
              await reverseGeocode(lat, lng)
            }
          })
        }

        // Add click listener to map
        googleMap.addListener("click", async (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            const lat = e.latLng.lat()
            const lng = e.latLng.lng()
            
            setCoordinates({ lat, lng })

            // Update or create marker
            if (marker) {
              marker.setPosition(e.latLng)
            } else {
              const newMarker = new google.maps.Marker({
                position: e.latLng,
                map: googleMap,
                draggable: true,
              })

              setMarker(newMarker)

              // Handle marker drag
              newMarker.addListener("dragend", async () => {
                const position = newMarker.getPosition()
                if (position) {
                  const lat = position.lat()
                  const lng = position.lng()
                  setCoordinates({ lat, lng })
                  await reverseGeocode(lat, lng)
                }
              })
            }

            await reverseGeocode(lat, lng)
          }
        })

        // Initialize autocomplete for input
        if (inputRef.current) {
          const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
            fields: ["formatted_address", "geometry", "name"],
            types: ["address"],
          })

          setAutocomplete(autocompleteInstance)

          // Handle place selection from autocomplete
          autocompleteInstance.addListener("place_changed", () => {
            const place = autocompleteInstance.getPlace()

            if (place.geometry?.location) {
              const lat = place.geometry.location.lat()
              const lng = place.geometry.location.lng()
              const addr = place.formatted_address || place.name || ""

              setCoordinates({ lat, lng })
              setAddress(addr)
              onLocationSelect(lat, lng, addr)

              // Update map view
              googleMap.setCenter({ lat, lng })
              googleMap.setZoom(15)

              // Update or create marker
              if (marker) {
                marker.setPosition({ lat, lng })
              } else {
                const newMarker = new google.maps.Marker({
                  position: { lat, lng },
                  map: googleMap,
                  draggable: true,
                })

                setMarker(newMarker)

                newMarker.addListener("dragend", async () => {
                  const position = newMarker.getPosition()
                  if (position) {
                    const lat = position.lat()
                    const lng = position.lng()
                    setCoordinates({ lat, lng })
                    await reverseGeocode(lat, lng)
                  }
                })
              }
            }
          })
        }
      } catch (error) {
        console.error("Error loading Google Maps:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeMap()
  }, [])

  // Reverse geocoding function
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const geocoder = new google.maps.Geocoder()
      const response = await geocoder.geocode({ location: { lat, lng } })

      if (response.results[0]) {
        const addr = response.results[0].formatted_address
        setAddress(addr)
        onLocationSelect(lat, lng, addr)
      } else {
        const addr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        setAddress(addr)
        onLocationSelect(lat, lng, addr)
      }
    } catch (error) {
      console.error("Geocoding error:", error)
      const addr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setAddress(addr)
      onLocationSelect(lat, lng, addr)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="address-search">
          Search Address
          {isLoading && <span className="text-xs text-muted-foreground ml-2">(Loading...)</span>}
        </Label>
        <div className="relative">
          <Input
            ref={inputRef}
            id="address-search"
            placeholder="Start typing address for suggestions..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isLoading}
            className="pr-10"
          />
          {isLoading ? (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Type to search or click on the map to select a location. Marker can be dragged.
        </p>
      </div>

      <div 
        ref={mapRef} 
        className="h-[400px] w-full rounded-lg border border-border overflow-hidden bg-muted flex items-center justify-center"
      >
        {isLoading && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading Google Maps...</p>
          </div>
        )}
      </div>

      {coordinates.lat !== 0 && coordinates.lng !== 0 && (
        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm font-medium mb-1">Selected Location:</p>
          <p className="text-xs text-muted-foreground">
            Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
          </p>
          {address && (
            <p className="text-xs text-muted-foreground mt-1">
              Address: {address}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"

// Declare google global
declare global {
  interface Window {
    google: typeof google
  }
}

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string, lat?: number, lng?: number) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function AddressAutocomplete({ 
  value, 
  onChange, 
  placeholder = "Search city or address...",
  className = "",
  disabled = false 
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    const initializeAutocomplete = async () => {
      if (typeof window === "undefined" || !inputRef.current) return

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
                if (window.google?.maps?.places?.Autocomplete) {
                  clearInterval(checkGoogleMaps)
                  resolve()
                }
              }, 100)
            })
          }
        }

        // Initialize autocomplete
        const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ["formatted_address", "geometry", "name", "address_components"],
          types: ["(cities)", "address"],
        })

        setAutocomplete(autocompleteInstance)

        // Handle place selection
        autocompleteInstance.addListener("place_changed", () => {
          const place = autocompleteInstance.getPlace()

          if (place.geometry?.location) {
            const lat = place.geometry.location.lat()
            const lng = place.geometry.location.lng()
            
            // Extract city from address components
            let cityName = ""
            if (place.address_components) {
              const cityComponent = place.address_components.find(
                (component: any) => component.types.includes("locality")
              )
              cityName = cityComponent?.long_name || place.name || place.formatted_address || ""
            } else {
              cityName = place.name || place.formatted_address || ""
            }

            onChange(cityName, lat, lng)
          } else {
            onChange(place.name || place.formatted_address || "")
          }
        })

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading Google Places:", error)
        setIsLoading(false)
      }
    }

    initializeAutocomplete()
  }, [])

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled || isLoading}
        className={className}
      />
      {isLoading ? (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      )}
    </div>
  )
}

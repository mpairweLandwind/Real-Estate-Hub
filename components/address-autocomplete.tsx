"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { loadGoogleMapsAPI } from "@/lib/google-maps-loader"

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
  const autocompleteInstanceRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    let mounted = true
    
    const initializeAutocomplete = async () => {
      if (typeof window === "undefined" || !inputRef.current || !mounted) return

      setIsLoading(true)

      try {
        // Load Google Maps using shared loader
        await loadGoogleMapsAPI()

        if (!mounted) return

        // Initialize autocomplete
        const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
          fields: ["formatted_address", "geometry", "name", "address_components"],
          types: ["(cities)", "address"],
        })

        if (mounted) {
          autocompleteInstanceRef.current = autocompleteInstance
          setAutocomplete(autocompleteInstance)
        }

        // Handle place selection
        autocompleteInstance.addListener("place_changed", () => {
          if (!mounted) return
          
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

        if (mounted) setIsLoading(false)
      } catch (error) {
        console.error("Error loading Google Places:", error)
        if (mounted) setIsLoading(false)
      }
    }

    initializeAutocomplete()

    // Cleanup function
    return () => {
      mounted = false
      
      if (autocompleteInstanceRef.current) {
        try {
          google.maps.event.clearInstanceListeners(autocompleteInstanceRef.current)
          autocompleteInstanceRef.current = null
        } catch (error) {
          console.error("Error cleaning up autocomplete:", error)
        }
      }
    }
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

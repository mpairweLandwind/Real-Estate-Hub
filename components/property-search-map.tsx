"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bed, Bath, Maximize, X } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

interface Property {
  id: string
  title: string
  description: string | null
  property_type: string
  listing_type: string
  price: number
  bedrooms: number | null
  bathrooms: number | null
  area_sqft: number | null
  address: string
  city: string
  state: string | null
  country: string
  latitude: number
  longitude: number
  status: string
}

interface PropertySearchMapProps {
  properties: Property[]
}

export function PropertySearchMap({ properties }: PropertySearchMapProps) {
  const t = useTranslations("properties")
  const mapRef = useRef<HTMLDivElement>(null)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [map, setMap] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && mapRef.current && !map) {
      const L = require("leaflet")
      require("leaflet/dist/leaflet.css")

      // Fix for default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      const newMap = L.map(mapRef.current).setView([0, 0], 2)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(newMap)

      setMap(newMap)

      return () => {
        newMap.remove()
      }
    }
  }, [])

  useEffect(() => {
    if (map && properties.length > 0) {
      const L = require("leaflet")

      // Clear existing markers
      map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
          map.removeLayer(layer)
        }
      })

      // Add markers for each property
      const bounds: any[] = []
      properties.forEach((property) => {
        if (property.latitude && property.longitude) {
          const marker = L.marker([property.latitude, property.longitude])
            .addTo(map)
            .on("click", () => {
              setSelectedProperty(property)
            })

          // Custom popup
          marker.bindPopup(`
            <div style="min-width: 200px;">
              <strong>${property.title}</strong><br/>
              <span style="color: #16a34a; font-weight: bold;">$${property.price.toLocaleString()}</span><br/>
              <small>${property.city}, ${property.country}</small>
            </div>
          `)

          bounds.push([property.latitude, property.longitude])
        }
      })

      // Fit map to show all markers
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [map, properties])

  return (
    <div className="relative h-full">
      <div ref={mapRef} className="h-full w-full rounded-lg" />

      {selectedProperty && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:w-96 z-[1000]">
          <Card className="shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-serif font-bold text-lg line-clamp-1">
                    {selectedProperty.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedProperty.city}, {selectedProperty.country}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setSelectedProperty(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-3 mb-3 text-sm">
                {selectedProperty.bedrooms && (
                  <div className="flex items-center gap-1">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedProperty.bedrooms}</span>
                  </div>
                )}
                {selectedProperty.bathrooms && (
                  <div className="flex items-center gap-1">
                    <Bath className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedProperty.bathrooms}</span>
                  </div>
                )}
                {selectedProperty.area_sqft && (
                  <div className="flex items-center gap-1">
                    <Maximize className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedProperty.area_sqft} sqft</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">
                    ${selectedProperty.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedProperty.listing_type === "rent"
                      ? t("perMonth")
                      : t(`listingTypes.${selectedProperty.listing_type}`)}
                  </p>
                </div>
                <Link href={`/browse/${selectedProperty.id}`}>
                  <Button size="sm">{t("viewDetails")}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

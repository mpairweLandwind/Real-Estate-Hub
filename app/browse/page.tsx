import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PropertySearchMap } from "@/components/property-search-map"
import { Building2, Bed, Bath, Maximize, MapPin, Search } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; listing?: string; city?: string }>
}) {
  const t = await getTranslations("browse")

  const params = await searchParams
  const supabase = await createClient()

  // Build query
  let query = supabase.from("properties").select("*").eq("status", "available")

  if (params.type) {
    query = query.eq("property_type", params.type)
  }
  if (params.listing) {
    query = query.eq("listing_type", params.listing)
  }
  if (params.city) {
    query = query.ilike("city", `%${params.city}%`)
  }

  const { data: properties, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching properties:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <form className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  name="city"
                  placeholder={t("filters.searchCity")}
                  defaultValue={params.city}
                  className="w-full"
                />
              </div>
              <Select name="type" defaultValue={params.type || "all"}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder={t("filters.propertyType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.allTypes")}</SelectItem>
                  <SelectItem value="apartment">{t("filters.types.apartment")}</SelectItem>
                  <SelectItem value="house">{t("filters.types.house")}</SelectItem>
                  <SelectItem value="commercial">{t("filters.types.commercial")}</SelectItem>
                  <SelectItem value="land">{t("filters.types.land")}</SelectItem>
                  <SelectItem value="office">{t("filters.types.office")}</SelectItem>
                </SelectContent>
              </Select>
              <Select name="listing" defaultValue={params.listing || "all"}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder={t("filters.listingType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("filters.allListings")}</SelectItem>
                  <SelectItem value="rent">{t("filters.listings.rent")}</SelectItem>
                  <SelectItem value="sale">{t("filters.listings.sale")}</SelectItem>
                  <SelectItem value="both">{t("filters.listings.both")}</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" className="gap-2">
                <Search className="h-4 w-4" />
                {t("filters.search")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map View */}
          <div className="lg:sticky lg:top-4 h-[600px]">
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <PropertySearchMap properties={properties || []} />
              </CardContent>
            </Card>
          </div>

          {/* List View */}
          <div className="space-y-4">
            {!properties || properties.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent className="space-y-4">
                  <div className="flex justify-center">
                    <div className="rounded-full bg-muted p-6">
                      <Building2 className="h-12 w-12 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-serif font-bold mb-2">{t("noProperties.title")}</h3>
                    <p className="text-muted-foreground">{t("noProperties.subtitle")}</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  {t("resultsCount", { count: properties.length })}
                </p>
                {properties.map((property) => (
                  <Card
                    key={property.id}
                    className="overflow-hidden hover:border-primary/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-48 aspect-video sm:aspect-square bg-muted flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1">
                            <h3 className="font-serif font-bold text-lg line-clamp-1">
                              {property.title}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              <span>
                                {property.city}, {property.country}
                              </span>
                            </div>
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            {property.property_type}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {property.description || t("noDescription")}
                        </p>

                        <div className="flex items-center gap-4 text-sm mb-3">
                          {property.bedrooms && (
                            <div className="flex items-center gap-1">
                              <Bed className="h-4 w-4 text-muted-foreground" />
                              <span>{property.bedrooms}</span>
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="flex items-center gap-1">
                              <Bath className="h-4 w-4 text-muted-foreground" />
                              <span>{property.bathrooms}</span>
                            </div>
                          )}
                          {property.area_sqft && (
                            <div className="flex items-center gap-1">
                              <Maximize className="h-4 w-4 text-muted-foreground" />
                              <span>{property.area_sqft} sqft</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <div>
                            <p className="text-2xl font-bold text-primary">
                              ${property.price.toLocaleString()}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {property.listing_type === "rent"
                                ? t("perMonth")
                                : property.listing_type}
                            </p>
                          </div>
                          <Link href={`/browse/${property.id}`}>
                            <Button size="sm">{t("viewDetails")}</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

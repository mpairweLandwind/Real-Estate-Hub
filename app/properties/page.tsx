import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Building2, Bed, Bath, Maximize, MapPin, Plus } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function PropertiesPage() {
  const t = await getTranslations("properties")
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's properties
  const { data: properties, error } = await supabase
    .from("properties")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching properties:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">{t("myProperties")}</h1>
            <p className="text-muted-foreground">{t("listProperty")}</p>
          </div>
          <Link href="/properties/add">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("addProperty")}
            </Button>
          </Link>
        </div>

        {!properties || properties.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-muted p-6">
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold mb-2">{t("noProperties")}</h3>
                <p className="text-muted-foreground mb-6">{t("createFirst")}</p>
                <Link href="/properties/add">
                  <Button>{t("addNewProperty")}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card
                key={property.id}
                className="overflow-hidden hover:border-primary/50 transition-colors"
              >
                <div className="aspect-video bg-muted flex items-center justify-center">
                  <Building2 className="h-12 w-12 text-muted-foreground" />
                </div>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <CardTitle className="text-xl font-serif line-clamp-1">
                      {property.title}
                    </CardTitle>
                    <Badge variant={property.status === "available" ? "default" : "secondary"}>
                      {property.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {property.description || "No description"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">
                      {property.city}, {property.country}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
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

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        ${property.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {property.listing_type === "rent" ? t("perMonth") : property.listing_type}
                      </p>
                    </div>
                    <Link href={`/properties/${property.id}`}>
                      <Button variant="outline" size="sm">
                        {t("edit")}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

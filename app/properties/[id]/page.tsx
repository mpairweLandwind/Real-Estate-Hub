"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { useToast } from "@/components/ui/toast"
import { Building2, Bed, Bath, Maximize, MapPin, ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useTranslations } from "next-intl"

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const t = useTranslations("properties")
  const router = useRouter()
  const supabase = createClient()
  const { addToast } = useToast()
  const [property, setProperty] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    async function fetchProperty() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", params.id)
        .eq("owner_id", user.id)
        .single()

      if (error || !data) {
        addToast({
          title: "Error",
          description: "Property not found or you don't have permission to view it",
          variant: "error",
        })
        router.push("/properties")
        return
      }

      setProperty(data)
      setIsLoading(false)
    }

    fetchProperty()
  }, [params.id])

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      const { error } = await supabase.from("properties").delete().eq("id", params.id)

      if (error) throw error

      addToast({
        title: "Success!",
        description: "Property deleted successfully",
        variant: "success",
      })

      router.push("/properties")
    } catch (err: any) {
      console.error("[v0] Error deleting property:", err)
      addToast({
        title: "Error",
        description: err.message || "Failed to delete property",
        variant: "error",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <p>{t("loading")}</p>
        </div>
      </div>
    )
  }

  if (!property) return null

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/properties">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("backToProperties")}
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link href={`/properties/${params.id}/edit`}>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <Edit className="h-4 w-4" />
                {t("edit")}
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive bg-transparent"
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
              {t("delete")}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted flex items-center justify-center rounded-t-lg">
                  <Building2 className="h-24 w-24 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-3xl font-serif mb-2">{property.title}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {property.address}, {property.city}, {property.country}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {t(`status.${property.status}`)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  {property.bedrooms && (
                    <div className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{property.bedrooms}</p>
                        <p className="text-xs text-muted-foreground">{t("bedrooms")}</p>
                      </div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{property.bathrooms}</p>
                        <p className="text-xs text-muted-foreground">{t("bathrooms")}</p>
                      </div>
                    </div>
                  )}
                  {property.area_sqft && (
                    <div className="flex items-center gap-2">
                      <Maximize className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{property.area_sqft}</p>
                        <p className="text-xs text-muted-foreground">{t("sqFt")}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-serif font-bold text-xl mb-2">{t("description")}</h3>
                  <p className="text-muted-foreground leading-relaxed">{property.description || t("noDescription")}</p>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-xl mb-3">{t("propertyDetails")}</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">{t("propertyType")}</span>
                      <span className="font-medium capitalize">{t(`types.${property.property_type}`)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">{t("listingType")}</span>
                      <span className="font-medium capitalize">{t(`listingTypes.${property.listing_type}`)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">{t("city")}</span>
                      <span className="font-medium">{property.city}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">{t("country")}</span>
                      <span className="font-medium">{property.country}</span>
                    </div>
                    {property.postal_code && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">{t("postalCode")}</span>
                        <span className="font-medium">{property.postal_code}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">{t("listed")}</span>
                      <span className="font-medium">{new Date(property.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <p className="text-4xl font-bold text-primary mb-1">${property.price.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {property.listing_type === "rent" ? t("perMonth") : t(`listingTypes.${property.listing_type}`)}
                  </p>
                </div>
                <Link href={`/browse/${params.id}`}>
                  <Button className="w-full">{t("viewPublicListing")}</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title={t("deleteProperty")}
        description={t("deletePropertyConfirm")}
        onConfirm={handleDelete}
        confirmText={isDeleting ? t("deleting") : t("delete")}
        variant="destructive"
      />
    </div>
  )
}

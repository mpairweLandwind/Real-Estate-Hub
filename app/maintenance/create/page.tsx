"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ImageUpload } from "@/components/image-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPicker } from "@/components/map-picker"
import { useToast } from "@/hooks/use-toast"
import { maintenanceSchema } from "@/lib/validations"
import { ArrowLeft, Building2, Plus } from "lucide-react"
import Link from "next/link"
import { z } from "zod"
import { useTranslations } from "next-intl"

export default function CreateMaintenanceRequestPage() {
  const t = useTranslations("maintenance")
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [properties, setProperties] = useState<any[]>([])
  const [propertyMode, setPropertyMode] = useState<"existing" | "new">("existing")
  const [images, setImages] = useState<string[]>([])

  const [formData, setFormData] = useState({
    propertyId: "",
    title: "",
    description: "",
    category: "plumbing",
    priority: "medium",
    estimatedCost: "",
  })

  const [newPropertyData, setNewPropertyData] = useState({
    title: "",
    address: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    latitude: 0,
    longitude: 0,
    propertyType: "apartment",
  })

  useEffect(() => {
    async function fetchProperties() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from("properties")
        .select("id, title, address, city")
        .eq("owner_id", user.id)

      if (data) setProperties(data)
    }
    fetchProperties()
  }, [])

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setNewPropertyData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      address: address,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      let propertyId = formData.propertyId

      // If creating new property, insert it first
      if (propertyMode === "new") {
        // Validate new property data
        if (
          !newPropertyData.title ||
          !newPropertyData.address ||
          !newPropertyData.city ||
          !newPropertyData.country
        ) {
          throw new Error("Please fill in all required property fields")
        }

        if (newPropertyData.latitude === 0 && newPropertyData.longitude === 0) {
          throw new Error("Please select a location on the map")
        }

        const { data: newProperty, error: propertyError } = await supabase
          .from("properties")
          .insert({
            owner_id: user.id,
            title: newPropertyData.title,
            property_type: newPropertyData.propertyType,
            listing_type: "rent", // Default for maintenance properties
            price: 0, // Not applicable for maintenance-only properties
            address: newPropertyData.address,
            city: newPropertyData.city,
            state: newPropertyData.state,
            country: newPropertyData.country,
            postal_code: newPropertyData.postalCode,
            latitude: newPropertyData.latitude,
            longitude: newPropertyData.longitude,
            status: "available",
          })
          .select()

        if (propertyError) throw propertyError
        if (!newProperty || newProperty.length === 0) throw new Error("Failed to create property")

        propertyId = newProperty[0].id

        // Insert property images if any
        if (images.length > 0) {
          const imageInserts = images.map((imageUrl, index) => ({
            property_id: propertyId,
            image_url: imageUrl,
            is_primary: index === 0,
            display_order: index,
          }))

          const { error: imagesError } = await supabase.from("property_images").insert(imageInserts)

          if (imagesError) {
            console.error("Error inserting images:", imagesError)
          }
        }
      }

      const validatedData = maintenanceSchema.parse({
        propertyId: propertyId,
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        estimatedCost: formData.estimatedCost ? Number.parseFloat(formData.estimatedCost) : null,
      })

      const { error: insertError } = await supabase.from("maintenance_requests").insert({
        property_id: validatedData.propertyId,
        requester_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        priority: validatedData.priority,
        estimated_cost: validatedData.estimatedCost,
        status: "pending",
      })

      if (insertError) throw insertError

      toast({
        title: "Success!",
        description: "Maintenance request created successfully",
        // variant: "default", // success not available in Radix toast
      })

      router.push("/maintenance")
    } catch (err: any) {
      console.error("[v0] Error creating maintenance request:", err)

      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        err.errors.forEach((error) => {
          newErrors[error.path[0] as string] = error.message
        })
        setErrors(newErrors)
      }

      toast({
        title: "Error",
        description: err.message || "Failed to create request",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/maintenance">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("backToMaintenance")}
            </Button>
          </Link>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-serif">{t("createRequest")}</CardTitle>
            <CardDescription>{t("createRequestDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Property Selection Tabs */}
              <Tabs
                value={propertyMode}
                onValueChange={(value) => setPropertyMode(value as "existing" | "new")}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="existing" className="gap-2">
                    <Building2 className="h-4 w-4" />
                    {t("propertySelection.existing")}
                  </TabsTrigger>
                  <TabsTrigger value="new" className="gap-2">
                    <Plus className="h-4 w-4" />
                    {t("propertySelection.register")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="existing" className="space-y-4 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="property">{t("property")} *</Label>
                    <Select
                      value={formData.propertyId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, propertyId: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectProperty")} />
                      </SelectTrigger>
                      <SelectContent>
                        {properties.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            {t("propertySelection.noProperties")}
                          </div>
                        ) : (
                          properties.map((property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.title} - {property.city}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {errors.propertyId && (
                      <p className="text-sm text-destructive">{errors.propertyId}</p>
                    )}
                    {properties.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        {t("propertySelection.noPropertiesHint")}
                      </p>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="new" className="space-y-4 mt-6">
                  <div className="space-y-4 p-4 border border-border rounded-lg bg-muted/50">
                    <h3 className="font-semibold text-sm">{t("propertySelection.registerNew")}</h3>

                    <div className="space-y-2">
                      <Label htmlFor="newPropertyTitle">
                        {t("propertySelection.propertyName")} *
                      </Label>
                      <Input
                        id="newPropertyTitle"
                        placeholder={t("propertySelection.propertyNamePlaceholder")}
                        value={newPropertyData.title}
                        onChange={(e) =>
                          setNewPropertyData((prev) => ({ ...prev, title: e.target.value }))
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="propertyType">{t("propertySelection.propertyType")} *</Label>
                      <Select
                        value={newPropertyData.propertyType}
                        onValueChange={(value) =>
                          setNewPropertyData((prev) => ({ ...prev, propertyType: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="apartment">
                            {t("propertySelection.types.apartment")}
                          </SelectItem>
                          <SelectItem value="house">
                            {t("propertySelection.types.house")}
                          </SelectItem>
                          <SelectItem value="commercial">
                            {t("propertySelection.types.commercial")}
                          </SelectItem>
                          <SelectItem value="office">
                            {t("propertySelection.types.office")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">{t("propertySelection.city")} *</Label>
                        <Input
                          id="city"
                          placeholder="New York"
                          value={newPropertyData.city}
                          onChange={(e) =>
                            setNewPropertyData((prev) => ({ ...prev, city: e.target.value }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state">{t("propertySelection.state")}</Label>
                        <Input
                          id="state"
                          placeholder="NY"
                          value={newPropertyData.state}
                          onChange={(e) =>
                            setNewPropertyData((prev) => ({ ...prev, state: e.target.value }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">{t("propertySelection.country")} *</Label>
                        <Input
                          id="country"
                          placeholder="USA"
                          value={newPropertyData.country}
                          onChange={(e) =>
                            setNewPropertyData((prev) => ({ ...prev, country: e.target.value }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postalCode">{t("propertySelection.postalCode")}</Label>
                        <Input
                          id="postalCode"
                          placeholder="10001"
                          value={newPropertyData.postalCode}
                          onChange={(e) =>
                            setNewPropertyData((prev) => ({ ...prev, postalCode: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>{t("propertySelection.location")} *</Label>
                      <MapPicker
                        onLocationSelect={handleLocationSelect}
                        initialLat={newPropertyData.latitude}
                        initialLng={newPropertyData.longitude}
                        initialAddress={newPropertyData.address}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{t("propertySelection.images")}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("propertySelection.imagesHint")}
                      </p>
                      <ImageUpload
                        images={images}
                        onImagesChange={setImages}
                        maxImages={6}
                        folder="properties"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Maintenance Request Details */}
              <div className="pt-4 border-t border-border space-y-4">
                <h3 className="font-semibold">{t("requestDetails.title")}</h3>

                <div className="space-y-2">
                  <Label htmlFor="title">{t("requestTitle")} *</Label>
                  <Input
                    id="title"
                    placeholder={t("requestTitlePlaceholder")}
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  />
                  {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t("description")} *</Label>
                  <Textarea
                    id="description"
                    placeholder={t("descriptionPlaceholder")}
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">{t("category")} *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plumbing">{t("categories.plumbing")}</SelectItem>
                        <SelectItem value="electrical">{t("categories.electrical")}</SelectItem>
                        <SelectItem value="hvac">{t("categories.hvac")}</SelectItem>
                        <SelectItem value="carpentry">{t("categories.carpentry")}</SelectItem>
                        <SelectItem value="painting">{t("categories.painting")}</SelectItem>
                        <SelectItem value="cleaning">{t("categories.cleaning")}</SelectItem>
                        <SelectItem value="landscaping">{t("categories.landscaping")}</SelectItem>
                        <SelectItem value="other">{t("categories.other")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">{t("priority.label")} *</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{t("priority.low")}</SelectItem>
                        <SelectItem value="medium">{t("priority.medium")}</SelectItem>
                        <SelectItem value="high">{t("priority.high")}</SelectItem>
                        <SelectItem value="urgent">{t("priority.urgent")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedCost">{t("estimatedCost")}</Label>
                  <Input
                    id="estimatedCost"
                    type="number"
                    placeholder="500"
                    value={formData.estimatedCost}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, estimatedCost: e.target.value }))
                    }
                  />
                  {errors.estimatedCost && (
                    <p className="text-sm text-destructive">{errors.estimatedCost}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? t("creatingRequest") : t("createRequest")}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/maintenance")}>
                  {t("cancel")}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

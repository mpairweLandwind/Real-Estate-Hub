import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PaymentModal } from "@/components/payment-modal"
import { Building2, Bed, Bath, Maximize, MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: property, error } = await supabase
    .from("properties")
    .select("*, profiles(full_name)")
    .eq("id", id)
    .single()

  if (error || !property) {
    notFound()
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/browse">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Browse
            </Button>
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-muted flex items-center justify-center rounded-t-lg">
                  <Building2 className="h-24 w-24 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            {/* Property Details */}
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
                    {property.status}
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
                        <p className="text-xs text-muted-foreground">Bedrooms</p>
                      </div>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{property.bathrooms}</p>
                        <p className="text-xs text-muted-foreground">Bathrooms</p>
                      </div>
                    </div>
                  )}
                  {property.area_sqft && (
                    <div className="flex items-center gap-2">
                      <Maximize className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-semibold">{property.area_sqft}</p>
                        <p className="text-xs text-muted-foreground">Sq Ft</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-serif font-bold text-xl mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description || "No description available for this property."}
                  </p>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-xl mb-3">Property Details</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Property Type</span>
                      <span className="font-medium capitalize">{property.property_type}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Listing Type</span>
                      <span className="font-medium capitalize">{property.listing_type}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">City</span>
                      <span className="font-medium">{property.city}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Country</span>
                      <span className="font-medium">{property.country}</span>
                    </div>
                    {property.postal_code && (
                      <div className="flex justify-between py-2 border-b border-border">
                        <span className="text-muted-foreground">Postal Code</span>
                        <span className="font-medium">{property.postal_code}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted-foreground">Listed</span>
                      <span className="font-medium">{new Date(property.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            {property.latitude && property.longitude && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <Card>
              <CardContent className="p-6">
                <div className="mb-6">
                  <p className="text-4xl font-bold text-primary mb-1">${property.price.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    {property.listing_type === "rent" ? "per month" : property.listing_type}
                  </p>
                </div>
                {user && (
                  <PaymentModal
                    propertyId={property.id}
                    amount={property.price}
                    transactionType={property.listing_type === "rent" ? "rent" : "sale"}
                  />
                )}
                <Button variant="outline" className="w-full mt-3 bg-transparent">
                  Schedule Viewing
                </Button>
              </CardContent>
            </Card>

            {/* Owner Info */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Listed By</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 h-12 w-12 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{property.profiles?.full_name || "Property Owner"}</p>
                    <p className="text-sm text-muted-foreground">Verified Owner</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Views</span>
                  <span className="font-semibold">124</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Inquiries</span>
                  <span className="font-semibold">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Days Listed</span>
                  <span className="font-semibold">
                    {Math.floor((Date.now() - new Date(property.created_at).getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

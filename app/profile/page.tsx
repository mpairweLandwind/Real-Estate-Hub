import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, Mail, Phone, Calendar, Building2 } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

export default async function ProfilePage() {
  const t = await getTranslations("profile")

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch user statistics
  const { count: propertiesCount } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", user.id)

  const { count: maintenanceCount } = await supabase
    .from("maintenance_requests")
    .select("*", { count: "exact", head: true })
    .eq("requester_id", user.id)

  const { data: transactions } = await supabase
    .from("transactions")
    .select("amount, status")
    .eq("user_id", user.id)
    .eq("status", "completed")

  const totalSpent = transactions?.reduce((sum, t) => sum + Number.parseFloat(t.amount.toString()), 0) || 0

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">{t("myProfile")}</h1>
          <p className="text-muted-foreground">{t("manageAccount")}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">{t("personalInfo")}</CardTitle>
                <CardDescription>{t("accountDetails")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-primary/10 h-20 w-20 flex items-center justify-center">
                    <User className="h-10 w-10 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-serif font-bold">{profile?.full_name || t("user")}</h3>
                    <Badge variant="secondary" className="mt-1 capitalize">
                      {profile?.user_type || t("user")}
                    </Badge>
                  </div>
                  <Link href="/profile/edit">
                    <Button variant="outline" className="bg-transparent">
                      {t("editProfile")}
                    </Button>
                  </Link>
                </div>

                <div className="grid sm:grid-cols-2 gap-6 pt-6 border-t border-border">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-muted p-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t("email")}</p>
                        <p className="font-medium">{user.email}</p>
                      </div>
                    </div>

                    {profile?.phone && (
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-muted p-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">{t("phoneNum")}</p>
                          <p className="font-medium">{profile.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-muted p-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t("memberSince")}</p>
                        <p className="font-medium">
                          {new Date(profile?.created_at || "").toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-muted p-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">{t("accountType")}</p>
                        <p className="font-medium capitalize">{profile?.user_type || t("user")}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">{t("activitySummary")}</CardTitle>
                <CardDescription>{t("activityOnPlatform")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-3 gap-6">
                  <div className="text-center p-4 rounded-lg border border-border">
                    <p className="text-3xl font-bold text-primary mb-1">{propertiesCount || 0}</p>
                    <p className="text-sm text-muted-foreground">{t("propertiesListed")}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg border border-border">
                    <p className="text-3xl font-bold text-primary mb-1">{maintenanceCount || 0}</p>
                    <p className="text-sm text-muted-foreground">{t("requestMaintenance")}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg border border-border">
                    <p className="text-3xl font-bold text-primary mb-1">${totalSpent.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">{t("totalSpent")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">{t("quickActions")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/profile/edit" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    {t("editProfile")}
                  </Button>
                </Link>
                <Link href="/properties/add" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    {t("addProperty")}
                  </Button>
                </Link>
                <Link href="/maintenance/create" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    {t("requestMaintenance")}
                  </Button>
                </Link>
                <Link href="/payments" className="block">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    {t("viewPayments")}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="font-serif">{t("accountSettings")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">{t("emailNotifications")}</span>
                  <Badge variant="secondary">{t("enabled")}</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">{t("twoFactorAuth")}</span>
                  <Badge variant="secondary">{t("disabled")}</Badge>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm">{t("accountStatus")}</span>
                  <Badge variant="default">{t("active")}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

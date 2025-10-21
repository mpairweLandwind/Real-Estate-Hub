import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Wrench, Plus, Clock, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { getTranslations } from "next-intl/server"

export default async function MaintenancePage() {
  const t = await getTranslations("maintenance")

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch maintenance requests
  const { data: requests, error } = await supabase
    .from("maintenance_requests")
    .select("*, properties(title, address, city)")
    .or(`requester_id.eq.${user.id},provider_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching maintenance requests:", error)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "pending":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      completed: "default",
      in_progress: "secondary",
      pending: "secondary",
      cancelled: "destructive",
    }
    return variants[status] || "secondary"
  }

  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      urgent: "destructive",
      high: "destructive",
      medium: "secondary",
      low: "secondary",
    }
    return variants[priority] || "secondary"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">{t("title")}</h1>
            <p className="text-muted-foreground">{t("manageTrack")}</p>
          </div>
          <Link href="/maintenance/create">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("newRequest")}
            </Button>
          </Link>
        </div>

        {!requests || requests.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-muted p-6">
                  <Wrench className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold mb-2">{t("noRequests")}</h3>
                <p className="text-muted-foreground mb-6">{t("createFirstRequest")}</p>
                <Link href="/maintenance/create">
                  <Button>{t("createRequest")}</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-serif flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        {request.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {request.properties?.title} - {request.properties?.city}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityBadge(request.priority)} className="capitalize">
                        {request.priority}
                      </Badge>
                      <Badge variant={getStatusBadge(request.status)} className="capitalize">
                        {request.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{request.description}</p>

                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{t("category")}</p>
                      <p className="font-medium capitalize">{request.category}</p>
                    </div>
                    {request.estimated_cost && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{t("estimatedCost")}</p>
                        <p className="font-medium text-primary">${request.estimated_cost.toLocaleString()}</p>
                      </div>
                    )}
                    {request.scheduled_date && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{t("scheduled")}</p>
                        <p className="font-medium">{new Date(request.scheduled_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{t("created")}</p>
                      <p className="font-medium">{new Date(request.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t border-border">
                    <Link href={`/maintenance/${request.id}`}>
                      <Button size="sm" variant="outline" className="bg-transparent">
                        {t("viewDetails")}
                      </Button>
                    </Link>
                    {request.status === "completed" && request.actual_cost && (
                      <Link href={`/maintenance/${request.id}/pay`}>
                        <Button size="sm">
                          {t("pay")} ${request.actual_cost.toLocaleString()}
                        </Button>
                      </Link>
                    )}
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

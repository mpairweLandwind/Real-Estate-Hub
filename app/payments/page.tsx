import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function PaymentsPage() {
  const t = await getTranslations("payments")

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch user's transactions
  const { data: transactions, error } = await supabase
    .from("transactions")
    .select("*, properties(title), maintenance_requests(title)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching transactions:", error)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "failed":
        return <XCircle className="h-5 w-5 text-destructive" />
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
    }
    return variants[status] || "secondary"
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{t("viewHistory")}</p>
        </div>

        {!transactions || transactions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-muted p-6">
                  <CreditCard className="h-12 w-12 text-muted-foreground" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-serif font-bold mb-2">{t("noTransactions")}</h3>
                <p className="text-muted-foreground">{t("historyAppear")}</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Card key={transaction.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-serif flex items-center gap-2">
                        {getStatusIcon(transaction.status)}
                        {transaction.properties?.title ||
                          transaction.maintenance_requests?.title ||
                          t("generalTransaction")}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {new Date(transaction.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </CardDescription>
                    </div>
                    <Badge variant={getStatusBadge(transaction.status)} className="capitalize">
                      {transaction.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{t("amount")}</p>
                      <p className="text-xl font-bold text-primary">${transaction.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{t("type")}</p>
                      <p className="font-medium capitalize">{transaction.transaction_type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">{t("paymentMethod")}</p>
                      <p className="font-medium capitalize">{transaction.payment_method.replace("_", " ")}</p>
                    </div>
                    {transaction.payment_reference && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{t("reference")}</p>
                        <p className="font-mono text-sm">{transaction.payment_reference}</p>
                      </div>
                    )}
                  </div>
                  {transaction.notes && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground">{transaction.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

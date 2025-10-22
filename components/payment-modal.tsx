"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CreditCard, Smartphone, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"

interface PaymentModalProps {
  propertyId?: string
  maintenanceRequestId?: string
  amount: number
  transactionType: "rent" | "sale" | "maintenance" | "deposit"
  trigger?: React.ReactNode
}

export function PaymentModal({
  propertyId,
  maintenanceRequestId,
  amount,
  transactionType,
  trigger,
}: PaymentModalProps) {
  const t = useTranslations("payments")
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "mtn_mobile_money">("paypal")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handlePayment = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Create transaction
      const createResponse = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          maintenanceRequestId,
          amount,
          paymentMethod,
          transactionType,
        }),
      })

      if (!createResponse.ok) throw new Error("Failed to create transaction")

      const { transaction } = await createResponse.json()

      // Simulate payment processing
      if (paymentMethod === "paypal") {
        // In production, integrate with PayPal SDK
        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Complete transaction
        await fetch("/api/payments/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionId: transaction.id,
            paymentReference: `PAYPAL-${Date.now()}`,
            status: "completed",
          }),
        })
      } else if (paymentMethod === "mtn_mobile_money") {
        // In production, integrate with MTN Mobile Money API
        if (!phoneNumber) {
          throw new Error("Phone number is required for MTN Mobile Money")
        }

        await new Promise((resolve) => setTimeout(resolve, 2000))

        // Complete transaction
        await fetch("/api/payments/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transactionId: transaction.id,
            paymentReference: `MTN-${Date.now()}`,
            status: "completed",
          }),
        })
      }

      setOpen(false)
      router.refresh()
    } catch (err: any) {
      console.error("[v0] Payment error:", err)
      setError(err.message || "Payment failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="w-full">
            <CreditCard className="h-4 w-4 mr-2" />
            {t("makePayment")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif">{t("completePayment")}</DialogTitle>
          <DialogDescription>{t("completePaymentDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>{t("amount")}</Label>
            <div className="text-3xl font-bold text-primary">${amount.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground capitalize">
              {t(`transactionTypes.${transactionType}`)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment-method">{t("paymentMethod")}</Label>
            <Select value={paymentMethod} onValueChange={(value: any) => setPaymentMethod(value)}>
              <SelectTrigger id="payment-method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paypal">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    <span>{t("methods.paypal")}</span>
                  </div>
                </SelectItem>
                <SelectItem value="mtn_mobile_money">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span>{t("methods.mtnMobileMoney")}</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {paymentMethod === "mtn_mobile_money" && (
            <div className="space-y-2">
              <Label htmlFor="phone">{t("phoneNumber")}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+256 XXX XXX XXX"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">{t("phoneNumberHint")}</p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">{error}</div>
          )}

          <div className="flex gap-3">
            <Button onClick={handlePayment} disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t("processing")}
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 mr-2" />
                  {t("pay")} ${amount.toLocaleString()}
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="bg-transparent"
            >
              {t("cancel")}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center">{t("securityMessage")}</div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

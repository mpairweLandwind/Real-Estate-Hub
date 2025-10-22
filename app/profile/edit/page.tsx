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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { profileSchema } from "@/lib/validations"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { z } from "zod"
import { useTranslations } from "next-intl"

export default function EditProfilePage() {
  const t = useTranslations("profile")
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    userType: "tenant",
  })

  useEffect(() => {
    async function fetchProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profile) {
        setFormData({
          fullName: profile.full_name || "",
          phone: profile.phone || "",
          userType: profile.user_type || "tenant",
        })
      }
    }
    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const validatedData = profileSchema.parse({
        fullName: formData.fullName,
        phone: formData.phone || "",
        userType: formData.userType,
      })

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: validatedData.fullName,
          phone: validatedData.phone || null,
          user_type: validatedData.userType,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) throw updateError

      toast({
        title: "Success!",
        description: "Profile updated successfully",
        // variant: "default", // success not available in Radix toast
      })

      setTimeout(() => {
        router.push("/profile")
      }, 1500)
    } catch (err: any) {
      console.error("[v0] Error updating profile:", err)

      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        err.errors.forEach((error) => {
          newErrors[error.path[0] as string] = error.message
        })
        setErrors(newErrors)
      }

      toast({
        title: "Error",
        description: err.message || "Failed to update profile",
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
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t("backToProfile")}
            </Button>
          </Link>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl font-serif">{t("editProfile")}</CardTitle>
            <CardDescription>{t("editProfileDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t("fullName")} *</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                />
                {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">{t("accountType")} *</Label>
                <Select
                  value={formData.userType}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, userType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tenant">{t("userTypes.tenant")}</SelectItem>
                    <SelectItem value="owner">{t("userTypes.owner")}</SelectItem>
                    <SelectItem value="agent">{t("userTypes.agent")}</SelectItem>
                    <SelectItem value="maintenance_provider">
                      {t("userTypes.maintenanceProvider")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? t("saving") : t("saveChanges")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/profile")}
                  className="bg-transparent"
                >
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

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Building2, Home, Wrench, User, LogOut, Plus, Search, CreditCard } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { LanguageSwitcher } from "@/components/language-switcher"

export function Navigation() {
  const t = useTranslations()
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const navItems = [
    { href: "/dashboard", label: t("navigation.dashboard"), icon: Home },
    { href: "/browse", label: t("navigation.browse"), icon: Search },
    { href: "/properties", label: t("navigation.myProperties"), icon: Building2 },
    { href: "/maintenance", label: t("navigation.maintenance"), icon: Wrench },
    { href: "/payments", label: t("navigation.payments"), icon: CreditCard },
    { href: "/profile", label: t("navigation.profile"), icon: User },
  ]

  return (
    <nav className="border-b border-border bg-[oklch(0.15_0.015_240)] text-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              <span className="font-serif text-xl font-bold text-white">{t("common.appName")}</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      size="sm"
                      className={`gap-2 ${isActive ? "bg-white/10 text-white" : "text-white/80 hover:text-white hover:bg-white/10"}`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <LanguageSwitcher currentLocale={locale} />
            <Link href="/properties/add">
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">{t("navigation.addProperty")}</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="gap-2 text-white/80 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">{t("auth.logout")}</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

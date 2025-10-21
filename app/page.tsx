"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, Wrench, Shield, TrendingUp, Users } from "lucide-react"
import { useTranslations } from "next-intl"

export default function HomePage() {
  const t = useTranslations()

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden border-b border-border">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/modern-luxury-real-estate-house-exterior-with-blue.jpg"
            alt="Luxury real estate"
            className="w-full h-full object-cover"
          />
          {/* Lighter gradient overlay to let image show through */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />
        </div>

        {/* Content */}
        <div className="container relative z-10 mx-auto px-4 py-24 md:py-40">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="rounded-full bg-primary/20 backdrop-blur-md p-3 shadow-lg border border-primary/40">
                <Building2 className="h-12 w-12 text-primary" />
              </div>
            </div>

            <h1 className="font-serif text-5xl md:text-7xl font-bold text-balance text-white drop-shadow-lg">
              {t("home.hero.title")}
            </h1>

            <p className="text-xl md:text-2xl text-white/90 leading-relaxed text-balance max-w-3xl mx-auto drop-shadow-lg">
              {t("home.hero.subtitle")}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/auth/sign-up">
                <Button size="lg" className="text-lg px-8 shadow-xl">
                  {t("home.hero.getStarted")}
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white/20 text-white shadow-lg"
                >
                  {t("home.hero.signIn")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">{t("home.features.title")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("home.features.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">{t("home.features.mapSearch.title")}</h3>
              <p className="text-muted-foreground">{t("home.features.mapSearch.description")}</p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">{t("home.features.listings.title")}</h3>
              <p className="text-muted-foreground">{t("home.features.listings.description")}</p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">{t("home.features.maintenance.title")}</h3>
              <p className="text-muted-foreground">{t("home.features.maintenance.description")}</p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">{t("home.features.payments.title")}</h3>
              <p className="text-muted-foreground">{t("home.features.payments.description")}</p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">{t("home.features.analytics.title")}</h3>
              <p className="text-muted-foreground">{t("home.features.analytics.description")}</p>
            </div>

            <div className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors">
              <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-bold mb-2">{t("home.features.multiUser.title")}</h3>
              <p className="text-muted-foreground">{t("home.features.multiUser.description")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 border-t border-border bg-gradient-to-b from-background to-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="font-serif text-4xl md:text-5xl font-bold">{t("home.cta.title")}</h2>
            <p className="text-xl text-muted-foreground">{t("home.cta.subtitle")}</p>
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-lg px-8">
                {t("home.cta.button")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-serif font-bold">{t("common.appName")}</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("home.footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

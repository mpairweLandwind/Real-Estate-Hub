import type React from "react"
import type { Metadata } from "next"
import { Playfair_Display, Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import { ToastProvider } from "@/components/ui/toast"
import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "EstateHub - Premium Real Estate & Maintenance",
  description: "Find your perfect property or manage maintenance with ease",
  generator: "v0.app",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} className="dark">
      <body className={`font-sans ${inter.variable} ${playfair.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <ToastProvider>
            <Suspense fallback={null}>{children}</Suspense>
            <Analytics />
          </ToastProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

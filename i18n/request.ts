import { getRequestConfig } from "next-intl/server"
import { cookies } from "next/headers"
import type { Locale } from "@/lib/i18n-config"

export default getRequestConfig(async () => {
  // Get locale from cookies in the server context
  const cookieStore = await cookies()
  const locale = (cookieStore.get("NEXT_LOCALE")?.value || "en") as Locale

  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default,
  }
})

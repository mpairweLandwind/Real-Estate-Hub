import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { transactionId, paymentReference, status } = body

    // Update transaction status
    const { data: transaction, error } = await supabase
      .from("transactions")
      .update({
        status,
        payment_reference: paymentReference,
        updated_at: new Date().toISOString(),
      })
      .eq("id", transactionId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ transaction })
  } catch (error: any) {
    console.error("[v0] Payment completion error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

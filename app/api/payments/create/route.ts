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
    const { propertyId, maintenanceRequestId, amount, paymentMethod, transactionType } = body

    // Create transaction record
    const { data: transaction, error } = await supabase
      .from("transactions")
      .insert({
        user_id: user.id,
        property_id: propertyId || null,
        maintenance_request_id: maintenanceRequestId || null,
        amount,
        payment_method: paymentMethod,
        transaction_type: transactionType,
        status: "pending",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ transaction })
  } catch (error: any) {
    console.error("[v0] Payment creation error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

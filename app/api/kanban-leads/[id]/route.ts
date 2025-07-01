import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const updates = await request.json()

    const updatedLead = await sql`
      UPDATE kanban_leads 
      SET 
        stage = COALESCE(${updates.stage}, stage),
        contact_name = COALESCE(${updates.contact}, contact_name),
        phone = COALESCE(${updates.phone}, phone),
        email = COALESCE(${updates.email}, email),
        value = COALESCE(${updates.value}, value),
        notes = COALESCE(${updates.notes}, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `

    if (updatedLead.length === 0) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    }

    return NextResponse.json({ lead: updatedLead[0] })
  } catch (error) {
    console.error("Error updating kanban lead:", error)
    return NextResponse.json({ error: "Failed to update kanban lead" }, { status: 500 })
  }
}

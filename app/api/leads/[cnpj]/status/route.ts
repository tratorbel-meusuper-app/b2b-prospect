import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function PUT(request: NextRequest, { params }: { params: { cnpj: string } }) {
  try {
    const { cnpj } = params
    const { enrichment_status, enriched_at, in_crm, crm_stage, follow_up_sent, follow_up_sent_at } =
      await request.json()

    // Find the company
    const company = await sql`
      SELECT id FROM companies WHERE cnpj = ${cnpj}
    `

    if (company.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    // Update company status
    const updatedCompany = await sql`
      UPDATE companies 
      SET 
        enriched_data = COALESCE(enriched_data, '{}') || ${JSON.stringify({
          enrichment_status,
          enriched_at,
          in_crm,
          crm_stage,
          follow_up_sent,
          follow_up_sent_at,
        })},
        updated_at = CURRENT_TIMESTAMP
      WHERE cnpj = ${cnpj}
      RETURNING *
    `

    return NextResponse.json({ company: updatedCompany[0] })
  } catch (error) {
    console.error("Error updating lead status:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

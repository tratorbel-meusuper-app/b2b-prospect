import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { company_cnpjs, tag_id } = await request.json()

    for (const cnpj of company_cnpjs) {
      // Get company ID
      const company = await sql`
        SELECT id FROM companies WHERE cnpj = ${cnpj}
      `

      if (company.length > 0) {
        // Insert tag relationship (ignore if already exists)
        await sql`
          INSERT INTO company_tags (company_id, tag_id)
          VALUES (${company[0].id}, ${tag_id})
          ON CONFLICT (company_id, tag_id) DO NOTHING
        `
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error applying tags:", error)
    return NextResponse.json({ error: "Failed to apply tags" }, { status: 500 })
  }
}

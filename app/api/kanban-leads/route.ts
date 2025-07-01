import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const leads = await sql`
      SELECT kl.*, c.razao_social as company_name, c.cnpj, c.enriched_data
      FROM kanban_leads kl
      JOIN companies c ON kl.company_id = c.id
      ORDER BY kl.created_at DESC
    `

    const formattedLeads = leads.map((lead) => ({
      id: lead.id.toString(),
      company: lead.company_name,
      cnpj: lead.cnpj,
      contact: lead.contact_name || "Contato Principal",
      phone: lead.phone || "",
      email: lead.email || "",
      value: Number(lead.value) || 0,
      stage: lead.stage,
      addedAt: lead.created_at,
      enrichedData: lead.enriched_data,
    }))

    return NextResponse.json({ leads: formattedLeads })
  } catch (error) {
    console.error("Error fetching kanban leads:", error)
    return NextResponse.json({ error: "Failed to fetch kanban leads" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { leads, stage } = await request.json()

    const insertedLeads = []

    for (const lead of leads) {
      // Find or create company
      const company = await sql`
        SELECT id FROM companies WHERE cnpj = ${lead.cnpj}
      `

      let companyId
      if (company.length === 0) {
        // Create company if it doesn't exist
        const newCompany = await sql`
          INSERT INTO companies (cnpj, razao_social, nome_fantasia, situacao_cadastral, ai_score)
          VALUES (${lead.cnpj}, ${lead.razao_social}, ${lead.nome_fantasia || ""}, ${JSON.stringify(lead.situacao_cadastral || {})}, ${50})
          RETURNING id
        `
        companyId = newCompany[0].id
      } else {
        companyId = company[0].id
      }

      // Extract contact info from enriched data
      const contactName = lead.enrichedData?.company?.partners?.[0]?.name || "Contato Principal"
      const phone = lead.enrichedData?.company?.contact?.phone || ""
      const email = lead.enrichedData?.company?.contact?.email || ""
      const estimatedValue = Math.floor(Math.random() * 100000) + 10000

      // Insert into kanban_leads
      const kanbanLead = await sql`
        INSERT INTO kanban_leads (company_id, stage, contact_name, phone, email, value)
        VALUES (${companyId}, ${stage || "prospecting"}, ${contactName}, ${phone}, ${email}, ${estimatedValue})
        RETURNING *
      `

      insertedLeads.push({
        id: kanbanLead[0].id.toString(),
        company: lead.razao_social,
        cnpj: lead.cnpj,
        contact: contactName,
        phone: phone,
        email: email,
        value: estimatedValue,
        stage: stage || "prospecting",
        addedAt: kanbanLead[0].created_at,
      })
    }

    return NextResponse.json({ leads: insertedLeads })
  } catch (error) {
    console.error("Error adding leads to kanban:", error)
    return NextResponse.json({ error: "Failed to add leads to kanban" }, { status: 500 })
  }
}

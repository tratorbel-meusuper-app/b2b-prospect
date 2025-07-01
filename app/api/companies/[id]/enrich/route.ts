import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = Number.parseInt(params.id)

    if (isNaN(companyId)) {
      return NextResponse.json({ error: "ID da empresa deve ser um número válido" }, { status: 400 })
    }

    // Get company data
    const companies = await sql`
      SELECT * FROM companies WHERE id = ${companyId}
    `

    if (companies.length === 0) {
      return NextResponse.json({ error: "Empresa não encontrada" }, { status: 404 })
    }

    const company = companies[0]

    // Simulate AI enrichment (in a real app, this would call external APIs)
    const enrichedData = {
      contact_person: `Contato Principal - ${company.razao_social}`,
      contact_title: "Gerente Comercial",
      contact_phone: company.telefone || "(11) 9999-9999",
      contact_email: company.email || `contato@${company.razao_social.toLowerCase().replace(/\s+/g, "")}.com.br`,
      website: `https://www.${company.razao_social.toLowerCase().replace(/\s+/g, "")}.com.br`,
      description: `${company.razao_social} é uma empresa ${company.porte || "de médio porte"} especializada em ${company.atividade_principal || "serviços diversos"}.`,
      employees_count: Math.floor(Math.random() * 500) + 10,
      annual_revenue: Math.floor(Math.random() * 10000000) + 100000,
      industry_segment: company.atividade_principal || "Serviços",
      business_model: "B2B",
      full_address: [company.logradouro, company.numero, company.bairro].filter(Boolean).join(", "),
      neighborhood: company.bairro,
      city: company.municipio,
      state: company.uf,
      postal_code: company.cep,
      social_media: {
        linkedin: `https://linkedin.com/company/${company.razao_social.toLowerCase().replace(/\s+/g, "-")}`,
        facebook: `https://facebook.com/${company.razao_social.toLowerCase().replace(/\s+/g, "")}`,
      },
      technologies: ["CRM", "ERP", "Cloud Computing"],
      certifications: ["ISO 9001"],
      notes: `Empresa enriquecida automaticamente em ${new Date().toLocaleDateString("pt-BR")}`,
    }

    // Update company with enriched data
    await sql`
      UPDATE companies 
      SET 
        enriched_data = ${JSON.stringify(enrichedData)},
        enrichment_status = 'bulk',
        enriched_at = NOW()
      WHERE id = ${companyId}
    `

    return NextResponse.json({
      success: true,
      enrichedData,
      message: "Empresa enriquecida com sucesso",
    })
  } catch (error) {
    console.error("Error enriching company:", error)
    return NextResponse.json({ error: "Erro interno do servidor ao enriquecer empresa" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const companyId = Number.parseInt(params.id)

    if (isNaN(companyId)) {
      return NextResponse.json({ error: "ID da empresa deve ser um número válido" }, { status: 400 })
    }

    const body = await request.json()
    const { enrichedData } = body

    // Update company with manual enrichment data
    await sql`
      UPDATE companies 
      SET 
        enriched_data = ${JSON.stringify(enrichedData)},
        enrichment_status = 'manual',
        enriched_at = NOW(),
        telefone = COALESCE(${enrichedData.contact_phone}, telefone),
        email = COALESCE(${enrichedData.contact_email}, email)
      WHERE id = ${companyId}
    `

    return NextResponse.json({
      success: true,
      message: "Enriquecimento manual salvo com sucesso",
    })
  } catch (error) {
    console.error("Error saving manual enrichment:", error)
    return NextResponse.json({ error: "Erro interno do servidor ao salvar enriquecimento" }, { status: 500 })
  }
}

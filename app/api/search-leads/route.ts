import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = (page - 1) * limit

    // Extract search filters
    const filters = {
      razao_social: searchParams.get("razao_social"),
      nome_fantasia: searchParams.get("nome_fantasia"),
      cnpj: searchParams.get("cnpj"),
      uf: searchParams.get("uf"),
      municipio: searchParams.get("municipio"),
      bairro: searchParams.get("bairro"),
      cep: searchParams.get("cep"),
      atividade_economica: searchParams.get("atividade_economica"),
      cnae_principal: searchParams.get("cnae_principal"),
      situacao_cadastral: searchParams.get("situacao_cadastral"),
      porte: searchParams.get("porte"),
      capital_social_minimo: searchParams.get("capital_social_minimo"),
      capital_social_maximo: searchParams.get("capital_social_maximo"),
      data_abertura_inicio: searchParams.get("data_abertura_inicio"),
      data_abertura_fim: searchParams.get("data_abertura_fim"),
      com_telefone: searchParams.get("com_telefone") === "true",
      com_email: searchParams.get("com_email") === "true",
      apenas_ativas: searchParams.get("apenas_ativas") === "true",
      somente_matriz: searchParams.get("somente_matriz") === "true",
      excluir_mei: searchParams.get("excluir_mei") === "true",
    }

    console.log("🔍 Search filters received:", filters)

    // Build WHERE clause dynamically based on filters
    let whereClause = "WHERE 1=1"

    if (filters.razao_social) {
      whereClause += ` AND razao_social ILIKE '%${filters.razao_social}%'`
    }

    if (filters.nome_fantasia) {
      whereClause += ` AND nome_fantasia ILIKE '%${filters.nome_fantasia}%'`
    }

    if (filters.cnpj) {
      const cleanCnpj = filters.cnpj.replace(/\D/g, "")
      whereClause += ` AND cnpj LIKE '%${cleanCnpj}%'`
    }

    if (filters.uf) {
      whereClause += ` AND uf = '${filters.uf}'`
    }

    if (filters.municipio) {
      whereClause += ` AND municipio ILIKE '%${filters.municipio}%'`
    }

    if (filters.bairro) {
      whereClause += ` AND bairro ILIKE '%${filters.bairro}%'`
    }

    if (filters.cep) {
      const cleanCep = filters.cep.replace(/\D/g, "")
      whereClause += ` AND cep LIKE '%${cleanCep}%'`
    }

    if (filters.atividade_economica) {
      whereClause += ` AND atividade_principal ILIKE '%${filters.atividade_economica}%'`
    }

    if (filters.cnae_principal) {
      whereClause += ` AND cnae_principal LIKE '%${filters.cnae_principal}%'`
    }

    if (filters.situacao_cadastral) {
      whereClause += ` AND situacao = '${filters.situacao_cadastral}'`
    }

    if (filters.porte) {
      whereClause += ` AND porte = '${filters.porte}'`
    }

    if (filters.capital_social_minimo) {
      whereClause += ` AND capital_social >= ${Number.parseFloat(filters.capital_social_minimo)}`
    }

    if (filters.capital_social_maximo) {
      whereClause += ` AND capital_social <= ${Number.parseFloat(filters.capital_social_maximo)}`
    }

    if (filters.data_abertura_inicio) {
      whereClause += ` AND data_abertura >= '${filters.data_abertura_inicio}'`
    }

    if (filters.data_abertura_fim) {
      whereClause += ` AND data_abertura <= '${filters.data_abertura_fim}'`
    }

    if (filters.com_telefone) {
      whereClause += ` AND telefone IS NOT NULL AND telefone != ''`
    }

    if (filters.com_email) {
      whereClause += ` AND email IS NOT NULL AND email != ''`
    }

    if (filters.apenas_ativas) {
      whereClause += ` AND situacao = 'ATIVA'`
    }

    if (filters.somente_matriz) {
      whereClause += ` AND cnpj LIKE '%/0001-%'`
    }

    if (filters.excluir_mei) {
      whereClause += ` AND porte != 'MEI'`
    }

    // Count query for total results
    const countQuery = `SELECT COUNT(*) as total FROM companies ${whereClause}`

    console.log("🔍 Executing count query:", countQuery)

    // Execute count query using tagged template
    const countResult =
      await sql`SELECT COUNT(*) as total FROM companies ${sql.unsafe(whereClause.replace("WHERE 1=1", "").replace(" AND", "WHERE").substring(6) || "WHERE 1=1")}`
    const total = Number.parseInt(countResult[0]?.total || "0")

    console.log("🔍 Total results found:", total)

    if (total === 0) {
      return NextResponse.json({
        success: true,
        leads: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        hasMore: false,
        filters,
      })
    }

    // Main query for leads using tagged template
    const leadsQuery = `
      SELECT 
        id,
        cnpj,
        razao_social,
        nome_fantasia,
        situacao,
        uf,
        municipio,
        bairro,
        logradouro,
        numero,
        cep,
        telefone,
        email,
        atividade_principal,
        cnae_principal,
        capital_social,
        porte,
        natureza_juridica,
        data_abertura,
        COALESCE(enrichment_status, 'none') as enrichment_status,
        enriched_at,
        COALESCE(in_crm, false) as in_crm,
        crm_stage,
        COALESCE(followup_sent, false) as followup_sent,
        followup_sent_at,
        tags,
        ai_score,
        last_contact,
        COALESCE(contact_attempts, 0) as contact_attempts,
        enriched_data
      FROM companies 
      ${whereClause}
      ORDER BY 
        CASE WHEN ai_score IS NOT NULL THEN ai_score ELSE 0 END DESC,
        capital_social DESC,
        razao_social ASC
      LIMIT ${limit} OFFSET ${offset}
    `

    console.log("🔍 Executing leads query:", leadsQuery)

    // Execute main query using tagged template
    const whereCondition = whereClause.replace("WHERE 1=1", "").replace(" AND", "WHERE").substring(6) || "WHERE 1=1"
    const leadsResult = await sql`
      SELECT 
        id,
        cnpj,
        razao_social,
        nome_fantasia,
        situacao,
        uf,
        municipio,
        bairro,
        logradouro,
        numero,
        cep,
        telefone,
        email,
        atividade_principal,
        cnae_principal,
        capital_social,
        porte,
        natureza_juridica,
        data_abertura,
        COALESCE(enrichment_status, 'none') as enrichment_status,
        enriched_at,
        COALESCE(in_crm, false) as in_crm,
        crm_stage,
        COALESCE(followup_sent, false) as followup_sent,
        followup_sent_at,
        tags,
        ai_score,
        last_contact,
        COALESCE(contact_attempts, 0) as contact_attempts,
        enriched_data
      FROM companies 
      ${sql.unsafe(whereCondition)}
      ORDER BY 
        CASE WHEN ai_score IS NOT NULL THEN ai_score ELSE 0 END DESC,
        capital_social DESC,
        razao_social ASC
      LIMIT ${limit} OFFSET ${offset}
    `

    console.log("🔍 Raw leads result:", leadsResult.length, "leads found")

    // Transform the results to match the expected format
    const leads = leadsResult.map((row: any) => ({
      id: row.id,
      cnpj: row.cnpj,
      razao_social: row.razao_social,
      nome_fantasia: row.nome_fantasia,
      situacao: row.situacao,
      uf: row.uf,
      municipio: row.municipio,
      bairro: row.bairro,
      logradouro: row.logradouro,
      numero: row.numero,
      cep: row.cep,
      telefone: row.telefone,
      email: row.email,
      atividade_principal: row.atividade_principal,
      cnae_principal: row.cnae_principal,
      capital_social: Number.parseFloat(row.capital_social || "0"),
      porte: row.porte,
      natureza_juridica: row.natureza_juridica,
      data_abertura: row.data_abertura,
      enrichment_status: row.enrichment_status || "none",
      enriched_at: row.enriched_at,
      in_crm: Boolean(row.in_crm),
      crm_stage: row.crm_stage,
      followup_sent: Boolean(row.followup_sent),
      followup_sent_at: row.followup_sent_at,
      tags: row.tags || [],
      ai_score: row.ai_score ? Number.parseInt(row.ai_score) : null,
      last_contact: row.last_contact,
      contact_attempts: Number.parseInt(row.contact_attempts || "0"),
      enrichedData: row.enriched_data ? row.enriched_data : null,
    }))

    const totalPages = Math.ceil(total / limit)

    console.log(`📊 Returning ${leads.length} leads for page ${page} of ${totalPages}`)

    return NextResponse.json({
      success: true,
      leads,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
      filters,
    })
  } catch (error) {
    console.error("❌ Search leads error:", error)

    // If there's a database error, return mock data as fallback
    console.log("⚠️ Falling back to mock data due to database error")

    const mockLeads = []
    const totalMockLeads = 1000 // Smaller number for fallback
    const page = Number.parseInt(new URL(request.url).searchParams.get("page") || "1")
    const limit = Number.parseInt(new URL(request.url).searchParams.get("limit") || "50")

    // Generate a few mock leads as fallback
    for (let i = 0; i < Math.min(limit, 10); i++) {
      const leadIndex = (page - 1) * limit + i
      mockLeads.push({
        id: leadIndex + 1,
        cnpj: `${String(leadIndex + 10000000).padStart(8, "0")}/0001-${String(leadIndex % 100).padStart(2, "0")}`,
        razao_social: `EMPRESA MOCK ${leadIndex + 1} LTDA`,
        nome_fantasia: `Mock ${leadIndex + 1}`,
        situacao: "ATIVA",
        uf: "SP",
        municipio: "São Paulo",
        bairro: `Bairro Mock ${i + 1}`,
        logradouro: `Rua Mock ${i + 1}`,
        numero: String(i + 100),
        cep: `01000-00${i}`,
        telefone: `(11) 9999-000${i}`,
        email: `mock${i}@empresa.com.br`,
        atividade_principal: "Atividade Mock",
        cnae_principal: "00.00-0/00",
        capital_social: 50000 + i * 10000,
        porte: "ME",
        natureza_juridica: "Sociedade Empresária Limitada",
        data_abertura: "2020-01-01",
        enrichment_status: "none" as const,
        enriched_at: null,
        in_crm: false,
        crm_stage: null,
        followup_sent: false,
        followup_sent_at: null,
        tags: [],
        ai_score: null,
        last_contact: null,
        contact_attempts: 0,
        enrichedData: null,
      })
    }

    return NextResponse.json({
      success: true,
      leads: mockLeads,
      total: totalMockLeads,
      page,
      limit,
      totalPages: Math.ceil(totalMockLeads / limit),
      hasMore: page < Math.ceil(totalMockLeads / limit),
      filters: {},
      error: "Usando dados mock devido a erro no banco de dados",
    })
  }
}

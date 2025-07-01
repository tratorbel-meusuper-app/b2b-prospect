import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const search = searchParams.get("search") || ""
    const tag = searchParams.get("tag") || ""
    const minScore = Number.parseInt(searchParams.get("minScore") || "0")
    const maxScore = Number.parseInt(searchParams.get("maxScore") || "100")

    const offset = (page - 1) * limit

    // Build the query dynamically using template literals
    let companies
    let total = 0

    if (search && tag) {
      // Search with tag filter
      companies = await sql`
        SELECT c.*, 
               array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags,
               array_agg(DISTINCT t.color) FILTER (WHERE t.color IS NOT NULL) as tag_colors
        FROM companies c
        LEFT JOIN company_tags ct ON c.id = ct.company_id
        LEFT JOIN tags t ON ct.tag_id = t.id
        WHERE (c.razao_social ILIKE ${`%${search}%`} OR c.nome_fantasia ILIKE ${`%${search}%`} OR c.cnpj LIKE ${`%${search}%`})
        AND t.name = ${tag}
        AND c.ai_score BETWEEN ${minScore} AND ${maxScore}
        GROUP BY c.id 
        ORDER BY c.ai_score DESC, c.created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `

      const countResult = await sql`
        SELECT COUNT(DISTINCT c.id) as total 
        FROM companies c
        LEFT JOIN company_tags ct ON c.id = ct.company_id
        LEFT JOIN tags t ON ct.tag_id = t.id
        WHERE (c.razao_social ILIKE ${`%${search}%`} OR c.nome_fantasia ILIKE ${`%${search}%`} OR c.cnpj LIKE ${`%${search}%`})
        AND t.name = ${tag}
        AND c.ai_score BETWEEN ${minScore} AND ${maxScore}
      `
      total = Number.parseInt(countResult[0]?.total || "0")
    } else if (search) {
      // Search only
      companies = await sql`
        SELECT c.*, 
               array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags,
               array_agg(DISTINCT t.color) FILTER (WHERE t.color IS NOT NULL) as tag_colors
        FROM companies c
        LEFT JOIN company_tags ct ON c.id = ct.company_id
        LEFT JOIN tags t ON ct.tag_id = t.id
        WHERE (c.razao_social ILIKE ${`%${search}%`} OR c.nome_fantasia ILIKE ${`%${search}%`} OR c.cnpj LIKE ${`%${search}%`})
        AND c.ai_score BETWEEN ${minScore} AND ${maxScore}
        GROUP BY c.id 
        ORDER BY c.ai_score DESC, c.created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `

      const countResult = await sql`
        SELECT COUNT(DISTINCT c.id) as total 
        FROM companies c
        WHERE (c.razao_social ILIKE ${`%${search}%`} OR c.nome_fantasia ILIKE ${`%${search}%`} OR c.cnpj LIKE ${`%${search}%`})
        AND c.ai_score BETWEEN ${minScore} AND ${maxScore}
      `
      total = Number.parseInt(countResult[0]?.total || "0")
    } else if (tag) {
      // Tag filter only
      companies = await sql`
        SELECT c.*, 
               array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags,
               array_agg(DISTINCT t.color) FILTER (WHERE t.color IS NOT NULL) as tag_colors
        FROM companies c
        LEFT JOIN company_tags ct ON c.id = ct.company_id
        LEFT JOIN tags t ON ct.tag_id = t.id
        WHERE t.name = ${tag}
        AND c.ai_score BETWEEN ${minScore} AND ${maxScore}
        GROUP BY c.id 
        ORDER BY c.ai_score DESC, c.created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `

      const countResult = await sql`
        SELECT COUNT(DISTINCT c.id) as total 
        FROM companies c
        LEFT JOIN company_tags ct ON c.id = ct.company_id
        LEFT JOIN tags t ON ct.tag_id = t.id
        WHERE t.name = ${tag}
        AND c.ai_score BETWEEN ${minScore} AND ${maxScore}
      `
      total = Number.parseInt(countResult[0]?.total || "0")
    } else {
      // No filters, just score range
      companies = await sql`
        SELECT c.*, 
               array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags,
               array_agg(DISTINCT t.color) FILTER (WHERE t.color IS NOT NULL) as tag_colors
        FROM companies c
        LEFT JOIN company_tags ct ON c.id = ct.company_id
        LEFT JOIN tags t ON ct.tag_id = t.id
        WHERE c.ai_score BETWEEN ${minScore} AND ${maxScore}
        GROUP BY c.id 
        ORDER BY c.ai_score DESC, c.created_at DESC 
        LIMIT ${limit} OFFSET ${offset}
      `

      const countResult = await sql`
        SELECT COUNT(*) as total FROM companies c
        WHERE c.ai_score BETWEEN ${minScore} AND ${maxScore}
      `
      total = Number.parseInt(countResult[0]?.total || "0")
    }

    return NextResponse.json({
      companies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error("Error fetching companies:", error)
    return NextResponse.json({ error: "Failed to fetch companies" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { companies } = await request.json()

    for (const company of companies) {
      // Calculate AI score based on company data
      const aiScore = calculateAIScore(company)

      // Generate AI insights
      const aiInsights = generateAIInsights(company)

      // Generate random coordinates for demonstration (in a real app, you'd geocode)
      let latitude = null,
        longitude = null
      if (company.municipio && company.uf) {
        latitude = -23.5505 + (Math.random() - 0.5) * 10 // Brazil latitude range
        longitude = -46.6333 + (Math.random() - 0.5) * 20 // Brazil longitude range
      }

      await sql`
        INSERT INTO companies (
          cnpj, razao_social, nome_fantasia, situacao_cadastral, 
          ai_score, ai_insights, latitude, longitude
        )
        VALUES (
          ${company.cnpj}, 
          ${company.razao_social}, 
          ${company.nome_fantasia || ""}, 
          ${JSON.stringify(company.situacao_cadastral)}, 
          ${aiScore}, 
          ${JSON.stringify(aiInsights)},
          ${latitude},
          ${longitude}
        )
        ON CONFLICT (cnpj) DO UPDATE SET
          razao_social = EXCLUDED.razao_social,
          nome_fantasia = EXCLUDED.nome_fantasia,
          situacao_cadastral = EXCLUDED.situacao_cadastral,
          ai_score = EXCLUDED.ai_score,
          ai_insights = EXCLUDED.ai_insights,
          latitude = EXCLUDED.latitude,
          longitude = EXCLUDED.longitude,
          updated_at = CURRENT_TIMESTAMP
      `
    }

    return NextResponse.json({ success: true, count: companies.length })
  } catch (error) {
    console.error("Error saving companies:", error)
    return NextResponse.json({ error: "Failed to save companies" }, { status: 500 })
  }
}

function calculateAIScore(company: any): number {
  let score = 50 // Base score

  // Situação cadastral
  if (company.situacao_cadastral?.situacao_atual === "ATIVA") {
    score += 30
  } else if (company.situacao_cadastral?.situacao_atual === "INAPTA") {
    score -= 20
  } else if (company.situacao_cadastral?.situacao_atual === "BAIXADA") {
    score -= 40
  }

  // Nome fantasia (indica empresa mais estruturada)
  if (company.nome_fantasia && company.nome_fantasia.trim()) {
    score += 10
  }

  // Capital social
  if (company.capital_social) {
    if (company.capital_social > 1000000) score += 15
    else if (company.capital_social > 100000) score += 10
    else if (company.capital_social > 10000) score += 5
  }

  // Telefone e email
  if (company.telefone) score += 5
  if (company.email) score += 10

  // Razão social (palavras-chave que indicam potencial)
  const highValueKeywords = ["LTDA", "S.A.", "EIRELI", "TECNOLOGIA", "SERVICOS", "COMERCIO", "CONSULTORIA"]
  const lowValueKeywords = ["MEI", "INDIVIDUAL"]

  const razaoUpper = company.razao_social?.toUpperCase() || ""

  highValueKeywords.forEach((keyword) => {
    if (razaoUpper.includes(keyword)) score += 5
  })

  lowValueKeywords.forEach((keyword) => {
    if (razaoUpper.includes(keyword)) score -= 10
  })

  return Math.max(0, Math.min(100, score))
}

function generateAIInsights(company: any): any {
  const insights = {
    score: calculateAIScore(company),
    factors: [],
    recommendations: [],
    riskLevel: "medium",
    bestContactTime: "14:00-16:00",
    estimatedValue: 0,
    conversionProbability: 0,
  }

  // Risk assessment
  if (company.situacao_cadastral?.situacao_atual === "ATIVA") {
    insights.factors.push("Empresa ativa - Bom sinal para negociação")
    insights.riskLevel = "low"
    insights.conversionProbability = 0.6
  } else if (company.situacao_cadastral?.situacao_atual === "BAIXADA") {
    insights.factors.push("Empresa baixada - Alto risco")
    insights.riskLevel = "high"
    insights.conversionProbability = 0.1
  } else {
    insights.conversionProbability = 0.3
  }

  // Contact info
  if (company.telefone) {
    insights.factors.push("Telefone disponível - Facilita contato")
  }
  if (company.email) {
    insights.factors.push("Email disponível - Canal de comunicação direto")
  }

  // Recommendations
  if (company.nome_fantasia) {
    insights.recommendations.push("Usar nome fantasia na abordagem inicial")
  }

  if (insights.score > 70) {
    insights.recommendations.push("Priorizar este lead - Alto potencial")
    insights.estimatedValue = Math.floor(Math.random() * 50000) + 20000
  } else if (insights.score < 30) {
    insights.recommendations.push("Considerar descarte - Baixo potencial")
    insights.estimatedValue = Math.floor(Math.random() * 10000) + 5000
  } else {
    insights.estimatedValue = Math.floor(Math.random() * 30000) + 10000
  }

  if (company.telefone && company.email) {
    insights.recommendations.push("Múltiplos canais de contato disponíveis")
  }

  return insights
}

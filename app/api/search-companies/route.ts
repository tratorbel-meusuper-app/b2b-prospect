import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const filters = await request.json()

    console.log("🔍 Received search filters:", filters)

    // Make request to external API
    const response = await fetch("https://webhook.meusuper.app/webhook/379f44b4-30cf-4f30-9a25-8f097509a413", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filters),
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()

    console.log("🔍 API response type:", typeof data, "isArray:", Array.isArray(data))
    console.log("🔍 API response length:", Array.isArray(data) ? data.length : "not array")

    if (Array.isArray(data) && data.length > 0) {
      console.log("🔍 First item structure:", JSON.stringify(data[0], null, 2))
    }

    let leads = []
    let total = 0

    // The API returns a direct array of companies
    if (Array.isArray(data)) {
      leads = data
      total = data.length
      console.log("🔍 Found direct array with", leads.length, "companies")
    } else {
      console.log("🔍 Unexpected response format - not an array")
      return NextResponse.json({
        success: false,
        leads: [],
        total: 0,
        page: 1,
        limit: 1000,
        totalPages: 0,
        hasMore: false,
        error: "Formato de resposta inesperado da API",
      })
    }

    // Transform leads to match our expected format
    const transformedLeads = leads.map((lead: any, index: number) => {
      // Extract situacao_cadastral data
      const situacao = lead.situacao_cadastral || {}
      const situacaoAtual = situacao.situacao_atual || "N/A"

      const transformedLead = {
        cnpj: lead.cnpj || `temp-${Date.now()}-${index}`,
        razao_social: lead.razao_social || "Empresa não identificada",
        nome_fantasia: lead.nome_fantasia || "",
        situacao_cadastral: situacaoAtual,
        uf: lead.uf || lead.endereco?.uf || "",
        municipio: lead.municipio || lead.endereco?.municipio || "",
        bairro: lead.bairro || lead.endereco?.bairro || "",
        logradouro: lead.logradouro || lead.endereco?.logradouro || "",
        numero: lead.numero || lead.endereco?.numero || "",
        cep: lead.cep || lead.endereco?.cep || "",
        telefone: lead.telefone || "",
        email: lead.email || "",
        atividade_principal: lead.atividade_principal || lead.cnae_principal?.descricao || "",
        cnae_principal: lead.cnae_principal?.codigo || "",
        capital_social: lead.capital_social || 0,
        porte: lead.porte || "",
        natureza_juridica: lead.natureza_juridica?.descricao || "",
        data_abertura: lead.data_abertura || lead.data_inicio_atividade || "",
        enrichment_status: "none",
        // Additional fields from API
        motivo_situacao: situacao.motivo || "",
        data_situacao: situacao.data || "",
      }

      return transformedLead
    })

    console.log("🔍 Transformed", transformedLeads.length, "leads")
    if (transformedLeads.length > 0) {
      console.log("🔍 First transformed lead:", JSON.stringify(transformedLeads[0], null, 2))
    }

    // Calculate pagination info
    const page = filters.pagina || 1
    const limit = filters.limite || 1000

    // Since we don't know the total from API, we estimate based on the response
    // If we got a full page, there might be more
    const hasMore = transformedLeads.length === limit
    const estimatedTotal = hasMore ? page * limit + 1 : (page - 1) * limit + transformedLeads.length

    const result = {
      success: true,
      leads: transformedLeads,
      total: estimatedTotal,
      page: page,
      limit: limit,
      totalPages: hasMore ? page + 1 : page,
      hasMore: hasMore,
    }

    console.log("🔍 Final result:", {
      success: result.success,
      leadsCount: result.leads.length,
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Search API error:", error)

    return NextResponse.json({
      success: false,
      leads: [],
      total: 0,
      page: 1,
      limit: 1000,
      totalPages: 0,
      hasMore: false,
      error: error instanceof Error ? error.message : "Erro interno do servidor",
    })
  }
}

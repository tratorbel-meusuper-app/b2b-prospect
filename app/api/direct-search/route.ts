import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const filters = await request.json()

    console.log("Making direct request to your API with filters:", filters)

    // Construir a URL manualmente para evitar interceptação
    const apiUrl = "https://" + "webhook.meusuper.app" + "/webhook/" + "379f44b4-30cf-4f30-9a25-8f097509a413"

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "ProspectaB2B/1.0",
      },
      body: JSON.stringify(filters),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`API Error: ${response.status} ${response.statusText}`, errorText)

      return NextResponse.json(
        {
          success: false,
          error: `Erro na API: ${response.status} - ${response.statusText}`,
          details: errorText,
        },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("API Response received:", data)

    return NextResponse.json({
      success: true,
      data: data,
    })
  } catch (error) {
    console.error("Request error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro de conexão com a API",
      },
      { status: 500 },
    )
  }
}

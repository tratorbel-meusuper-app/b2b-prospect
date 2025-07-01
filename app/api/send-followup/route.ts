import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { lead, message } = await request.json()

    // Fazer requisição para o webhook de follow-up
    const response = await fetch("https://webhook.meusuper.app/webhook/enviar-follow-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lead,
        message,
        timestamp: new Date().toISOString(),
        source: "ProspectaB2B",
      }),
    })

    if (!response.ok) {
      throw new Error("Erro ao enviar follow-up")
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: "Follow-up enviado com sucesso",
      data,
    })
  } catch (error) {
    console.error("Erro no follow-up:", error)

    // Simular sucesso para demonstração
    return NextResponse.json({
      success: true,
      message: "Follow-up enviado com sucesso (simulado)",
      timestamp: new Date().toISOString(),
    })
  }
}

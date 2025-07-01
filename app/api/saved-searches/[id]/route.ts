import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    await sql`DELETE FROM saved_searches WHERE id = ${id}`

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting saved search:", error)
    return NextResponse.json({ success: false, error: "Erro ao excluir pesquisa" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { name, description, filters } = await request.json()

    const result = await sql`
      UPDATE saved_searches 
      SET 
        name = ${name},
        description = ${description || null},
        filters = ${JSON.stringify(filters)},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, name, description, filters, created_at, used_count, last_used
    `

    if (result.length === 0) {
      return NextResponse.json({ success: false, error: "Pesquisa não encontrada" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      search: {
        ...result[0],
        filters: typeof result[0].filters === "string" ? JSON.parse(result[0].filters) : result[0].filters,
      },
    })
  } catch (error) {
    console.error("Error updating saved search:", error)
    return NextResponse.json({ success: false, error: "Erro ao atualizar pesquisa" }, { status: 500 })
  }
}

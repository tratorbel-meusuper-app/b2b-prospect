import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const searches = await sql`
      SELECT 
        id,
        name,
        description,
        filters,
        created_at,
        used_count,
        last_used
      FROM saved_searches 
      ORDER BY last_used DESC NULLS LAST, created_at DESC
    `

    return NextResponse.json({
      success: true,
      searches: searches.map((search) => ({
        ...search,
        filters: typeof search.filters === "string" ? JSON.parse(search.filters) : search.filters,
      })),
    })
  } catch (error) {
    console.error("Error fetching saved searches:", error)
    return NextResponse.json({ success: false, error: "Erro ao buscar pesquisas salvas" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, filters } = await request.json()

    if (!name || !filters) {
      return NextResponse.json({ success: false, error: "Nome e filtros são obrigatórios" }, { status: 400 })
    }

    const result = await sql`
      INSERT INTO saved_searches (name, description, filters, created_at, used_count)
      VALUES (${name}, ${description || null}, ${JSON.stringify(filters)}, NOW(), 0)
      RETURNING id, name, description, filters, created_at, used_count
    `

    return NextResponse.json({
      success: true,
      search: {
        ...result[0],
        filters: typeof result[0].filters === "string" ? JSON.parse(result[0].filters) : result[0].filters,
      },
    })
  } catch (error) {
    console.error("Error saving search:", error)
    return NextResponse.json({ success: false, error: "Erro ao salvar pesquisa" }, { status: 500 })
  }
}

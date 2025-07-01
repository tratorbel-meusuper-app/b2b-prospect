import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    await sql`
      UPDATE saved_searches 
      SET 
        used_count = COALESCE(used_count, 0) + 1,
        last_used = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating search usage:", error)
    return NextResponse.json({ success: false, error: "Erro ao atualizar uso da pesquisa" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const tags = await sql`
      SELECT t.*, COUNT(ct.company_id) as company_count
      FROM tags t
      LEFT JOIN company_tags ct ON t.id = ct.tag_id
      GROUP BY t.id
      ORDER BY t.created_at DESC
    `

    return NextResponse.json({ tags })
  } catch (error) {
    console.error("Error fetching tags:", error)
    return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, color, description } = await request.json()

    const tag = await sql`
      INSERT INTO tags (name, color, description)
      VALUES (${name}, ${color}, ${description})
      RETURNING *
    `

    return NextResponse.json({ tag: tag[0] })
  } catch (error) {
    console.error("Error creating tag:", error)
    return NextResponse.json({ error: "Failed to create tag" }, { status: 500 })
  }
}

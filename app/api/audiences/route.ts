import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const audiences = await sql`
      SELECT * FROM audiences ORDER BY created_at DESC
    `

    return NextResponse.json({ audiences })
  } catch (error) {
    console.error("Error fetching audiences:", error)
    return NextResponse.json({ error: "Failed to fetch audiences" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, filters } = await request.json()

    const audience = await sql`
      INSERT INTO audiences (name, description, filters)
      VALUES (${name}, ${description}, ${JSON.stringify(filters)})
      RETURNING *
    `

    return NextResponse.json({ audience: audience[0] })
  } catch (error) {
    console.error("Error creating audience:", error)
    return NextResponse.json({ error: "Failed to create audience" }, { status: 500 })
  }
}

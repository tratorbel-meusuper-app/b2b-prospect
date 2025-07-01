import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const campaigns = await sql`
      SELECT * FROM campaigns ORDER BY created_at DESC
    `

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json({ error: "Failed to fetch campaigns" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, message_template, scheduled_at } = await request.json()

    const campaign = await sql`
      INSERT INTO campaigns (name, message_template, scheduled_at)
      VALUES (${name}, ${message_template}, ${scheduled_at})
      RETURNING *
    `

    return NextResponse.json({ campaign: campaign[0] })
  } catch (error) {
    console.error("Error creating campaign:", error)
    return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 })
  }
}

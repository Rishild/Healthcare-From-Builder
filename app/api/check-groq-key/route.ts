import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if GROQ_API_KEY environment variable is set
    const groqApiKey = process.env.GROQ_API_KEY

    return NextResponse.json({
      available: typeof groqApiKey === "string" && groqApiKey.length > 0,
    })
  } catch (error) {
    console.error("Error checking GROQ API key:", error)
    return NextResponse.json({ available: false })
  }
}

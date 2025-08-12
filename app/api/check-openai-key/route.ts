import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if the OpenAI API key is available
    const apiKeyAvailable = typeof process.env.OPENAI_API_KEY === "string" && process.env.OPENAI_API_KEY.length > 0

    return NextResponse.json({
      available: apiKeyAvailable,
    })
  } catch (error) {
    console.error("Error checking OpenAI API key:", error)
    return NextResponse.json(
      {
        available: false,
        error: "Failed to check API key availability",
      },
      { status: 500 },
    )
  }
}

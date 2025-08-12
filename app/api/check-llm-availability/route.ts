import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check if OpenAI API key is available
    const hasOpenAI = typeof process.env.OPENAI_API_KEY === "string" && process.env.OPENAI_API_KEY.length > 0

    // Check if Groq API key is available
    const hasGroq = typeof process.env.GROQ_API_KEY === "string" && process.env.GROQ_API_KEY.length > 0

    // Determine which provider to use
    let provider = null
    if (hasGroq) {
      provider = "groq"
    } else if (hasOpenAI) {
      provider = "openai"
    }

    return NextResponse.json({
      available: hasOpenAI || hasGroq,
      provider: provider,
    })
  } catch (error) {
    console.error("Error checking LLM availability:", error)
    return NextResponse.json(
      {
        available: false,
        provider: null,
        error: "Failed to check LLM availability",
      },
      { status: 500 },
    )
  }
}

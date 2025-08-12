import { type NextRequest, NextResponse } from "next/server"
import { createCanvas } from "canvas"

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const documentId = searchParams.get("documentId")
    const page = Number.parseInt(searchParams.get("page") || "1", 10)

    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 })
    }

    // In a real implementation, you would retrieve the actual document page image
    // For this example, we'll generate a placeholder image
    const width = 850
    const height = 1100

    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext("2d")

    // Fill with white background
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, width, height)

    // Add a light grid pattern
    ctx.strokeStyle = "#f0f0f0"
    ctx.lineWidth = 1

    // Draw horizontal lines
    for (let y = 50; y < height; y += 50) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    // Draw vertical lines
    for (let x = 50; x < width; x += 50) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }

    // Add document info
    ctx.fillStyle = "#333333"
    ctx.font = "24px Arial"
    ctx.fillText(`${documentId}`, 50, 50)
    ctx.font = "18px Arial"
    ctx.fillText(`Page ${page}`, 50, 80)

    // Convert canvas to buffer
    const buffer = canvas.toBuffer("image/png")

    // Return the image
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (error) {
    console.error("Error rendering document page:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error occurred" },
      { status: 500 },
    )
  }
}

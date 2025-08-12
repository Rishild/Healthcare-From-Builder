import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Check if GROQ_API_KEY is available
    const groqApiKey = process.env.GROQ_API_KEY
    if (!groqApiKey) {
      return NextResponse.json({ error: "GROQ API key is not available" }, { status: 401 })
    }

    // Get the form data from the request
    const formData = await request.formData()
    const document = formData.get("document") as File

    if (!document) {
      return NextResponse.json({ error: "No document provided" }, { status: 400 })
    }

    // Convert the document to a buffer
    const bytes = await document.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Get the file type
    const fileType = document.type
    const fileName = document.name.toLowerCase()

    // Check if the file is a PDF or Word document
    if (
      !(
        fileType === "application/pdf" ||
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileType === "application/msword" ||
        fileName.endsWith(".pdf") ||
        fileName.endsWith(".docx") ||
        fileName.endsWith(".doc")
      )
    ) {
      return NextResponse.json({ error: "Invalid file type. Please upload a PDF or Word document" }, { status: 400 })
    }

    // For now, we'll return a mock response
    // In a real implementation, you would send the document to Groq for analysis
    try {
      // This is where you would call the Groq API
      // For now, we'll return a mock response
      const mockResponse = getMockResponse(document.name)

      return NextResponse.json(mockResponse)
    } catch (error) {
      console.error("Error calling Groq API:", error)
      return NextResponse.json({ error: "Failed to analyze document with Groq" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error processing document:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

// Helper function to generate a mock response
function getMockResponse(fileName: string) {
  // Extract the base name without extension
  const baseName = fileName.split(".")[0]

  return {
    title: `${baseName} Form`,
    fields: [
      {
        id: "name",
        type: "text",
        label: "Full Name",
        placeholder: "Enter your full name",
        required: true,
        position: { x: 50, y: 100 },
        size: { width: 300, height: 40 },
        page: 1,
        style: {
          fontSize: 14,
          fontFamily: "Arial",
          alignment: "left",
          borderStyle: "solid",
        },
      },
      {
        id: "email",
        type: "email",
        label: "Email Address",
        placeholder: "Enter your email address",
        required: true,
        position: { x: 50, y: 160 },
        size: { width: 300, height: 40 },
        page: 1,
        style: {
          fontSize: 14,
          fontFamily: "Arial",
          alignment: "left",
          borderStyle: "solid",
        },
      },
      {
        id: "phone",
        type: "text",
        label: "Phone Number",
        placeholder: "Enter your phone number",
        required: false,
        position: { x: 50, y: 220 },
        size: { width: 300, height: 40 },
        page: 1,
        style: {
          fontSize: 14,
          fontFamily: "Arial",
          alignment: "left",
          borderStyle: "solid",
        },
      },
      {
        id: "dob",
        type: "date",
        label: "Date of Birth",
        required: true,
        position: { x: 50, y: 280 },
        size: { width: 300, height: 40 },
        page: 1,
        style: {
          fontSize: 14,
          fontFamily: "Arial",
          alignment: "left",
          borderStyle: "solid",
        },
      },
      {
        id: "notes",
        type: "textarea",
        label: "Additional Notes",
        placeholder: "Enter any additional information",
        required: false,
        rows: 4,
        position: { x: 50, y: 340 },
        size: { width: 500, height: 120 },
        page: 1,
        style: {
          fontSize: 14,
          fontFamily: "Arial",
          alignment: "left",
          borderStyle: "solid",
        },
      },
    ],
    layout: {
      pageSize: { width: 8.5 * 96, height: 11 * 96 },
      orientation: "portrait",
      sections: [
        {
          id: "header",
          type: "header",
          position: { x: 50, y: 50 },
          size: { width: 500, height: 40 },
          content: `${baseName} Form`,
          style: {
            fontSize: "24px",
            fontWeight: "bold",
            textAlign: "center",
          },
        },
        {
          id: "footer",
          type: "footer",
          position: { x: 50, y: 700 },
          size: { width: 500, height: 30 },
          content: "© 2023 Healthcare Organization",
          style: {
            fontSize: "12px",
            textAlign: "center",
          },
        },
      ],
      pages: 1,
    },
  }
}

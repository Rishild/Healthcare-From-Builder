"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function JsonTemplateHelper() {
  const downloadSampleTemplate = () => {
    const sampleTemplate = {
      title: "Sample Form Template",
      fields: [
        {
          id: "name",
          type: "text",
          label: "Full Name",
          placeholder: "Enter your full name",
          required: true,
          conditionalLogic: null,
        },
        {
          id: "email",
          type: "email",
          label: "Email Address",
          placeholder: "Enter your email address",
          required: true,
          conditionalLogic: null,
        },
        {
          id: "age",
          type: "number",
          label: "Age",
          placeholder: "Enter your age",
          required: false,
          conditionalLogic: null,
        },
        {
          id: "notes",
          type: "textarea",
          label: "Additional Notes",
          placeholder: "Enter any additional information",
          required: false,
          rows: 3,
          conditionalLogic: null,
        },
      ],
    }

    const blob = new Blob([JSON.stringify(sampleTemplate, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "sample-form-template.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="text-sm text-muted-foreground mt-2">
      <p>Not sure about the JSON format?</p>
      <Button variant="link" onClick={downloadSampleTemplate} className="p-0 h-auto text-sm font-normal">
        <Download className="h-3 w-3 mr-1" />
        Download a sample template
      </Button>
    </div>
  )
}

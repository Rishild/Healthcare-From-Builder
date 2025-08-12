"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { FormField } from "@/types/form"
import { Edit2, Trash2, Download, Printer } from "lucide-react"
import { useRef } from "react"

interface SubmissionReviewProps {
  formTitle: string
  formFields: FormField[]
  formData: Record<string, any>
  onEdit: () => void
  onClear: () => void
  hospitalSettings?: {
    name: string
    qualification: string
    logoUrl: string
    headerStyle: "standard" | "modern" | "classic"
    primaryColor: string
  }
}

export function SubmissionReview({
  formTitle,
  formFields,
  formData,
  onEdit,
  onClear,
  hospitalSettings = {
    name: "Dr. Martin Jameson",
    qualification: "QUALIFICATION",
    logoUrl: "",
    headerStyle: "modern",
    primaryColor: "#0ea5e9",
  },
}: SubmissionReviewProps) {
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) return

    // Get the current styles from the page
    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n")
        } catch (e) {
          // Likely a CORS issue with external stylesheets
          return ""
        }
      })
      .filter(Boolean)
      .join("\n")

    // Add custom print styles
    const printStyles = `
      @media print {
        @page {
          size: A4;
          margin: 1cm;
        }
        body { 
          font-family: system-ui, sans-serif;
          color: #333;
        }
        .form-container { 
          max-width: 100%; 
          margin: 0; 
          padding: 0; 
        }
        .form-header-modern {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eaeaea;
        }
        .form-header-modern .provider-info h1 {
          font-size: 24px;
          font-weight: 500;
          margin: 0;
          color: ${hospitalSettings.primaryColor};
        }
        .form-header-modern .provider-info p {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #888;
          margin: 0;
        }
        .form-header-modern .logo {
          height: 50px;
          width: 50px;
        }
        .form-header-standard {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eaeaea;
        }
        .form-header-standard .logo {
          height: 60px;
          width: 60px;
        }
        .form-header-standard .provider-info h1 {
          font-size: 22px;
          font-weight: 700;
          margin: 0;
          color: ${hospitalSettings.primaryColor};
        }
        .form-header-standard .provider-info p {
          font-size: 14px;
          color: #666;
          margin: 0;
        }
        .form-header-classic {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eaeaea;
        }
        .form-header-classic .provider-info h1 {
          font-size: 26px;
          font-weight: 700;
          margin: 0 0 5px 0;
          color: ${hospitalSettings.primaryColor};
        }
        .form-header-classic .provider-info p {
          font-size: 14px;
          color: #666;
          margin: 0 0 10px 0;
        }
        .form-header-classic .logo {
          height: 50px;
          width: 50px;
          margin: 10px auto;
        }
        h1 { 
          font-size: 20px; 
          font-weight: bold; 
          margin: 20px 0; 
        }
        .submission-item { 
          margin-bottom: 15px; 
          page-break-inside: avoid; 
          border: 1px solid #eee; 
          padding: 15px; 
          border-radius: 6px; 
        }
        .field-label { 
          font-weight: bold; 
          color: #666; 
          margin-bottom: 5px; 
        }
        .field-value { 
          padding: 5px 0; 
        }
        .print-button { 
          display: none; 
        }
        .no-response { 
          font-style: italic; 
          color: #999; 
        }
      }
    `

    // Create the hospital branding header based on the selected style
    let hospitalBranding = ""

    if (hospitalSettings.headerStyle === "modern") {
      hospitalBranding = `
        <div class="form-header-modern">
          <div class="provider-info">
            <h1>${hospitalSettings.name || "Dr. Martin Jameson"}</h1>
            <p>${hospitalSettings.qualification || "QUALIFICATION"}</p>
          </div>
          ${
            hospitalSettings.logoUrl
              ? `
            <img src="${hospitalSettings.logoUrl}" alt="Medical Logo" class="logo" style="filter: brightness(0) saturate(100%) hue-rotate(0deg) sepia(0%) saturate(0%) brightness(100%) invert(0%) sepia(100%) saturate(5000%) hue-rotate(${hospitalSettings.primaryColor === "#0ea5e9" ? "190deg" : "0deg"});" />
          `
              : ""
          }
        </div>
      `
    } else if (hospitalSettings.headerStyle === "standard") {
      hospitalBranding = `
        <div class="form-header-standard">
          ${
            hospitalSettings.logoUrl
              ? `
            <img src="${hospitalSettings.logoUrl}" alt="Medical Logo" class="logo" />
          `
              : ""
          }
          <div class="provider-info">
            <h1>${hospitalSettings.name || "Medical Center"}</h1>
            <p>${hospitalSettings.qualification || "Healthcare Services"}</p>
          </div>
        </div>
      `
    } else if (hospitalSettings.headerStyle === "classic") {
      hospitalBranding = `
        <div class="form-header-classic">
          <div class="provider-info">
            <h1>${hospitalSettings.name || "Medical Center"}</h1>
            <p>${hospitalSettings.qualification || "Healthcare Services"}</p>
          </div>
          ${
            hospitalSettings.logoUrl
              ? `
            <img src="${hospitalSettings.logoUrl}" alt="Medical Logo" class="logo" />
          `
              : ""
          }
        </div>
      `
    }

    const printDocument = printWindow.document
    printDocument.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${formTitle} - Submission</title>
          <style>${styles}\n${printStyles}</style>
        </head>
        <body>
          <div class="form-container">
            ${hospitalBranding}
            <h1>${formTitle} - Form Submission</h1>
            <div>${printContent.innerHTML}</div>
            <div class="print-controls" style="margin-top: 20px;">
              <button onclick="window.print(); setTimeout(() => window.close(), 500);" style="padding: 8px 16px; background: #0ea5e9; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Print Submission
              </button>
            </div>
          </div>
        </body>
      </html>
    `)
    printDocument.close()
  }

  const handleDownload = () => {
    const submissionData = {
      formTitle,
      submittedAt: new Date().toISOString(),
      responses: formData,
    }

    const blob = new Blob([JSON.stringify(submissionData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${formTitle.toLowerCase().replace(/\s+/g, "-")}-submission.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Submission Review</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-1">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload} className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Hospital branding preview based on selected style */}
      {hospitalSettings.headerStyle === "modern" && (
        <div className="flex justify-between items-center p-4 border-b mb-4">
          <div>
            <h2 style={{ color: hospitalSettings.primaryColor }} className="text-xl font-medium">
              {hospitalSettings.name || "Dr. Martin Jameson"}
            </h2>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">
              {hospitalSettings.qualification || "QUALIFICATION"}
            </p>
          </div>
          {hospitalSettings.logoUrl && (
            <img
              src={hospitalSettings.logoUrl || "/placeholder.svg"}
              alt="Medical Logo"
              className="h-12 w-12 object-contain"
              style={{
                filter: `brightness(0) saturate(100%) hue-rotate(0deg) sepia(0%) saturate(0%) brightness(100%) invert(0%) sepia(100%) saturate(5000%) hue-rotate(${hospitalSettings.primaryColor === "#0ea5e9" ? "190deg" : "0deg"})`,
              }}
            />
          )}
        </div>
      )}

      {hospitalSettings.headerStyle === "standard" && (
        <div className="flex items-center gap-4 p-4 border-b mb-4">
          {hospitalSettings.logoUrl && (
            <img
              src={hospitalSettings.logoUrl || "/placeholder.svg"}
              alt="Medical Logo"
              className="h-12 w-12 object-contain"
            />
          )}
          <div>
            <h2 className="text-xl font-bold" style={{ color: hospitalSettings.primaryColor }}>
              {hospitalSettings.name || "Medical Center"}
            </h2>
            <p className="text-sm text-muted-foreground">{hospitalSettings.qualification || "Healthcare Services"}</p>
          </div>
        </div>
      )}

      {hospitalSettings.headerStyle === "classic" && (
        <div className="text-center p-4 border-b mb-4">
          <h2 className="text-2xl font-bold" style={{ color: hospitalSettings.primaryColor }}>
            {hospitalSettings.name || "Medical Center"}
          </h2>
          <p className="text-sm text-muted-foreground">{hospitalSettings.qualification || "Healthcare Services"}</p>
          {hospitalSettings.logoUrl && (
            <img
              src={hospitalSettings.logoUrl || "/placeholder.svg"}
              alt="Medical Logo"
              className="h-12 w-12 object-contain mx-auto mt-2"
            />
          )}
        </div>
      )}

      <div ref={printRef} className="space-y-4">
        {formFields.map((field) => {
          // Skip fields that don't have a value or are not visible due to conditional logic
          if (formData[field.id] === undefined) return null

          let displayValue: React.ReactNode = formData[field.id]

          // Format display value based on field type
          if (field.type === "checkbox" && Array.isArray(displayValue)) {
            displayValue = displayValue.join(", ")
          } else if (field.type === "toggle") {
            displayValue = displayValue ? "Yes" : "No"
          } else if (field.type === "date" && displayValue) {
            try {
              displayValue = new Date(displayValue).toLocaleDateString()
            } catch (e) {
              // Keep original value if date parsing fails
            }
          } else if (field.type === "file" && displayValue) {
            displayValue = "File uploaded"
          } else if (field.type === "signature" && displayValue) {
            displayValue = "Signature captured"
          }

          return (
            <Card key={field.id} className="overflow-hidden submission-item">
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="font-medium text-muted-foreground field-label">{field.label}</div>
                  <div className="md:col-span-2 break-words field-value">
                    {displayValue || <span className="text-muted-foreground italic no-response">No response</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onClear} className="flex items-center gap-1">
          <Trash2 className="h-4 w-4" />
          Clear Submission
        </Button>
        <Button onClick={onEdit} className="flex items-center gap-1">
          <Edit2 className="h-4 w-4" />
          Edit Responses
        </Button>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import type { FormField } from "@/types/form"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ArrowRight, Printer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FormPreviewProps {
  formTitle: string
  formFields: FormField[]
  initialData?: Record<string, any>
  onSubmit?: (data: Record<string, any>) => void
  isSubmitted?: boolean
  hospitalSettings?: {
    name: string
    qualification: string
    logoUrl: string
    headerStyle: "standard" | "modern" | "classic"
    primaryColor: string
  }
}

export function FormPreview({
  formTitle,
  formFields,
  initialData = {},
  onSubmit,
  isSubmitted = false,
  hospitalSettings = {
    name: "Dr. Martin Jameson",
    qualification: "QUALIFICATION",
    logoUrl: "",
    headerStyle: "modern",
    primaryColor: "#0ea5e9",
  },
}: FormPreviewProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {})
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(isSubmitted)
  const formRef = useRef<HTMLFormElement>(null)

  // Add this to the component function
  const { toast } = useToast()

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData(initialData)
    }
  }, [initialData])

  // Update submitted state when isSubmitted prop changes
  useEffect(() => {
    setSubmitted(isSubmitted)
  }, [isSubmitted])

  // Update the handleInputChange function
  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [fieldId]: value,
    }))

    // Clear validation error for this field if it exists
    if (validationErrors[fieldId]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }

    // Add real-time validation for specific field types
    const field = formFields.find((f) => f.id === fieldId)
    if (field && value) {
      // Email validation
      if (field.type === "email") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          toast({
            title: "Invalid Email Format",
            description: "Please enter a valid email address",
            variant: "warning",
          })
        }
      }

      // Phone validation
      if (field.type === "phone") {
        const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/
        if (!phoneRegex.test(value)) {
          toast({
            title: "Invalid Phone Number",
            description: "Please enter a valid phone number",
            variant: "warning",
          })
        }
      }

      // Number validation
      if (field.type === "number") {
        if (isNaN(Number(value))) {
          toast({
            title: "Invalid Number",
            description: "Please enter a valid number",
            variant: "warning",
          })
        }
      }
    }
  }

  // Update the validateForm function
  const validateForm = () => {
    const errors: Record<string, string> = {}
    let hasShownToast = false

    formFields.forEach((field) => {
      // Skip validation if field is not visible due to conditional logic
      if (!shouldShowField(field)) return

      if (field.required) {
        const value = formData[field.id]

        if (value === undefined || value === null || value === "") {
          errors[field.id] = "This field is required"

          // Show toast for the first error only
          if (!hasShownToast) {
            toast({
              title: "Required Field Missing",
              description: `${field.label} is required`,
              variant: "destructive",
            })
            hasShownToast = true
          }
        } else if (Array.isArray(value) && value.length === 0) {
          errors[field.id] = "Please select at least one option"

          // Show toast for the first error only
          if (!hasShownToast) {
            toast({
              title: "Selection Required",
              description: `Please select at least one option for ${field.label}`,
              variant: "destructive",
            })
            hasShownToast = true
          }
        }
      }

      // Add type-specific validation
      if (field.type === "email" && formData[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData[field.id])) {
          errors[field.id] = "Please enter a valid email address"

          // Show toast for the first error only
          if (!hasShownToast) {
            toast({
              title: "Invalid Email Format",
              description: "Please enter a valid email address",
              variant: "destructive",
            })
            hasShownToast = true
          }
        }
      }

      if (field.type === "phone" && formData[field.id]) {
        const phoneRegex = /^\+?[0-9\s\-()]{8,20}$/
        if (!phoneRegex.test(formData[field.id])) {
          errors[field.id] = "Please enter a valid phone number"

          // Show toast for the first error only
          if (!hasShownToast) {
            toast({
              title: "Invalid Phone Number",
              description: "Please enter a valid phone number",
              variant: "destructive",
            })
            hasShownToast = true
          }
        }
      }
    })

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      setSubmitted(true)
      if (onSubmit) {
        onSubmit(formData)
      }
    } else {
      // Scroll to the first error
      const firstErrorId = Object.keys(validationErrors)[0]
      if (firstErrorId) {
        const element = document.getElementById(firstErrorId)
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" })
        }
      }
    }
  }

  const shouldShowField = (field: FormField): boolean => {
    if (!field.conditionalLogic) return true

    const { fieldId, operator, value } = field.conditionalLogic
    const dependentFieldValue = formData[fieldId]

    if (dependentFieldValue === undefined) return false

    switch (operator) {
      case "equals":
        return dependentFieldValue === value
      case "not_equals":
        return dependentFieldValue !== value
      case "contains":
        return String(dependentFieldValue).includes(value)
      case "greater_than":
        return Number(dependentFieldValue) > Number(value)
      case "less_than":
        return Number(dependentFieldValue) < Number(value)
      default:
        return true
    }
  }

  // Print function that preserves the form's appearance and includes hospital branding
  const handlePrint = () => {
    if (!formRef.current) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow pop-ups to print the form")
      return
    }

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

    // Create a clone of the form to manipulate for printing
    const formClone = formRef.current.cloneNode(true) as HTMLFormElement

    // Remove the submit button from the print view
    const submitButton = formClone.querySelector('button[type="submit"]')
    if (submitButton && submitButton.parentNode) {
      submitButton.parentNode.removeChild(submitButton)
    }

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
        width: auto;
        max-width: 80px;
        object-fit: contain;
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
        width: auto;
        max-width: 80px;
        object-fit: contain;
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
        width: auto;
        max-width: 80px;
        margin: 10px auto;
        object-fit: contain;
      }
      .form-title { 
        font-size: 20px; 
        font-weight: bold; 
        margin: 20px 0; 
      }
      .form-field { 
        margin-bottom: 15px; 
        page-break-inside: avoid; 
      }
      .field-label { 
        font-weight: bold; 
        margin-bottom: 5px; 
      }
      .print-button { 
        display: none; 
      }
      input, textarea, select { 
        border: 1px solid #ddd; 
        padding: 8px; 
        width: 100%; 
      }
      input[type="checkbox"], input[type="radio"] { 
        width: auto; 
        margin-right: 8px; 
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
          <img src="${hospitalSettings.logoUrl}" alt="Medical Logo" class="logo" />
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

    // Create a base64 version of the logo to ensure it prints correctly
    const createBase64Logo = () => {
      return new Promise<void>((resolve) => {
        if (hospitalSettings.logoUrl) {
          const img = new Image()
          img.crossOrigin = "anonymous"
          img.onload = () => {
            const canvas = document.createElement("canvas")
            canvas.width = img.width
            canvas.height = img.height
            const ctx = canvas.getContext("2d")
            if (ctx) {
              ctx.drawImage(img, 0, 0)
              const dataURL = canvas.toDataURL("image/png")

              // Replace the logo URL with the base64 data URL
              hospitalBranding = hospitalBranding.replace(hospitalSettings.logoUrl, dataURL)
            }
            resolve()
          }
          img.onerror = () => {
            console.error("Error loading logo image")
            resolve()
          }
          img.src = hospitalSettings.logoUrl
        } else {
          resolve()
        }
      })
    }

    // Use the base64 logo function and then write to the print window
    createBase64Logo().then(() => {
      printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${formTitle} - Print Form</title>
          <style>${styles}\n${printStyles}</style>
        </head>
        <body>
          <div class="form-container">
            ${hospitalBranding}
            <h2 class="form-title">${formTitle}</h2>
            <div class="form-content">
              ${formClone.innerHTML}
            </div>
            <div class="print-controls" style="margin-top: 20px;">
              <button onclick="window.print(); setTimeout(() => window.close(), 500);" style="padding: 8px 16px; background: #0ea5e9; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Print Form
              </button>
            </div>
          </div>
        </body>
      </html>
    `)

      printWindow.document.close()
    })
  }

  if (submitted && !onSubmit) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-primary" />
          <CardTitle className="text-2xl">Form Submitted</CardTitle>
          <CardDescription>Thank you for submitting the form. Your response has been recorded.</CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button onClick={() => setSubmitted(false)}>Submit Another Response</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{formTitle}</h2>
        <Button variant="outline" size="sm" onClick={handlePrint} className="flex items-center gap-1">
          <Printer className="h-4 w-4" />
          Print Form
        </Button>
      </div>

      {/* Hospital branding preview based on selected style */}
      {hospitalSettings.headerStyle === "modern" && (
        <div className="flex justify-between items-center p-4 border-b">
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
        <div className="flex items-center gap-4 p-4 border-b">
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
        <div className="text-center p-4 border-b">
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

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        {formFields.map((field) => {
          // Skip rendering if conditional logic dictates the field should be hidden
          if (!shouldShowField(field)) return null

          return (
            <div key={field.id} className="space-y-2 form-field">
              <Label htmlFor={field.id} className="font-medium field-label">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>

              {field.type === "text" && (
                <Input
                  id={field.id}
                  placeholder={field.placeholder}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                  className={validationErrors[field.id] ? "border-destructive" : ""}
                />
              )}

              {field.type === "textarea" && (
                <Textarea
                  id={field.id}
                  placeholder={field.placeholder}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                  rows={field.rows || 3}
                  className={validationErrors[field.id] ? "border-destructive" : ""}
                />
              )}

              {field.type === "number" && (
                <Input
                  id={field.id}
                  type="number"
                  placeholder={field.placeholder}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                  className={validationErrors[field.id] ? "border-destructive" : ""}
                />
              )}

              {field.type === "email" && (
                <Input
                  id={field.id}
                  type="email"
                  placeholder={field.placeholder}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                  className={validationErrors[field.id] ? "border-destructive" : ""}
                />
              )}

              {field.type === "phone" && (
                <Input
                  id={field.id}
                  type="tel"
                  placeholder={field.placeholder}
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                  className={validationErrors[field.id] ? "border-destructive" : ""}
                />
              )}

              {field.type === "date" && (
                <Input
                  id={field.id}
                  type="date"
                  value={formData[field.id] || ""}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  required={field.required}
                  className={validationErrors[field.id] ? "border-destructive" : ""}
                />
              )}

              {field.type === "select" && (
                <Select value={formData[field.id] || ""} onValueChange={(value) => handleInputChange(field.id, value)}>
                  <SelectTrigger className={validationErrors[field.id] ? "border-destructive" : ""}>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {(field.options || []).map((option, index) => (
                      <SelectItem key={index} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {field.type === "radio" && (
                <RadioGroup
                  value={formData[field.id] || ""}
                  onValueChange={(value) => handleInputChange(field.id, value)}
                  className={validationErrors[field.id] ? "border border-destructive rounded-md p-2" : ""}
                >
                  {(field.options || []).map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`${field.id}-${index}`} />
                      <Label htmlFor={`${field.id}-${index}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              )}

              {field.type === "checkbox" && (
                <div
                  className={`space-y-2 ${validationErrors[field.id] ? "border border-destructive rounded-md p-2" : ""}`}
                >
                  {(field.options || []).map((option, index) => {
                    const checkboxId = `${field.id}-${index}`
                    return (
                      <div key={index} className="flex items-center space-x-2">
                        <Checkbox
                          id={checkboxId}
                          checked={(formData[field.id] || []).includes(option)}
                          onCheckedChange={(checked) => {
                            const currentValues = formData[field.id] || []
                            const newValues = checked
                              ? [...currentValues, option]
                              : currentValues.filter((val: string) => val !== option)
                            handleInputChange(field.id, newValues)
                          }}
                        />
                        <Label htmlFor={checkboxId}>{option}</Label>
                      </div>
                    )
                  })}
                </div>
              )}

              {field.type === "toggle" && (
                <div className="flex items-center space-x-2">
                  <Switch
                    id={field.id}
                    checked={formData[field.id] || false}
                    onCheckedChange={(checked) => handleInputChange(field.id, checked)}
                  />
                  <Label htmlFor={field.id}>{field.placeholder}</Label>
                </div>
              )}

              {field.type === "signature" && (
                <div className="border rounded-md p-4 h-40 flex items-center justify-center bg-muted/20">
                  <p className="text-muted-foreground text-center">
                    Signature field (implementation would require a canvas component)
                  </p>
                </div>
              )}

              {field.type === "file" && (
                <Input
                  id={field.id}
                  type="file"
                  onChange={(e) => {
                    const files = (e.target as HTMLInputElement).files
                    handleInputChange(field.id, files ? files[0] : null)
                  }}
                  required={field.required}
                  className={validationErrors[field.id] ? "border-destructive" : ""}
                />
              )}

              {validationErrors[field.id] && <p className="text-sm text-destructive">{validationErrors[field.id]}</p>}
            </div>
          )
        })}

        <Button type="submit" className="w-full flex items-center gap-1">
          Submit Form
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </form>
    </div>
  )
}

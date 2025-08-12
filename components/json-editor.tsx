"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download, Copy, RefreshCw, Check } from "lucide-react"
import type { FormField, FormSchema } from "@/types/form"
import { JsonTemplateHelper } from "@/components/json-template-helper"

interface JsonEditorProps {
  formTitle: string
  formFields: FormField[]
  onUpdate: (title: string, fields: FormField[]) => void
}

export function JsonEditor({ formTitle, formFields, onUpdate }: JsonEditorProps) {
  const [jsonValue, setJsonValue] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Convert form data to JSON string
  useEffect(() => {
    try {
      const formData: FormSchema = {
        title: formTitle,
        fields: formFields,
      }
      setJsonValue(JSON.stringify(formData, null, 2))
      setError(null)
    } catch (err) {
      console.error("Error stringifying form data:", err)
    }
  }, [formTitle, formFields])

  // Handle JSON updates
  const handleJsonChange = (value: string) => {
    setJsonValue(value)
    setError(null)
  }

  // Apply JSON changes to the form
  const applyChanges = () => {
    try {
      let parsed

      try {
        parsed = JSON.parse(jsonValue)
      } catch (parseError) {
        setError("Invalid JSON syntax. Please check for missing commas, brackets, or quotes.")
        return
      }

      // Validate the structure
      if (!parsed || typeof parsed !== "object") {
        setError("JSON must be a valid object")
        return
      }

      if (!parsed.title || typeof parsed.title !== "string") {
        setError("JSON must include a 'title' property of type string")
        return
      }

      if (!Array.isArray(parsed.fields)) {
        setError("JSON must include a 'fields' array")
        return
      }

      // Validate each field
      const invalidFields = []
      parsed.fields.forEach((field: any, index: number) => {
        if (!field.id) {
          invalidFields.push(`Field at index ${index} is missing an 'id'`)
        }
        if (!field.type) {
          invalidFields.push(`Field at index ${index} is missing a 'type'`)
        }
        if (!field.label) {
          invalidFields.push(`Field at index ${index} is missing a 'label'`)
        }

        // Validate field type
        const validTypes = [
          "text",
          "textarea",
          "number",
          "email",
          "phone",
          "date",
          "select",
          "radio",
          "checkbox",
          "toggle",
          "signature",
          "file",
        ]
        if (field.type && !validTypes.includes(field.type)) {
          invalidFields.push(`Field "${field.label || field.id || index}" has invalid type: ${field.type}`)
        }

        // Validate options for fields that need them
        if (
          ["select", "radio", "checkbox"].includes(field.type) &&
          (!field.options || !Array.isArray(field.options) || field.options.length === 0)
        ) {
          invalidFields.push(`Field "${field.label || field.id || index}" of type ${field.type} requires options array`)
        }
      })

      if (invalidFields.length > 0) {
        setError(`Validation errors:\n${invalidFields.join("\n")}`)
        return
      }

      // Ensure each field has conditionalLogic property
      const fieldsWithConditionalLogic = parsed.fields.map((field: any) => ({
        ...field,
        conditionalLogic: field.conditionalLogic || null,
      }))

      onUpdate(parsed.title, fieldsWithConditionalLogic)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format")
    }
  }

  // Copy JSON to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(jsonValue)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  // Download JSON file
  const downloadJson = () => {
    try {
      const blob = new Blob([jsonValue], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${formTitle.toLowerCase().replace(/\s+/g, "-")}-form.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error("Failed to download:", err)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Form JSON Structure</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyToClipboard} className="flex items-center gap-1">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button variant="outline" size="sm" onClick={downloadJson} className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <Textarea
            value={jsonValue}
            onChange={(e) => handleJsonChange(e.target.value)}
            className="font-mono text-sm h-[400px] resize-none"
            spellCheck={false}
          />
        </CardContent>
        <CardFooter className="flex justify-between bg-muted/20 p-4">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex-1" />
          <Button onClick={applyChanges} className="flex items-center gap-1">
            <RefreshCw className="h-4 w-4" />
            Apply Changes
          </Button>
        </CardFooter>
      </Card>

      <div className="text-sm text-muted-foreground">
        <p>Edit the JSON directly to modify the form structure. Click "Apply Changes" to update the form.</p>
        <p className="mt-1">
          The JSON structure must include a <code className="bg-muted px-1 rounded">title</code> string and a{" "}
          <code className="bg-muted px-1 rounded">fields</code> array.
        </p>
        <JsonTemplateHelper />
      </div>
    </div>
  )
}

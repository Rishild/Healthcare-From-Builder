"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Sparkles, Upload, Info, AlertTriangle, Brain } from "lucide-react"
import { generateFormFromDescription } from "@/lib/ai-form-generator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { FormField } from "@/types/form"
// Add import for JsonTemplateHelper
import { JsonTemplateHelper } from "@/components/json-template-helper"
import { Badge } from "@/components/ui/badge"

interface FormGeneratorProps {
  onFormGenerated: (title: string, fields: FormField[]) => void
}

export function FormGenerator({ onFormGenerated }: FormGeneratorProps) {
  const [description, setDescription] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")
  const [llmProvider, setLlmProvider] = useState<string | null>(null)
  const [llmAvailable, setLlmAvailable] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Check if LLM is available
  useEffect(() => {
    const checkLLMAvailability = async () => {
      try {
        const response = await fetch("/api/check-llm-availability")
        const data = await response.json()
        setLlmAvailable(data.available)
        setLlmProvider(data.provider)
      } catch (error) {
        console.error("Error checking LLM availability:", error)
        setLlmAvailable(false)
        setLlmProvider(null)
      }
    }

    checkLLMAvailability()
  }, [])

  const handleGenerate = async () => {
    if (!description.trim()) {
      setError("Please provide a description of the form you want to create.")
      return
    }

    setError("")
    setIsGenerating(true)

    try {
      const { title, fields } = await generateFormFromDescription(description)
      onFormGenerated(title, fields)
    } catch (err: any) {
      console.error("Form generation error:", err)

      // Check if the error is related to the API key
      if (err.message && (err.message.includes("API key") || err.message.includes("authentication"))) {
        setError("LLM API key is missing or invalid. Using fallback templates instead.")
      } else {
        setError("Failed to generate form. Using fallback templates instead.")
      }

      // Try again with fallback
      try {
        const { title, fields } = await generateFormFromDescription(description)
        onFormGenerated(title, fields)
      } catch (fallbackErr) {
        setError("Failed to generate form. Please try again later.")
        console.error("Fallback also failed:", fallbackErr)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        let parsed

        try {
          parsed = JSON.parse(content)
        } catch (parseError) {
          setError("Invalid JSON format: Could not parse the file")
          console.error("JSON parse error:", parseError)
          return
        }

        // More robust validation of the JSON structure
        if (typeof parsed === "object" && parsed !== null) {
          if (typeof parsed.title === "string" && Array.isArray(parsed.fields)) {
            // Validate each field has the required properties
            const validFields = parsed.fields.every(
              (field: any) =>
                typeof field.id === "string" && typeof field.type === "string" && typeof field.label === "string",
            )

            if (validFields) {
              // Ensure each field has conditionalLogic property
              const fieldsWithConditionalLogic = parsed.fields.map((field: any) => ({
                ...field,
                conditionalLogic: field.conditionalLogic || null,
              }))

              onFormGenerated(parsed.title, fieldsWithConditionalLogic)
            } else {
              setError("Invalid JSON format: Some fields are missing required properties (id, type, or label)")
            }
          } else {
            setError("Invalid JSON format: File must contain a title string and fields array")
          }
        } else {
          setError("Invalid JSON format: File does not contain a valid JSON object")
        }
      } catch (error) {
        setError("Error processing JSON file")
        console.error("Error processing JSON:", error)
      }
    }

    reader.onerror = () => {
      setError("Error reading file. Please try again with a different file.")
    }

    reader.readAsText(file)

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const examples = [
    "Create a patient intake form for a pediatric clinic",
    "Generate a HIPAA consent form with signature field",
    "Design a mental health assessment for teenagers with anxiety and depression screening",
    "Build a physical therapy evaluation form with pain scale and mobility assessment",
    "Create a diabetes management tracking form with blood glucose and medication logs",
    "Make an autism screening questionnaire for children aged 3-5",
  ]

  const handleExampleClick = (example: string) => {
    setDescription(example)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          LLM Form Generator
          {llmAvailable && llmProvider && (
            <Badge variant="outline" className="ml-2">
              Using {llmProvider === "groq" ? "Groq" : "OpenAI"}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Describe the healthcare form you need, and our AI will generate it with appropriate fields
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!llmAvailable && (
          <Alert variant="warning" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              LLM API key is missing. The system will use pre-built templates based on keywords in your description.
            </AlertDescription>
          </Alert>
        )}

        {llmAvailable && (
          <Alert variant="info" className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <p className="font-medium">Tips for better form generation:</p>
              <ul className="list-disc pl-5 mt-1 text-sm">
                <li>Be specific about the type of healthcare form you need</li>
                <li>Mention specific sections or fields you want included</li>
                <li>Specify the target patient population (e.g., pediatric, geriatric)</li>
                <li>Include any special requirements or compliance needs</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Textarea
          placeholder="Describe the form you want to create (e.g., 'Create a patient intake form for a pediatric clinic with sections for medical history, allergies, and insurance information')"
          className="min-h-[150px]"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div>
          <p className="text-sm text-muted-foreground mb-2">Examples:</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example) => (
              <Button key={example} variant="outline" size="sm" onClick={() => handleExampleClick(example)}>
                {example}
              </Button>
            ))}
          </div>
        </div>

        <JsonTemplateHelper />
      </CardContent>
      <CardFooter className="flex gap-2">
        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" className="hidden" />
        <Button variant="outline" className="w-1/2" onClick={() => fileInputRef.current?.click()}>
          <Upload className="mr-2 h-4 w-4" />
          Import JSON
        </Button>
        <Button className="w-1/2" onClick={handleGenerate} disabled={isGenerating || !description.trim()}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Form...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Form
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

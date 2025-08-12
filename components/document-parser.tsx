"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FileText, Upload, Loader2, AlertCircle, AlertTriangle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExactFormPreview } from "@/components/exact-form-preview"
import type { FormField, FormLayout } from "@/types/form"
// Update the imports to include our new Groq document service
import { analyzeDocumentWithGroq } from "@/lib/groq-document-service"

interface DocumentParserProps {
  onFormExtracted: (title: string, fields: FormField[], layout?: FormLayout, pageImages?: string[]) => void
}

export function DocumentParser({ onFormExtracted }: DocumentParserProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState("")
  const [isGroqKeyAvailable, setIsGroqKeyAvailable] = useState<boolean | null>(null)
  const [extractedForm, setExtractedForm] = useState<{
    title: string
    fields: FormField[]
    layout?: FormLayout
    pageImages?: string[]
  } | null>(null)
  const [activeTab, setActiveTab] = useState("upload")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Check if Groq API key is available on component mount
  useEffect(() => {
    async function checkGroqApiKey() {
      try {
        const response = await fetch("/api/check-groq-key")
        if (response.ok) {
          const data = await response.json()
          setIsGroqKeyAvailable(data.available)
        } else {
          setIsGroqKeyAvailable(false)
        }
      } catch (error) {
        console.error("Error checking Groq API key:", error)
        setIsGroqKeyAvailable(false)
      }
    }

    checkGroqApiKey()
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    const fileType = file.type
    const fileName = file.name.toLowerCase()

    if (
      fileType === "application/pdf" ||
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      fileType === "application/msword" ||
      fileName.endsWith(".pdf") ||
      fileName.endsWith(".docx") ||
      fileName.endsWith(".doc")
    ) {
      setUploadedFile(file)
      setError("")
    } else {
      setError("Please upload a PDF or Word document")
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF or Word document",
        variant: "destructive",
      })
    }
  }

  // Replace the extractFormFromDocument function with this updated version
  const extractFormFromDocument = async () => {
    if (!uploadedFile) return

    setIsProcessing(true)
    setError("")

    try {
      // Check if Groq API key is available
      if (!isGroqKeyAvailable) {
        setError("Groq API key is not available. Please check your environment variables.")
        toast({
          title: "API Key Missing",
          description: "Groq API key is not available. Document parsing requires a valid Groq API key.",
          variant: "destructive",
        })
        setIsProcessing(false)
        return
      }

      // Use our Groq-powered document analysis service
      const result = await analyzeDocumentWithGroq(uploadedFile)

      if (result.success) {
        // Store the extracted form data
        setExtractedForm({
          title: result.title,
          fields: result.fields,
          layout: result.layout,
          pageImages: result.pageImages,
        })

        // Also pass to parent component
        onFormExtracted(result.title, result.fields, result.layout, result.pageImages)

        toast({
          title: "Document Processed Successfully",
          description: `Extracted ${result.fields.length} fields from ${uploadedFile.name}`,
          variant: "success",
        })

        // Switch to the preview tab
        setActiveTab("preview")
      } else {
        setError(result.error || "Failed to process document")
        toast({
          title: "Processing Failed",
          description: result.error || "Failed to process document. Please try a different file.",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error processing document:", err)
      setError("Failed to process document. Please try a different file.")
      toast({
        title: "Processing Error",
        description: "An unexpected error occurred while processing the document.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      const fileType = file.type
      const fileName = file.name.toLowerCase()

      if (
        fileType === "application/pdf" ||
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        fileType === "application/msword" ||
        fileName.endsWith(".pdf") ||
        fileName.endsWith(".docx") ||
        fileName.endsWith(".doc")
      ) {
        setUploadedFile(file)
        setError("")
      } else {
        setError("Please upload a PDF or Word document")
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF or Word document",
          variant: "destructive",
        })
      }
    }
  }

  const handleFormSubmit = (data: Record<string, any>) => {
    console.log("Form submitted with data:", data)
    toast({
      title: "Form Submitted",
      description: "Your form has been successfully submitted.",
      variant: "success",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Document Parser
        </CardTitle>
        <CardDescription>Upload a PDF or Word document to create an exact digital replica of your form</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isGroqKeyAvailable === false && (
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Groq API key is not available. Document parsing requires a valid Groq API key. Please check your
              environment variables.
            </AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="upload">Upload Document</TabsTrigger>
            <TabsTrigger value="preview" disabled={!extractedForm}>
              Preview Form
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div
              className="border-2 border-dashed rounded-lg p-6 text-center"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-2">
                <FileText className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {uploadedFile ? uploadedFile.name : "Drag and drop or click to upload a PDF or Word document"}
                </p>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Browse Files
                </Button>
              </div>
            </div>

            {uploadedFile && (
              <Button
                className="w-full"
                onClick={extractFormFromDocument}
                disabled={isProcessing || isGroqKeyAvailable === false}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Document with OCR...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Extract Form from Document
                  </>
                )}
              </Button>
            )}

            <div className="text-sm text-muted-foreground mt-2">
              <p>Supported file types: PDF (.pdf), Word (.doc, .docx)</p>
              <p className="mt-1">
                The document parser uses OCR technology to create an exact digital replica of your form.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            {extractedForm && (
              <ExactFormPreview
                formTitle={extractedForm.title}
                formFields={extractedForm.fields}
                formLayout={extractedForm.layout}
                originalImageUrl={extractedForm.pageImages?.[0]}
                onSubmit={handleFormSubmit}
              />
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

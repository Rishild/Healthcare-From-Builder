"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormPreview } from "@/components/form-preview"
import { SubmissionReview } from "@/components/submission-review"
import type { FormField } from "@/types/form"
import { CheckCircle2 } from "lucide-react"

interface FormSubmissionHandlerProps {
  formTitle: string
  formFields: FormField[]
  hospitalSettings?: {
    name: string
    qualification: string
    logoUrl: string
    headerStyle: "standard" | "modern" | "classic"
    primaryColor: string
  }
}

export function FormSubmissionHandler({
  formTitle,
  formFields,
  hospitalSettings = {
    name: "Dr. Martin Jameson",
    qualification: "QUALIFICATION",
    logoUrl: "",
    headerStyle: "modern",
    primaryColor: "#0ea5e9",
  },
}: FormSubmissionHandlerProps) {
  const [activeTab, setActiveTab] = useState("form")
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Load saved form data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(`form_data_${formTitle}`)
    if (savedData) {
      try {
        setFormData(JSON.parse(savedData))
        setIsSubmitted(true)
      } catch (error) {
        console.error("Error parsing saved form data:", error)
      }
    }
  }, [formTitle])

  // Save form data to localStorage when it changes
  useEffect(() => {
    if (Object.keys(formData).length > 0) {
      localStorage.setItem(`form_data_${formTitle}`, JSON.stringify(formData))
    }
  }, [formData, formTitle])

  const handleFormSubmit = (data: Record<string, any>) => {
    setFormData(data)
    setIsSubmitted(true)
    setActiveTab("review")
  }

  const handleEditSubmission = () => {
    setActiveTab("form")
  }

  const handleClearSubmission = () => {
    setFormData({})
    setIsSubmitted(false)
    localStorage.removeItem(`form_data_${formTitle}`)
    setActiveTab("form")
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-2xl">{formTitle}</CardTitle>
          {isSubmitted && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <CheckCircle2 className="h-4 w-4" />
              <span>Submitted</span>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="form" disabled={false}>
                Form View
              </TabsTrigger>
              <TabsTrigger value="review" disabled={!isSubmitted}>
                Submission Review
              </TabsTrigger>
            </TabsList>

            <TabsContent value="form">
              <FormPreview
                formTitle={formTitle}
                formFields={formFields}
                initialData={formData}
                onSubmit={handleFormSubmit}
                isSubmitted={isSubmitted}
                hospitalSettings={hospitalSettings}
              />
            </TabsContent>

            <TabsContent value="review">
              <SubmissionReview
                formTitle={formTitle}
                formFields={formFields}
                formData={formData}
                onEdit={handleEditSubmission}
                onClear={handleClearSubmission}
                hospitalSettings={hospitalSettings}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

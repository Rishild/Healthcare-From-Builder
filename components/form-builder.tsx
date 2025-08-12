"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FormGenerator } from "@/components/form-generator"
import { FormEditorSimple } from "@/components/form-editor-simple"
import { FormSubmissionHandler } from "@/components/form-submission-handler"
import { TemplateGallery } from "@/components/template-gallery"
import { JsonEditor } from "@/components/json-editor"
import { DocumentParser } from "@/components/document-parser"
import { HospitalSettings } from "@/components/hospital-settings"
import { Toaster } from "@/components/ui/toaster"
import { ExactFormPreview } from "@/components/exact-form-preview"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { saveCustomTemplate } from "@/lib/template-storage"
import type { FormField, FormLayout } from "@/types/form"

export function FormBuilder() {
  const [activeTab, setActiveTab] = useState("generate")
  const [formTitle, setFormTitle] = useState("New Form")
  const [formFields, setFormFields] = useState<FormField[]>([])
  const [formLayout, setFormLayout] = useState<FormLayout | undefined>(undefined)
  const [originalImageUrl, setOriginalImageUrl] = useState<string | undefined>(undefined)
  const [hospitalSettings, setHospitalSettings] = useState({
    name: "Dr. Martin Jameson",
    qualification: "QUALIFICATION",
    logoUrl:
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-04-09%20110801-h7B8bd8YiRf0RULJ7MhfPaLyoQ8O4F.png", // Using the provided logo URL
    headerStyle: "modern" as const,
    primaryColor: "#0ea5e9",
  })
  const [pageImages, setPageImages] = useState<string[] | undefined>(undefined)
  const [isSaveTemplateDialogOpen, setIsSaveTemplateDialogOpen] = useState(false)
  const [templateInfo, setTemplateInfo] = useState({
    title: "",
    category: "Assessment",
    description: "",
  })

  const handleFormGenerated = (title: string, fields: FormField[]) => {
    setFormTitle(title)
    setFormFields(fields)
    setActiveTab("edit")
  }

  const handleTemplateSelected = (title: string, fields: FormField[]) => {
    setFormTitle(title)
    setFormFields(fields)
    setActiveTab("edit")
  }

  const handleJsonUpdate = (title: string, fields: FormField[]) => {
    setFormTitle(title)
    setFormFields(fields)
  }

  const handleHospitalSettingsChange = (settings: {
    name: string
    qualification: string
    logoUrl: string
    headerStyle: "standard" | "modern" | "classic"
    primaryColor: string
  }) => {
    setHospitalSettings(settings)
  }

  const handleFormExtracted = (
    title: string,
    fields: FormField[],
    layout?: FormLayout,
    imageUrl?: string,
    images?: string[],
  ) => {
    setFormTitle(title)
    setFormFields(fields)
    setFormLayout(layout)
    setOriginalImageUrl(imageUrl)
    setPageImages(images)

    if (layout) {
      setActiveTab("exact-preview")
    } else {
      setActiveTab("edit")
    }
  }

  // Handle saving the current form as a template
  const handleSaveAsTemplate = () => {
    // Validate form
    if (!templateInfo.title.trim()) {
      toast({
        title: "Error",
        description: "Template title is required",
        variant: "destructive",
      })
      return
    }

    if (formFields.length === 0) {
      toast({
        title: "Error",
        description: "Cannot save an empty form as a template",
        variant: "destructive",
      })
      return
    }

    // Save the template
    saveCustomTemplate({
      title: templateInfo.title,
      category: templateInfo.category,
      description: templateInfo.description,
      fields: formFields,
    })

    // Reset the form
    setTemplateInfo({
      title: "",
      category: "Assessment",
      description: "",
    })

    // Close the dialog
    setIsSaveTemplateDialogOpen(false)

    // Show success message
    toast({
      title: "Success",
      description: "Template saved successfully",
    })
  }

  // Initialize the save template dialog with the current form title
  const openSaveTemplateDialog = () => {
    setTemplateInfo({
      title: formTitle,
      category: "Assessment",
      description: `Template created from ${formTitle}`,
    })
    setIsSaveTemplateDialogOpen(true)
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Form Builder</h2>
          {(activeTab === "edit" || activeTab === "preview") && formFields.length > 0 && (
            <Button onClick={openSaveTemplateDialog}>
              <Save className="mr-2 h-4 w-4" />
              Save as Template
            </Button>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-8 w-full">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="document">Document</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="exact-preview" disabled={!formLayout}>
              Exact Preview
            </TabsTrigger>
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="p-6">
            <FormGenerator onFormGenerated={handleFormGenerated} />
          </TabsContent>

          <TabsContent value="document" className="p-6">
            <DocumentParser onFormExtracted={handleFormExtracted} />
          </TabsContent>

          <TabsContent value="templates" className="p-6">
            <TemplateGallery onTemplateSelected={handleTemplateSelected} />
          </TabsContent>

          <TabsContent value="edit" className="p-6">
            <FormEditorSimple
              formTitle={formTitle}
              formFields={formFields}
              onFormTitleChange={setFormTitle}
              onFormFieldsChange={setFormFields}
            />
          </TabsContent>

          <TabsContent value="preview" className="p-6">
            <FormSubmissionHandler formTitle={formTitle} formFields={formFields} hospitalSettings={hospitalSettings} />
          </TabsContent>

          <TabsContent value="exact-preview" className="p-6">
            <ExactFormPreview
              formTitle={formTitle}
              formFields={formFields}
              formLayout={formLayout}
              originalImageUrl={originalImageUrl}
              pageImages={pageImages}
            />
          </TabsContent>

          <TabsContent value="json" className="p-6">
            <JsonEditor formTitle={formTitle} formFields={formFields} onUpdate={handleJsonUpdate} />
          </TabsContent>

          <TabsContent value="settings" className="p-6">
            <HospitalSettings onSettingsChange={handleHospitalSettingsChange} settings={hospitalSettings} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Save Template Dialog */}
      <Dialog open={isSaveTemplateDialogOpen} onOpenChange={setIsSaveTemplateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-title" className="text-right">
                Title
              </Label>
              <Input
                id="template-title"
                value={templateInfo.title}
                onChange={(e) => setTemplateInfo((prev) => ({ ...prev, title: e.target.value }))}
                className="col-span-3"
                placeholder="Enter template title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-category" className="text-right">
                Category
              </Label>
              <Select
                value={templateInfo.category}
                onValueChange={(value) => setTemplateInfo((prev) => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Assessment">Assessment</SelectItem>
                  <SelectItem value="Treatment">Treatment</SelectItem>
                  <SelectItem value="Intake">Intake</SelectItem>
                  <SelectItem value="Legal & Compliance">Legal & Compliance</SelectItem>
                  <SelectItem value="Behavioral Therapy">Behavioral Therapy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="template-description"
                value={templateInfo.description}
                onChange={(e) => setTemplateInfo((prev) => ({ ...prev, description: e.target.value }))}
                className="col-span-3"
                placeholder="Enter template description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAsTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster />
    </>
  )
}

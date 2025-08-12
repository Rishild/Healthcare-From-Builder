"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Search, Plus, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import type { FormField } from "@/types/form"
import { getTemplates } from "@/lib/templates"
import { getCustomTemplates, saveCustomTemplate, deleteCustomTemplate } from "@/lib/template-storage"

interface TemplateGalleryProps {
  onTemplateSelected: (title: string, fields: FormField[]) => void
}

export function TemplateGallery({ onTemplateSelected }: TemplateGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [builtInTemplates, setBuiltInTemplates] = useState(getTemplates())
  const [customTemplates, setCustomTemplates] = useState<any[]>([])
  const [isNewTemplateDialogOpen, setIsNewTemplateDialogOpen] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    category: "Assessment",
    description: "",
  })
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Load custom templates on component mount
  useEffect(() => {
    setCustomTemplates(getCustomTemplates())
  }, [])

  // Filter templates based on search query and active tab
  const filteredTemplates = [...builtInTemplates, ...customTemplates].filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "custom") return matchesSearch && template.isCustom
    if (activeTab === "built-in") return matchesSearch && !template.isCustom

    return matchesSearch && template.category.toLowerCase() === activeTab.toLowerCase()
  })

  // Handle creating a new template
  const handleCreateTemplate = () => {
    // Validate form
    if (!newTemplate.title.trim()) {
      toast({
        title: "Error",
        description: "Template title is required",
        variant: "destructive",
      })
      return
    }

    // Create a new template with empty fields
    const template = saveCustomTemplate({
      title: newTemplate.title,
      category: newTemplate.category,
      description: newTemplate.description,
      fields: [],
    })

    // Update the custom templates list
    setCustomTemplates([...customTemplates, template])

    // Reset the form
    setNewTemplate({
      title: "",
      category: "Assessment",
      description: "",
    })

    // Close the dialog
    setIsNewTemplateDialogOpen(false)

    // Select the new template
    onTemplateSelected(template.title, template.fields)

    // Show success message
    toast({
      title: "Success",
      description: "Template created successfully",
    })
  }

  // Handle deleting a template
  const handleDeleteTemplate = () => {
    if (!selectedTemplate) return

    // Delete the template
    const success = deleteCustomTemplate(selectedTemplate.id)

    if (success) {
      // Update the custom templates list
      setCustomTemplates(customTemplates.filter((t) => t.id !== selectedTemplate.id))

      // Show success message
      toast({
        title: "Success",
        description: "Template deleted successfully",
      })
    } else {
      // Show error message
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      })
    }

    // Close the dialog
    setIsDeleteDialogOpen(false)
    setSelectedTemplate(null)
  }

  // Categories for filtering
  const categories = [
    { id: "all", name: "All Templates" },
    { id: "custom", name: "My Templates" },
    { id: "built-in", name: "Built-in" },
    { id: "Assessment", name: "Assessment" },
    { id: "Treatment", name: "Treatment" },
    { id: "Intake", name: "Intake" },
    { id: "Legal & Compliance", name: "Legal & Compliance" },
    { id: "Behavioral Therapy", name: "Behavioral Therapy" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Dialog open={isNewTemplateDialogOpen} onOpenChange={setIsNewTemplateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="template-title" className="text-right">
                  Title
                </Label>
                <Input
                  id="template-title"
                  value={newTemplate.title}
                  onChange={(e) => setNewTemplate((prev) => ({ ...prev, title: e.target.value }))}
                  className="col-span-3"
                  placeholder="Enter template title"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="template-category" className="text-right">
                  Category
                </Label>
                <Select
                  value={newTemplate.category}
                  onValueChange={(value) => setNewTemplate((prev) => ({ ...prev, category: value }))}
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
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate((prev) => ({ ...prev, description: e.target.value }))}
                  className="col-span-3"
                  placeholder="Enter template description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewTemplateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTemplate}>Create Template</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 flex flex-wrap">
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{template.title}</CardTitle>
                  <CardDescription>{template.category}</CardDescription>
                </div>
                {template.isCustom && (
                  <Badge variant="outline" className="ml-2">
                    Custom
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{template.description}</p>
              <div className="mt-2">
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  {template.fields.length} fields
                </span>
                {template.createdAt && (
                  <span className="text-xs text-muted-foreground ml-2">
                    Created: {new Date(template.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 pt-2 flex justify-between">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => onTemplateSelected(template.title, template.fields)}
              >
                Use Template
              </Button>

              {template.isCustom && (
                <div className="flex ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedTemplate(template)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No templates found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete the template "{selectedTemplate?.title}"? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

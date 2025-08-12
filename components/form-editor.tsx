"use client"

import type React from "react"

import { useState, useRef } from "react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, GripVertical, Plus, Sparkles, Upload, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { FormField, FormFieldType } from "@/types/form"
import { FieldTypeSelector } from "@/components/field-type-selector"
import { FieldProperties } from "@/components/field-properties"
import { suggestAdditionalFields } from "@/lib/ai-form-generator"
import { JsonTemplateHelper } from "@/components/json-template-helper"

interface FormEditorProps {
  formTitle: string
  formFields: FormField[]
  onFormTitleChange: (title: string) => void
  onFormFieldsChange: (fields: FormField[]) => void
}

export function FormEditor({ formTitle, formFields, onFormTitleChange, onFormFieldsChange }: FormEditorProps) {
  const [isSuggesting, setIsSuggesting] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = formFields.findIndex((field) => field.id === active.id)
      const newIndex = formFields.findIndex((field) => field.id === over.id)

      const newFields = [...formFields]
      const [removed] = newFields.splice(oldIndex, 1)
      newFields.splice(newIndex, 0, removed)

      onFormFieldsChange(newFields)
    }
  }

  const addField = () => {
    const newField: FormField = {
      id: `field-${Date.now()}`,
      type: "text",
      label: "New Field",
      placeholder: "Enter text",
      required: false,
      options: [],
      conditionalLogic: null,
    }

    onFormFieldsChange([...formFields, newField])
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    const newFields = formFields.map((field) => (field.id === id ? { ...field, ...updates } : field))
    onFormFieldsChange(newFields)
  }

  const removeField = (id: string) => {
    onFormFieldsChange(formFields.filter((field) => field.id !== id))
  }

  const handleSuggestFields = async () => {
    setIsSuggesting(true)

    try {
      const suggestedFields = await suggestAdditionalFields(formTitle, formFields)
      onFormFieldsChange([...formFields, ...suggestedFields])
    } catch (error: any) {
      console.error("Failed to suggest fields:", error)
    } finally {
      setIsSuggesting(false)
    }
  }

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const parsed = JSON.parse(content)

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

              onFormTitleChange(parsed.title)
              onFormFieldsChange(fieldsWithConditionalLogic)
            } else {
              console.error("Invalid field format in JSON")
              alert("Invalid JSON format: Some fields are missing required properties (id, type, or label)")
            }
          } else {
            console.error("JSON missing title or fields array")
            alert("Invalid JSON format: File must contain a title string and fields array")
          }
        } else {
          console.error("Invalid JSON object")
          alert("Invalid JSON format: File does not contain a valid JSON object")
        }
      } catch (error) {
        console.error("Error parsing JSON:", error)
        alert("Error parsing JSON file. Please ensure the file contains valid JSON.")
      }
    }

    reader.onerror = () => {
      console.error("Error reading file")
      alert("Error reading file. Please try again with a different file.")
    }

    reader.readAsText(file)

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <Alert variant="info" className="mb-4">
        <Info className="h-4 w-4" />
        <AlertDescription>
          Using pre-built field suggestions. Suggestions are based on your form title and existing fields.
        </AlertDescription>
      </Alert>

      <div className="flex items-center justify-between">
        <Input
          value={formTitle}
          onChange={(e) => onFormTitleChange(e.target.value)}
          className="text-xl font-bold h-12 text-primary"
        />
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json" className="hidden" />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="mr-2 h-4 w-4" />
            Import JSON
          </Button>
          <Button variant="outline" onClick={handleSuggestFields} disabled={isSuggesting}>
            {isSuggesting ? (
              <span className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                Suggesting...
              </span>
            ) : (
              <span className="flex items-center">
                <Sparkles className="mr-2 h-4 w-4" />
                Suggest Fields
              </span>
            )}
          </Button>
          <Button onClick={addField}>
            <Plus className="mr-2 h-4 w-4" />
            Add Field
          </Button>
        </div>
      </div>
      <div className="mt-2">
        <JsonTemplateHelper />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Fields</CardTitle>
        </CardHeader>
        <CardContent>
          {formFields.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No fields added yet. Click "Add Field" to start building your form.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              // Removed the modifiers prop that was using restrictToVerticalAxis
            >
              <SortableContext items={formFields.map((field) => field.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-4">
                  {formFields.map((field) => (
                    <SortableFieldItem
                      key={field.id}
                      field={field}
                      updateField={updateField}
                      removeField={removeField}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface SortableFieldItemProps {
  field: FormField
  updateField: (id: string, updates: Partial<FormField>) => void
  removeField: (id: string) => void
}

function SortableFieldItem({ field, updateField, removeField }: SortableFieldItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: field.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} className="bg-white border rounded-md p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div {...attributes} {...listeners} className="cursor-grab p-1 hover:bg-muted rounded">
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            value={field.label}
            onChange={(e) => updateField(field.id, { label: e.target.value })}
            className="font-medium"
          />
        </div>
        <div className="flex items-center gap-2">
          <FieldTypeSelector
            value={field.type}
            onChange={(type) => updateField(field.id, { type: type as FormFieldType })}
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeField(field.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <FieldProperties field={field} updateField={updateField} />
    </div>
  )
}

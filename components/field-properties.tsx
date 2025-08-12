"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, X } from "lucide-react"
import type { FormField } from "@/types/form"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ConditionalLogicEditor } from "@/components/conditional-logic-editor"

interface FieldPropertiesProps {
  field: FormField
  updateField: (id: string, updates: Partial<FormField>) => void
}

export function FieldProperties({ field, updateField }: FieldPropertiesProps) {
  const [newOption, setNewOption] = useState("")

  const addOption = () => {
    if (!newOption.trim()) return

    const updatedOptions = [...(field.options || []), newOption.trim()]
    updateField(field.id, { options: updatedOptions })
    setNewOption("")
  }

  const removeOption = (index: number) => {
    const updatedOptions = [...(field.options || [])]
    updatedOptions.splice(index, 1)
    updateField(field.id, { options: updatedOptions })
  }

  const needsOptions = ["select", "radio", "checkbox"].includes(field.type)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`placeholder-${field.id}`}>Placeholder</Label>
          <Input
            id={`placeholder-${field.id}`}
            value={field.placeholder || ""}
            onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
          />
        </div>

        <div className="flex items-center space-x-2 h-full pt-6">
          <Checkbox
            id={`required-${field.id}`}
            checked={field.required || false}
            onCheckedChange={(checked) => updateField(field.id, { required: checked === true })}
          />
          <Label htmlFor={`required-${field.id}`}>Required field</Label>
        </div>
      </div>

      {field.type === "textarea" && (
        <div>
          <Label htmlFor={`rows-${field.id}`}>Rows</Label>
          <Input
            id={`rows-${field.id}`}
            type="number"
            min="2"
            max="10"
            value={field.rows || 3}
            onChange={(e) => updateField(field.id, { rows: Number.parseInt(e.target.value) || 3 })}
          />
        </div>
      )}

      {needsOptions && (
        <div>
          <Label>Options</Label>
          <div className="space-y-2 mt-2">
            {(field.options || []).map((option, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input value={option} readOnly />
                <Button variant="ghost" size="icon" onClick={() => removeOption(index)} className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}

            <div className="flex items-center gap-2">
              <Input
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                placeholder="Add new option"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addOption()
                  }
                }}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={addOption}
                disabled={!newOption.trim()}
                className="h-10 w-10"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="conditional-logic">
          <AccordionTrigger>Conditional Logic</AccordionTrigger>
          <AccordionContent>
            <ConditionalLogicEditor
              field={field}
              allFields={[]} // This would need to be passed from the parent
              updateField={updateField}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

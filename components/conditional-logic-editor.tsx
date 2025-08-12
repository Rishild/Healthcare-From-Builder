"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { FormField, ConditionalLogic } from "@/types/form"

interface ConditionalLogicEditorProps {
  field: FormField
  allFields: FormField[]
  updateField: (id: string, updates: Partial<FormField>) => void
}

export function ConditionalLogicEditor({ field, allFields, updateField }: ConditionalLogicEditorProps) {
  const [enabled, setEnabled] = useState(!!field.conditionalLogic)

  const handleEnableChange = (checked: boolean) => {
    setEnabled(checked)
    if (!checked) {
      updateField(field.id, { conditionalLogic: null })
    } else {
      // Create default conditional logic
      updateField(field.id, {
        conditionalLogic: {
          fieldId: "",
          operator: "equals",
          value: "",
        },
      })
    }
  }

  const updateConditionalLogic = (updates: Partial<ConditionalLogic>) => {
    const currentLogic = field.conditionalLogic || {
      fieldId: "",
      operator: "equals",
      value: "",
    }

    updateField(field.id, {
      conditionalLogic: {
        ...currentLogic,
        ...updates,
      },
    })
  }

  // Filter out the current field from the available fields for conditions
  const availableFields = allFields.filter((f) => f.id !== field.id)

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Switch id="conditional-logic-switch" checked={enabled} onCheckedChange={handleEnableChange} />
        <Label htmlFor="conditional-logic-switch">Enable conditional logic</Label>
      </div>

      {enabled && (
        <div className="space-y-4 pl-6 border-l-2 border-muted mt-4">
          <p className="text-sm text-muted-foreground">Show this field only when:</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Select
              value={field.conditionalLogic?.fieldId || ""}
              onValueChange={(value) => updateConditionalLogic({ fieldId: value })}
              disabled={availableFields.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select field" />
              </SelectTrigger>
              <SelectContent>
                {availableFields.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={field.conditionalLogic?.operator || "equals"}
              onValueChange={(value) =>
                updateConditionalLogic({
                  operator: value as "equals" | "not_equals" | "contains" | "greater_than" | "less_than",
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="equals">Equals</SelectItem>
                <SelectItem value="not_equals">Not equals</SelectItem>
                <SelectItem value="contains">Contains</SelectItem>
                <SelectItem value="greater_than">Greater than</SelectItem>
                <SelectItem value="less_than">Less than</SelectItem>
              </SelectContent>
            </Select>

            <Input
              value={field.conditionalLogic?.value || ""}
              onChange={(e) => updateConditionalLogic({ value: e.target.value })}
              placeholder="Value"
            />
          </div>

          <div className="text-sm text-muted-foreground mt-2">
            <p>This field will only be shown when the condition above is met.</p>
          </div>
        </div>
      )}
    </div>
  )
}

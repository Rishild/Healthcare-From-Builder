"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FormFieldType } from "@/types/form"

interface FieldTypeSelectorProps {
  value: string
  onChange: (value: string) => void
}

export function FieldTypeSelector({ value, onChange }: FieldTypeSelectorProps) {
  const fieldTypes: { value: FormFieldType; label: string }[] = [
    { value: "text", label: "Text" },
    { value: "textarea", label: "Text Area" },
    { value: "number", label: "Number" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "date", label: "Date" },
    { value: "select", label: "Dropdown" },
    { value: "radio", label: "Radio Group" },
    { value: "checkbox", label: "Checkbox Group" },
    { value: "toggle", label: "Toggle" },
    { value: "signature", label: "Signature" },
    { value: "file", label: "File Upload" },
  ]

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[140px]">
        <SelectValue placeholder="Field Type" />
      </SelectTrigger>
      <SelectContent>
        {fieldTypes.map((type) => (
          <SelectItem key={type.value} value={type.value}>
            {type.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

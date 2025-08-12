export type FormFieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "phone"
  | "date"
  | "select"
  | "radio"
  | "checkbox"
  | "toggle"
  | "signature"
  | "file"

export interface ConditionalLogic {
  fieldId: string
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than"
  value: string
}

export interface FormFieldMetadata {
  position?: { x: number; y: number }
  size?: { width: number; height: number }
  page?: number // Page number where this field appears
  fontSize?: number
  fontFamily?: string
  alignment?: "left" | "center" | "right"
  borderStyle?: "underline" | "box" | "line" | "circle" | "square" | "none"
  optionPositions?: Array<{ x: number; y: number }> // For radio/checkbox options
  style?: Record<string, string>
}

export interface FormField {
  id: string
  type: FormFieldType
  label: string
  placeholder?: string
  required?: boolean
  options?: string[]
  rows?: number
  conditionalLogic: ConditionalLogic | null
  metadata?: FormFieldMetadata
}

export interface FormSchema {
  title: string
  fields: FormField[]
  layout?: FormLayout
  originalImageUrl?: string
}

export interface FormLayout {
  sections: FormSection[]
  pageSize: { width: number; height: number }
  orientation: "portrait" | "landscape"
  margins: { top: number; right: number; bottom: number; left: number }
  backgroundImage?: string
  pages?: number // Total number of pages
  currentPage?: number // Current page being viewed
}

export interface FormSection {
  id: string
  type: "header" | "content" | "footer"
  position: { x: number; y: number }
  size: { width: number; height: number }
  content?: string
  style?: Record<string, string>
}

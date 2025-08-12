import { Suspense } from "react"
import { FormBuilder } from "@/components/form-builder"
import { FormBuilderSkeleton } from "@/components/form-builder-skeleton"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-2">AI-Powered Form Builder</h1>
        <p className="text-muted-foreground text-center mb-8">
          Create, customize, and manage healthcare forms with AI assistance
        </p>

        <Suspense fallback={<FormBuilderSkeleton />}>
          <FormBuilder />
        </Suspense>
      </div>
    </main>
  )
}

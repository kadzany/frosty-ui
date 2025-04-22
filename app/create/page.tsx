import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { CreateWorkflowForm } from "@/components/create-workflow-form"
import { Button } from "@/components/ui/button"

export default function CreateWorkflowPage() {
  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Workflows
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Workflow</h1>
        <p className="text-muted-foreground mt-2">Define a new workflow to be executed and tracked</p>
      </div>

      <div className="max-w-2xl">
        <CreateWorkflowForm />
      </div>
    </div>
  )
}

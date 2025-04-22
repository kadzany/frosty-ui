'use client'

import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ExecutionDetails } from "@/components/execution-details"
import { Button } from "@/components/ui/button"
import { getExecution, getWorkflow } from "@/lib/data"

export default function ExecutionDetailPage({
  params,
}: {
  params: { id: string; executionId: string }
}) {
  const workflow = getWorkflow(params.id)
  const execution = getExecution(params.executionId)

  if (!workflow || !execution) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold">Execution not found</h1>
        <Button asChild variant="ghost" className="mt-4">
          <Link href={`/workflows/${params.id}`}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Workflow
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href={`/workflows/${params.id}`}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to {workflow.name}
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Execution Details</h1>
        <p className="text-muted-foreground mt-1">Started at {new Date(execution.startedAt).toLocaleString()}</p>
      </div>

      <ExecutionDetails execution={execution} />
    </div>
  )
}

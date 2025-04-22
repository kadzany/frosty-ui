'use client'

import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ExecutionHistory } from "@/components/execution-history"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkflowViewer } from "@/components/workflow-designer"
import { getWorkflow } from "@/lib/data"
import { RunWorkflowButton } from "@/components/run-workflow-button"

export default function WorkflowDetailPage({ params }: { params: { id: string } }) {
  const workflow = getWorkflow(params.id)

  if (!workflow) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold">Workflow not found</h1>
        <Button asChild variant="ghost" className="mt-4">
          <Link href="/">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Workflows
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Workflows
        </Link>
      </Button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{workflow.name}</h1>
          <p className="text-muted-foreground mt-1">{workflow.description}</p>
        </div>
        <RunWorkflowButton workflowId={params.id} />
      </div>

      <Tabs defaultValue="diagram" className="mb-6">
        <TabsList>
          <TabsTrigger value="diagram">Workflow Diagram</TabsTrigger>
          <TabsTrigger value="executions">Execution History</TabsTrigger>
        </TabsList>
        <TabsContent value="diagram">
          <div className="border rounded-md overflow-hidden">
            <div className="h-[500px] w-full">
              {workflow.bpmnXml ? (
                <WorkflowViewer xml={workflow.bpmnXml} />
              ) : (
                <div className="flex items-center justify-center h-full bg-muted/20">
                  <p className="text-muted-foreground">No workflow diagram available</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="executions">
          <h2 className="text-xl font-semibold mb-4">Execution History</h2>
          <ExecutionHistory workflowId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

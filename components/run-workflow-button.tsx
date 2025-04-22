"use client"

import { useState } from "react"
import { Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useWorkflowStore } from "@/lib/store"
import { generateExecution } from "@/lib/data"

export function RunWorkflowButton({ workflowId }: { workflowId: string }) {
  const [isRunning, setIsRunning] = useState(false)
  const { toast } = useToast()
  const { addExecution, updateExecution } = useWorkflowStore()

  const handleRunWorkflow = async () => {
    setIsRunning(true)

    // Create a new execution with "running" status
    const now = new Date()
    const executionId = `exec_${Date.now()}`

    // Create initial steps in "pending" state
    const initialSteps = [
      {
        id: `step_${Date.now()}_1`,
        executionId,
        name: "Initialize",
        type: "Processing",
        status: "pending" as const,
        startedAt: now.toISOString(),
      },
      {
        id: `step_${Date.now()}_2`,
        executionId,
        name: "Process Data",
        type: "Processing",
        status: "pending" as const,
        startedAt: now.toISOString(),
      },
    ]

    // Create and add the execution with running status
    const newExecution = {
      id: executionId,
      workflowId,
      status: "running" as const,
      startedAt: now.toISOString(),
      steps: initialSteps,
    }

    // Add to store
    addExecution(newExecution)

    toast({
      title: "Workflow Started",
      description: "The workflow execution has started",
    })

    // Simulate workflow execution (in a real app, this would be a real API call)
    setTimeout(() => {
      // Get a simulated completed execution
      const completedExecution = generateExecution(workflowId)

      // Update the execution with the completed data
      updateExecution(executionId, {
        status: completedExecution.status,
        completedAt: completedExecution.completedAt,
        steps: completedExecution.steps,
      })

      setIsRunning(false)

      toast({
        title: "Workflow Completed",
        description: `The workflow execution has ${completedExecution.status === "completed" ? "completed successfully" : "failed"}`,
        variant: completedExecution.status === "completed" ? "default" : "destructive",
      })
    }, 3000)
  }

  return (
    <Button onClick={handleRunWorkflow} disabled={isRunning}>
      <Play className="mr-2 h-4 w-4" />
      {isRunning ? "Running..." : "Run Workflow"}
    </Button>
  )
}

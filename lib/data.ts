import type { Workflow, Execution, Step } from "./types"
import { useWorkflowStore } from "./store"

// Get all workflows
export function getWorkflows(): Workflow[] {
  return useWorkflowStore.getState().workflows
}

// Get a specific workflow by ID
export function getWorkflow(id: string): Workflow | undefined {
  return useWorkflowStore.getState().workflows.find((w) => w.id === id)
}

// Get all executions
export function getExecutions(): Execution[] {
  return useWorkflowStore.getState().executions
}

// Get a specific execution by ID
export function getExecution(id: string): Execution | undefined {
  return useWorkflowStore.getState().executions.find((e) => e.id === id)
}

// Get executions for a specific workflow
export function getExecutionsForWorkflow(workflowId: string): Execution[] {
  return useWorkflowStore.getState().executions.filter((e) => e.workflowId === workflowId)
}

// Generate a random execution with steps
export function generateExecution(workflowId: string): Execution {
  const now = new Date()
  const startedAt = now.toISOString()

  // Random completion time (1-5 seconds later)
  const completionTime = new Date(now.getTime() + Math.floor(Math.random() * 5000) + 1000)
  const completedAt = completionTime.toISOString()

  // Random status (80% chance of success)
  const status = Math.random() > 0.2 ? "completed" : "failed"

  // Generate 2-5 steps
  const stepCount = Math.floor(Math.random() * 4) + 2
  const steps: Step[] = []

  for (let i = 0; i < stepCount; i++) {
    const stepStartTime = new Date(now.getTime() + i * 1000)
    const stepCompletionTime = new Date(stepStartTime.getTime() + Math.floor(Math.random() * 1000) + 500)

    // Last step fails if the execution failed
    const stepStatus = status === "failed" && i === stepCount - 1 ? "failed" : "completed"

    steps.push({
      id: `step_${Date.now()}_${i}`,
      executionId: `exec_${Date.now()}`,
      name: getRandomStepName(i),
      type: getRandomStepType(),
      status: stepStatus,
      startedAt: stepStartTime.toISOString(),
      completedAt: stepCompletionTime.toISOString(),
      output: stepStatus === "completed" ? { success: true, data: `Step ${i + 1} completed successfully` } : undefined,
      error: stepStatus === "failed" ? "Step execution failed: timeout exceeded" : undefined,
    })
  }

  return {
    id: `exec_${Date.now()}`,
    workflowId,
    status,
    startedAt,
    completedAt: status === "completed" ? completedAt : undefined,
    steps,
  }
}

// Helper functions for random data
function getRandomStepName(index: number): string {
  const stepNames = [
    "Initialize",
    "Fetch Data",
    "Process Records",
    "Transform Data",
    "Validate Results",
    "Send Notification",
    "Update Database",
    "Generate Report",
    "Cleanup Resources",
  ]

  if (index === 0) return "Initialize"
  if (index === 1) return "Fetch Data"

  return stepNames[Math.floor(Math.random() * stepNames.length)]
}

function getRandomStepType(): string {
  const types = ["HTTP", "Database", "Processing", "Notification", "Validation"]
  return types[Math.floor(Math.random() * types.length)]
}

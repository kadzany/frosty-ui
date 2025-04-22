export interface Workflow {
  id: string
  name: string
  description: string
  status: "active" | "inactive"
  createdAt: string
  executionCount: number
  lastRun: string | null
  bpmnXml?: string // Added BPMN XML field
}

export interface Execution {
  id: string
  workflowId: string
  status: "running" | "completed" | "failed"
  startedAt: string
  completedAt?: string
  steps: Step[]
}

export interface Step {
  id: string
  executionId: string
  name: string
  type: string
  status: "pending" | "running" | "completed" | "failed"
  startedAt: string
  completedAt?: string
  output?: any
  error?: string
}

"use client"

import Link from "next/link"
import { CheckCircle, Clock, ChevronRight, XCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useWorkflowStore } from "@/lib/store"

export function ExecutionHistory({ workflowId }: { workflowId: string }) {
  const { executions } = useWorkflowStore()
  const workflowExecutions = executions.filter((exec) => exec.workflowId === workflowId)

  if (workflowExecutions.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <h3 className="text-lg font-medium mb-2">No executions yet</h3>
        <p className="text-muted-foreground mb-4">Run this workflow to see execution history</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Execution ID</TableHead>
            <TableHead>Started At</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workflowExecutions.map((execution) => {
            const duration = execution.completedAt
              ? new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()
              : null

            const formatDuration = (ms: number) => {
              if (ms < 1000) return `${ms}ms`
              return `${(ms / 1000).toFixed(2)}s`
            }

            return (
              <TableRow key={execution.id}>
                <TableCell className="font-mono text-xs">{execution.id.substring(0, 10)}...</TableCell>
                <TableCell>{new Date(execution.startedAt).toLocaleString()}</TableCell>
                <TableCell>{duration ? formatDuration(duration) : "In progress..."}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      execution.status === "completed"
                        ? "success"
                        : execution.status === "failed"
                          ? "destructive"
                          : execution.status === "running"
                            ? "default"
                            : "secondary"
                    }
                  >
                    {execution.status === "completed" && <CheckCircle className="mr-1 h-3 w-3" />}
                    {execution.status === "failed" && <XCircle className="mr-1 h-3 w-3" />}
                    {execution.status === "running" && <Clock className="mr-1 h-3 w-3" />}
                    {execution.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/workflows/${workflowId}/executions/${execution.id}`}>
                      Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

"use client"
import Link from "next/link"
import { Calendar, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWorkflowStore } from "@/lib/store"

export function WorkflowList() {
  const { workflows } = useWorkflowStore()

  if (workflows.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-medium mb-2">No workflows found</h2>
        <p className="text-muted-foreground mb-6">Create your first workflow to get started</p>
        <Link
          href="/create"
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          Create Workflow
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {workflows.map((workflow) => (
        <Link key={workflow.id} href={`/workflows/${workflow.id}`}>
          <Card className="h-full transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle>{workflow.name}</CardTitle>
              <CardDescription>{workflow.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                Created {new Date(workflow.createdAt).toLocaleDateString()}
              </div>
              <div className="mt-2 flex items-center text-sm text-muted-foreground">
                <Clock className="mr-1 h-4 w-4" />
                Last run: {workflow.lastRun ? new Date(workflow.lastRun).toLocaleString() : "Never"}
              </div>
            </CardContent>
            <CardFooter>
              <Badge variant={workflow.status === "active" ? "default" : "secondary"}>
                {workflow.status === "active" ? "Active" : "Inactive"}
              </Badge>
              {workflow.executionCount > 0 && (
                <Badge variant="outline" className="ml-2">
                  {workflow.executionCount} executions
                </Badge>
              )}
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  )
}

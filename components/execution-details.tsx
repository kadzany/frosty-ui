"use client"
import { CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Execution, Step } from "@/lib/types"

export function ExecutionDetails({ execution }: { execution: Execution }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            {execution.status === "completed" && <CheckCircle className="mr-2 h-5 w-5 text-green-500" />}
            {execution.status === "failed" && <XCircle className="mr-2 h-5 w-5 text-red-500" />}
            {execution.status === "running" && <Clock className="mr-2 h-5 w-5 text-blue-500" />}
            Execution Summary
          </CardTitle>
          <CardDescription>ID: {execution.id}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <div className="flex justify-between py-1 border-b">
              <span className="font-medium">Status</span>
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
                {execution.status}
              </Badge>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="font-medium">Started At</span>
              <span>{new Date(execution.startedAt).toLocaleString()}</span>
            </div>
            {execution.completedAt && (
              <div className="flex justify-between py-1 border-b">
                <span className="font-medium">Completed At</span>
                <span>{new Date(execution.completedAt).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between py-1 border-b">
              <span className="font-medium">Duration</span>
              <span>
                {execution.completedAt
                  ? `${((new Date(execution.completedAt).getTime() - new Date(execution.startedAt).getTime()) / 1000).toFixed(2)}s`
                  : "In progress..."}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b">
              <span className="font-medium">Steps</span>
              <span>{execution.steps.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Workflow Steps</h2>
        <StepsList steps={execution.steps} />
      </div>
    </div>
  )
}

function StepsList({ steps }: { steps: Step[] }) {
  return (
    <Accordion type="single" collapsible className="w-full">
      {steps.map((step, index) => (
        <AccordionItem key={step.id} value={step.id}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center">
              {step.status === "completed" && <CheckCircle className="mr-2 h-4 w-4 text-green-500" />}
              {step.status === "failed" && <XCircle className="mr-2 h-4 w-4 text-red-500" />}
              {step.status === "running" && <Clock className="mr-2 h-4 w-4 text-blue-500" />}
              {step.status === "pending" && <AlertCircle className="mr-2 h-4 w-4 text-gray-400" />}
              <span className="font-medium">
                Step {index + 1}: {step.name}
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="pl-6 border-l-2 border-muted-foreground/20 ml-2 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div className="text-sm text-muted-foreground">Status</div>
                <div>
                  <Badge
                    variant={
                      step.status === "completed"
                        ? "success"
                        : step.status === "failed"
                          ? "destructive"
                          : step.status === "running"
                            ? "default"
                            : "secondary"
                    }
                  >
                    {step.status}
                  </Badge>
                </div>

                <div className="text-sm text-muted-foreground">Started At</div>
                <div>{new Date(step.startedAt).toLocaleString()}</div>

                {step.completedAt && (
                  <>
                    <div className="text-sm text-muted-foreground">Completed At</div>
                    <div>{new Date(step.completedAt).toLocaleString()}</div>

                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div>
                      {((new Date(step.completedAt).getTime() - new Date(step.startedAt).getTime()) / 1000).toFixed(2)}s
                    </div>
                  </>
                )}

                <div className="text-sm text-muted-foreground">Type</div>
                <div>{step.type}</div>

                {step.error && (
                  <>
                    <div className="text-sm text-muted-foreground">Error</div>
                    <div className="text-red-500">{step.error}</div>
                  </>
                )}
              </div>

              {step.output && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-1">Output</div>
                  <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
                    {typeof step.output === "object" ? JSON.stringify(step.output, null, 2) : step.output}
                  </pre>
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

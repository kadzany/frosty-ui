"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useWorkflowStore } from "@/lib/store"
import {
  WorkflowDesigner,
  type WorkflowModel,
  DEFAULT_WORKFLOW,
  workflowToXml,
  xmlToWorkflow,
} from "@/components/workflow-designer"

// Default workflow XML
const DEFAULT_WORKFLOW_XML = workflowToXml(DEFAULT_WORKFLOW)

export function CreateWorkflowForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { addWorkflow } = useWorkflowStore()

  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [workflowXml, setWorkflowXml] = useState<string>(DEFAULT_WORKFLOW_XML)
  const [workflowModel, setWorkflowModel] = useState<WorkflowModel>(DEFAULT_WORKFLOW)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("designer")

  // Handle workflow model changes from the designer
  const handleWorkflowChange = useCallback(
    (newWorkflow: WorkflowModel) => {
      setWorkflowModel(newWorkflow)
      // Only update XML if we're not in the XML tab to avoid circular updates
      if (activeTab === "designer") {
        const newXml = workflowToXml(newWorkflow)
        setWorkflowXml(newXml)
      }
    },
    [activeTab],
  )

  // Handle XML changes from the textarea
  const handleXmlChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newXml = e.target.value
      setWorkflowXml(newXml)
      // Only update workflow model if we're in the XML tab to avoid circular updates
      if (activeTab === "xml") {
        try {
          const newWorkflow = xmlToWorkflow(newXml)
          setWorkflowModel(newWorkflow)
        } catch (error) {
          console.error("Error parsing XML:", error)
        }
      }
    },
    [activeTab],
  )

  // Handle tab change
  const handleTabChange = useCallback(
    (value: string) => {
      setActiveTab(value)

      // Sync states when switching tabs
      if (value === "designer") {
        // When switching to designer, parse the current XML
        try {
          const newWorkflow = xmlToWorkflow(workflowXml)
          setWorkflowModel(newWorkflow)
        } catch (error) {
          console.error("Error parsing XML when switching to designer:", error)
        }
      } else if (value === "xml") {
        // When switching to XML, generate XML from the current workflow
        const newXml = workflowToXml(workflowModel)
        setWorkflowXml(newXml)
      }
    },
    [workflowXml, workflowModel],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Workflow name is required",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    // Create a new workflow
    const newWorkflow = {
      id: Date.now().toString(),
      name,
      description,
      status: "active",
      createdAt: new Date().toISOString(),
      executionCount: 0,
      lastRun: null,
      bpmnXml: workflowXml, // We're still using the bpmnXml field for compatibility
    }

    // Add to store
    addWorkflow(newWorkflow)

    // Show success message
    toast({
      title: "Workflow Created",
      description: "Your new workflow has been created successfully",
    })

    // Redirect to workflow list
    router.push("/")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Workflow Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter workflow name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this workflow does"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Workflow Design</Label>
        <div className="border rounded-md overflow-hidden">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="bg-muted w-full justify-start rounded-none border-b">
              <TabsTrigger value="designer">Workflow Designer</TabsTrigger>
              <TabsTrigger value="xml">XML</TabsTrigger>
            </TabsList>
            <TabsContent value="designer" className="p-0">
              <div className="h-[500px] w-full">
                <WorkflowDesigner workflow={workflowModel} onChange={handleWorkflowChange} />
              </div>
            </TabsContent>
            <TabsContent value="xml" className="p-0">
              <Textarea
                value={workflowXml}
                onChange={handleXmlChange}
                className="font-mono text-xs h-[500px] rounded-none"
                placeholder="Workflow XML will appear here as you design your workflow"
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Workflow"}
        </Button>
      </div>
    </form>
  )
}

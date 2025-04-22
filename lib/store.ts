"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Workflow, Execution } from "./types"

interface WorkflowState {
  workflows: Workflow[]
  executions: Execution[]
  addWorkflow: (workflow: Workflow) => void
  updateWorkflow: (id: string, workflow: Partial<Workflow>) => void
  deleteWorkflow: (id: string) => void
  addExecution: (execution: Execution) => void
  updateExecution: (id: string, execution: Partial<Execution>) => void
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set) => ({
      workflows: [
        {
          id: "wf_1",
          name: "Daily Data Sync",
          description: "Synchronizes data from external API to database every day",
          status: "active",
          createdAt: "2023-04-15T08:00:00Z",
          executionCount: 45,
          lastRun: "2023-04-19T08:00:00Z",
          bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Activity_1" name="Fetch Data">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Activity_2" name="Process Data">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Activity_3" name="Update Database">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="End">
      <bpmn:incoming>Flow_4</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Activity_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Activity_1" targetRef="Activity_2" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Activity_2" targetRef="Activity_3" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Activity_3" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="155" y="145" width="30" height="14" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1_di" bpmnElement="Activity_1">
        <dc:Bounds x="240" y="80" width="100" height="80" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_2_di" bpmnElement="Activity_2">
        <dc:Bounds x="390" y="80" width="100" height="80" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_3_di" bpmnElement="Activity_3">
        <dc:Bounds x="540" y="80" width="100" height="80" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="692" y="102" width="36" height="36" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="700" y="145" width="20" height="14" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
        <di:waypoint x="240" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="340" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
        <di:waypoint x="390" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="490" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
        <di:waypoint x="540" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <di:waypoint x="640" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
        <di:waypoint x="692" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`,
        },
        {
          id: "wf_2",
          name: "User Report Generator",
          description: "Generates weekly user activity reports",
          status: "active",
          createdAt: "2023-03-10T10:30:00Z",
          executionCount: 12,
          lastRun: "2023-04-17T10:30:00Z",
          bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Activity_1" name="Collect Data">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Activity_2" name="Generate Report">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Activity_3" name="Send Email">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="End">
      <bpmn:incoming>Flow_4</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Activity_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Activity_1" targetRef="Activity_2" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Activity_2" targetRef="Activity_3" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Activity_3" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="155" y="145" width="30" height="14" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1_di" bpmnElement="Activity_1">
        <dc:Bounds x="240" y="80" width="100" height="80" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_2_di" bpmnElement="Activity_2">
        <dc:Bounds x="390" y="80" width="100" height="80" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_3_di" bpmnElement="Activity_3">
        <dc:Bounds x="540" y="80" width="100" height="80" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="692" y="102" width="36" height="36" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="700" y="145" width="20" height="14" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
        <di:waypoint x="240" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="340" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
        <di:waypoint x="390" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="490" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
        <di:waypoint x="540" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <di:waypoint x="640" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
        <di:waypoint x="692" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`,
        },
        {
          id: "wf_3",
          name: "Backup Process",
          description: "Creates database backups and uploads to cloud storage",
          status: "inactive",
          createdAt: "2023-02-20T14:15:00Z",
          executionCount: 8,
          lastRun: "2023-03-15T14:15:00Z",
          bpmnXml: `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Activity_1" name="Create Backup">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Activity_2" name="Compress Files">
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Activity_3" name="Upload to Cloud">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="End">
      <bpmn:incoming>Flow_4</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Activity_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Activity_1" targetRef="Activity_2" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Activity_2" targetRef="Activity_3" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Activity_3" targetRef="EndEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="155" y="145" width="30" height="14" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1_di" bpmnElement="Activity_1">
        <dc:Bounds x="240" y="80" width="100" height="80" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_2_di" bpmnElement="Activity_2">
        <dc:Bounds x="390" y="80" width="100" height="80" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_3_di" bpmnElement="Activity_3">
        <dc:Bounds x="540" y="80" width="100" height="80" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="692" y="102" width="36" height="36" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="700" y="145" width="20" height="14" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
        <di:waypoint x="240" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="340" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
        <di:waypoint x="390" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="490" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
        <di:waypoint x="540" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <di:waypoint x="640" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
        <di:waypoint x="692" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`,
        },
      ],
      executions: [
        {
          id: "exec_1",
          workflowId: "wf_1",
          status: "completed",
          startedAt: "2023-04-19T08:00:00Z",
          completedAt: "2023-04-19T08:01:30Z",
          steps: [
            {
              id: "step_1_1",
              executionId: "exec_1",
              name: "Initialize",
              type: "Processing",
              status: "completed",
              startedAt: "2023-04-19T08:00:00Z",
              completedAt: "2023-04-19T08:00:05Z",
              output: { message: "Initialization successful" },
            },
            {
              id: "step_1_2",
              executionId: "exec_1",
              name: "Fetch Data",
              type: "HTTP",
              status: "completed",
              startedAt: "2023-04-19T08:00:05Z",
              completedAt: "2023-04-19T08:00:45Z",
              output: { recordsCount: 1250 },
            },
            {
              id: "step_1_3",
              executionId: "exec_1",
              name: "Process Records",
              type: "Processing",
              status: "completed",
              startedAt: "2023-04-19T08:00:45Z",
              completedAt: "2023-04-19T08:01:15Z",
              output: { processedRecords: 1250, errors: 0 },
            },
            {
              id: "step_1_4",
              executionId: "exec_1",
              name: "Update Database",
              type: "Database",
              status: "completed",
              startedAt: "2023-04-19T08:01:15Z",
              completedAt: "2023-04-19T08:01:30Z",
              output: { updatedRecords: 1250 },
            },
          ],
        },
        {
          id: "exec_2",
          workflowId: "wf_1",
          status: "failed",
          startedAt: "2023-04-18T08:00:00Z",
          completedAt: "2023-04-18T08:00:50Z",
          steps: [
            {
              id: "step_2_1",
              executionId: "exec_2",
              name: "Initialize",
              type: "Processing",
              status: "completed",
              startedAt: "2023-04-18T08:00:00Z",
              completedAt: "2023-04-18T08:00:05Z",
              output: { message: "Initialization successful" },
            },
            {
              id: "step_2_2",
              executionId: "exec_2",
              name: "Fetch Data",
              type: "HTTP",
              status: "failed",
              startedAt: "2023-04-18T08:00:05Z",
              completedAt: "2023-04-18T08:00:50Z",
              error: "API connection timeout after 45 seconds",
            },
          ],
        },
        {
          id: "exec_3",
          workflowId: "wf_2",
          status: "completed",
          startedAt: "2023-04-17T10:30:00Z",
          completedAt: "2023-04-17T10:32:15Z",
          steps: [
            {
              id: "step_3_1",
              executionId: "exec_3",
              name: "Initialize",
              type: "Processing",
              status: "completed",
              startedAt: "2023-04-17T10:30:00Z",
              completedAt: "2023-04-17T10:30:05Z",
              output: { message: "Initialization successful" },
            },
            {
              id: "step_3_2",
              executionId: "exec_3",
              name: "Generate Report",
              type: "Processing",
              status: "completed",
              startedAt: "2023-04-17T10:30:05Z",
              completedAt: "2023-04-17T10:31:45Z",
              output: { reportGenerated: true, pages: 15 },
            },
            {
              id: "step_3_3",
              executionId: "exec_3",
              name: "Send Notification",
              type: "Notification",
              status: "completed",
              startedAt: "2023-04-17T10:31:45Z",
              completedAt: "2023-04-17T10:32:15Z",
              output: { emailsSent: 5, smsDelivered: 2 },
            },
          ],
        },
      ],
      addWorkflow: (workflow) =>
        set((state) => ({
          workflows: [...state.workflows, workflow],
        })),
      updateWorkflow: (id, updatedWorkflow) =>
        set((state) => ({
          workflows: state.workflows.map((workflow) =>
            workflow.id === id ? { ...workflow, ...updatedWorkflow } : workflow,
          ),
        })),
      deleteWorkflow: (id) =>
        set((state) => ({
          workflows: state.workflows.filter((workflow) => workflow.id !== id),
          executions: state.executions.filter((execution) => execution.workflowId !== id),
        })),
      addExecution: (execution) =>
        set((state) => {
          // Update the workflow's execution count and last run time
          const updatedWorkflows = state.workflows.map((workflow) => {
            if (workflow.id === execution.workflowId) {
              return {
                ...workflow,
                executionCount: workflow.executionCount + 1,
                lastRun: execution.startedAt,
              }
            }
            return workflow
          })

          return {
            workflows: updatedWorkflows,
            executions: [...state.executions, execution],
          }
        }),
      updateExecution: (id, updatedExecution) =>
        set((state) => ({
          executions: state.executions.map((execution) =>
            execution.id === id ? { ...execution, ...updatedExecution } : execution,
          ),
        })),
    }),
    {
      name: "workflow-storage",
    },
  ),
)

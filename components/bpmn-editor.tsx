"use client"

import { useEffect, useRef, useState } from "react"

// Default BPMN template
const DEFAULT_BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Start">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:task id="Activity_1" name="Task 1">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="EndEvent_1" name="End">
      <bpmn:incoming>Flow_2</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_1" targetRef="Activity_1" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Activity_1" targetRef="EndEvent_1" />
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
      <bpmndi:BPMNShape id="EndEvent_1_di" bpmnElement="EndEvent_1">
        <dc:Bounds x="392" y="102" width="36" height="36" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="400" y="145" width="20" height="14" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="188" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
        <di:waypoint x="240" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="340" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
        <di:waypoint x="392" y="120" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`

interface BpmnEditorProps {
  initialXml?: string
  onChange?: (xml: string) => void
  readOnly?: boolean
}

// Fallback to a simpler implementation using an iframe with the BPMN.io demo editor
export function BpmnEditor({ initialXml = DEFAULT_BPMN, onChange, readOnly = false }: BpmnEditorProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle messages from the iframe
  useEffect(() => {
    if (!onChange) return

    const handleMessage = (event: MessageEvent) => {
      // Only accept messages from our iframe
      if (iframeRef.current && event.source === iframeRef.current.contentWindow) {
        if (event.data && event.data.type === "bpmn-xml") {
          onChange(event.data.xml)
        }
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [onChange])

  // Send the initial XML to the iframe once it's loaded
  useEffect(() => {
    if (iframeLoaded && iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        {
          type: "init-bpmn",
          xml: initialXml,
          readOnly,
        },
        "*",
      )
    }
  }, [iframeLoaded, initialXml, readOnly])

  return (
    <div className="relative h-full w-full">
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 p-4 text-red-600">
          <p>{error}</p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src="/bpmn-editor.html"
        className="h-full w-full border-0"
        onLoad={() => setIframeLoaded(true)}
        onError={() => setError("Failed to load BPMN editor")}
      />
    </div>
  )
}

// Viewer component reuses the same component with readOnly=true
export function BpmnViewer({ xml }: { xml: string }) {
  return <BpmnEditor initialXml={xml} readOnly={true} />
}

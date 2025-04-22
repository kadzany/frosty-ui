"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { PlusCircle, X, ArrowRight, MoveIcon, ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Types for our workflow model
export interface WorkflowNode {
  id: string
  type: "start" | "task" | "decision" | "end"
  label: string
  position: { x: number; y: number }
  nextNodeIds: string[]
}

export interface WorkflowModel {
  nodes: WorkflowNode[]
}

// Convert workflow model to XML-like format for storage
export function workflowToXml(workflow: WorkflowModel): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<workflow>\n`

  // Add nodes
  workflow.nodes.forEach((node) => {
    xml += `  <node id="${node.id}" type="${node.type}" label="${node.label}" x="${node.position.x}" y="${node.position.y}">\n`
    // Add connections
    node.nextNodeIds.forEach((nextId) => {
      xml += `    <connection to="${nextId}" />\n`
    })
    xml += `  </node>\n`
  })

  xml += `</workflow>`
  return xml
}

// Parse XML back to workflow model
export function xmlToWorkflow(xml: string): WorkflowModel {
  // Simple parsing for our custom XML format
  // In a real app, you'd use a proper XML parser
  const nodes: WorkflowNode[] = []

  try {
    // Extract node elements
    const nodeRegex = /<node id="([^"]+)" type="([^"]+)" label="([^"]+)" x="([^"]+)" y="([^"]+)">([\s\S]*?)<\/node>/g
    let nodeMatch

    while ((nodeMatch = nodeRegex.exec(xml)) !== null) {
      const [_, id, type, label, x, y, connections] = nodeMatch

      // Extract connections
      const nextNodeIds: string[] = []
      const connectionRegex = /<connection to="([^"]+)" \/>/g
      let connectionMatch

      while ((connectionMatch = connectionRegex.exec(connections)) !== null) {
        nextNodeIds.push(connectionMatch[1])
      }

      nodes.push({
        id,
        type: type as "start" | "task" | "decision" | "end",
        label,
        position: { x: Number.parseFloat(x), y: Number.parseFloat(y) },
        nextNodeIds,
      })
    }

    return { nodes }
  } catch (error) {
    console.error("Error parsing workflow XML:", error)
    return { nodes: [] }
  }
}

// Default workflow with start and end nodes
export const DEFAULT_WORKFLOW: WorkflowModel = {
  nodes: [
    {
      id: "start",
      type: "start",
      label: "Start",
      position: { x: 100, y: 100 },
      nextNodeIds: [],
    },
    {
      id: "end",
      type: "end",
      label: "End",
      position: { x: 500, y: 100 },
      nextNodeIds: [],
    },
  ],
}

interface WorkflowDesignerProps {
  workflow: WorkflowModel
  onChange: (workflow: WorkflowModel) => void
  readOnly?: boolean
}

export function WorkflowDesigner({ workflow, onChange, readOnly = false }: WorkflowDesignerProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [connecting, setConnecting] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [autoScrolling, setAutoScrolling] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [zoomPoint, setZoomPoint] = useState({ x: 0, y: 0 })

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const scrollAnimationRef = useRef<number | null>(null)
  const lastMousePosRef = useRef({ x: 0, y: 0 })

  // Auto-scroll settings
  const SCROLL_EDGE_SIZE = 50 // Size of the edge area that triggers scrolling
  const SCROLL_SPEED = 10 // Base scroll speed in pixels per frame
  const GRID_SIZE = 20 // Size of grid cells in pixels
  const MIN_ZOOM = 0.3 // Minimum zoom level
  const MAX_ZOOM = 3 // Maximum zoom level
  const ZOOM_STEP = 0.067 // Zoom increment/decrement step (reduced by ~33%)

  // Clean up any animation frame on unmount
  useEffect(() => {
    return () => {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current)
      }
    }
  }, [])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard shortcuts if the container is focused
      if (!containerRef.current?.contains(document.activeElement)) return

      // Prevent default browser behavior for these shortcuts
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "-" || e.key === "0")) {
        e.preventDefault()
      }

      // Zoom in: Ctrl/Cmd + Plus
      if ((e.ctrlKey || e.metaKey) && (e.key === "+" || e.key === "=")) {
        handleZoomIn()
      }
      // Zoom out: Ctrl/Cmd + Minus
      else if ((e.ctrlKey || e.metaKey) && e.key === "-") {
        handleZoomOut()
      }
      // Reset zoom: Ctrl/Cmd + 0
      else if ((e.ctrlKey || e.metaKey) && e.key === "0") {
        handleResetZoom()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  // Handle auto-scrolling
  useEffect(() => {
    if (!autoScrolling || !draggingNodeId) {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current)
        scrollAnimationRef.current = null
      }
      return
    }

    const handleAutoScroll = () => {
      const container = containerRef.current
      if (!container) return

      const rect = container.getBoundingClientRect()
      const mouseX = lastMousePosRef.current.x
      const mouseY = lastMousePosRef.current.y

      let scrollX = 0
      let scrollY = 0

      // Calculate scroll amounts based on mouse position
      if (mouseX < rect.left + SCROLL_EDGE_SIZE) {
        scrollX = -SCROLL_SPEED * (1 - (mouseX - rect.left) / SCROLL_EDGE_SIZE)
      } else if (mouseX > rect.right - SCROLL_EDGE_SIZE) {
        scrollX = SCROLL_SPEED * (1 - (rect.right - mouseX) / SCROLL_EDGE_SIZE)
      }

      if (mouseY < rect.top + SCROLL_EDGE_SIZE) {
        scrollY = -SCROLL_SPEED * (1 - (mouseY - rect.top) / SCROLL_EDGE_SIZE)
      } else if (mouseY > rect.bottom - SCROLL_EDGE_SIZE) {
        scrollY = SCROLL_SPEED * (1 - (rect.bottom - mouseY) / SCROLL_EDGE_SIZE)
      }

      // Apply scrolling
      if (scrollX !== 0 || scrollY !== 0) {
        container.scrollLeft += scrollX
        container.scrollTop += scrollY

        // Update node position to follow the scroll
        if (draggingNodeId) {
          const node = workflow.nodes.find((n) => n.id === draggingNodeId)
          if (node) {
            const updatedWorkflow = {
              ...workflow,
              nodes: workflow.nodes.map((n) =>
                n.id === draggingNodeId
                  ? {
                      ...n,
                      position: {
                        x: n.position.x + scrollX / zoom,
                        y: n.position.y + scrollY / zoom,
                      },
                    }
                  : n,
              ),
            }
            onChange(updatedWorkflow)
          }
        }

        // Continue animation
        scrollAnimationRef.current = requestAnimationFrame(handleAutoScroll)
      } else {
        // Stop animation if no scrolling needed
        setAutoScrolling(false)
      }
    }

    scrollAnimationRef.current = requestAnimationFrame(handleAutoScroll)

    return () => {
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current)
      }
    }
  }, [autoScrolling, draggingNodeId, workflow, onChange, zoom])

  // Handle zoom in
  const handleZoomIn = useCallback(() => {
    setZoom((prevZoom) => Math.min(prevZoom + ZOOM_STEP, MAX_ZOOM))
  }, [ZOOM_STEP, MAX_ZOOM])

  // Handle zoom out
  const handleZoomOut = useCallback(() => {
    setZoom((prevZoom) => Math.max(prevZoom - ZOOM_STEP, MIN_ZOOM))
  }, [ZOOM_STEP, MIN_ZOOM])

  // Handle reset zoom
  const handleResetZoom = useCallback(() => {
    setZoom(1)
  }, [])

  // Handle mouse wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // Only zoom if Ctrl/Cmd key is pressed
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()

        const container = containerRef.current
        if (!container) return

        // Calculate the point to zoom around (mouse position)
        const rect = container.getBoundingClientRect()
        const x = e.clientX - rect.left + container.scrollLeft
        const y = e.clientY - rect.top + container.scrollTop
        setZoomPoint({ x, y })

        // Determine zoom direction
        if (e.deltaY < 0) {
          // Zoom in
          setZoom((prevZoom) => Math.min(prevZoom + ZOOM_STEP, MAX_ZOOM))
        } else {
          // Zoom out
          setZoom((prevZoom) => Math.max(prevZoom - ZOOM_STEP, MIN_ZOOM))
        }
      }
    },
    [ZOOM_STEP, MIN_ZOOM, MAX_ZOOM],
  )

  // Adjust scroll position after zoom to keep the mouse point fixed
  useEffect(() => {
    const container = containerRef.current
    if (!container || (zoomPoint.x === 0 && zoomPoint.y === 0)) return

    // This is a simplified approach - for perfect zooming around a point,
    // more complex calculations would be needed
    const scrollX = zoomPoint.x * zoom - container.clientWidth / 2
    const scrollY = zoomPoint.y * zoom - container.clientHeight / 2

    container.scrollLeft = scrollX
    container.scrollTop = scrollY
  }, [zoom, zoomPoint])

  // Handle node selection
  const handleNodeClick = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      // If we're in connecting mode, don't change selection
      if (!connecting) {
        setSelectedNodeId(nodeId)
      }
    },
    [connecting],
  )

  // Handle background click to deselect
  const handleBackgroundClick = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  // Start dragging a node
  const handleDragStart = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (readOnly) return

      const node = workflow.nodes.find((n) => n.id === nodeId)
      if (!node) return

      setDraggingNodeId(nodeId)

      // Calculate offset from mouse position to node position
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })

      // Store initial mouse position for auto-scrolling
      lastMousePosRef.current = { x: e.clientX, y: e.clientY }

      // Prevent default drag behavior
      e.preventDefault()
    },
    [readOnly, workflow.nodes],
  )

  // Handle mouse move for dragging
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingNodeId || readOnly) return

      const container = containerRef.current
      if (!container) return

      // Store current mouse position for auto-scrolling
      lastMousePosRef.current = { x: e.clientX, y: e.clientY }

      // Check if we need to start auto-scrolling
      const rect = container.getBoundingClientRect()
      const nearLeftEdge = e.clientX < rect.left + SCROLL_EDGE_SIZE
      const nearRightEdge = e.clientX > rect.right - SCROLL_EDGE_SIZE
      const nearTopEdge = e.clientY < rect.top + SCROLL_EDGE_SIZE
      const nearBottomEdge = e.clientY > rect.bottom - SCROLL_EDGE_SIZE

      if ((nearLeftEdge || nearRightEdge || nearTopEdge || nearBottomEdge) && !autoScrolling) {
        setAutoScrolling(true)
      } else if (!(nearLeftEdge || nearRightEdge || nearTopEdge || nearBottomEdge) && autoScrolling) {
        setAutoScrolling(false)
      }

      const containerRect = container.getBoundingClientRect()
      const x = (e.clientX - containerRect.left - dragOffset.x + container.scrollLeft) / zoom
      const y = (e.clientY - containerRect.top - dragOffset.y + container.scrollTop) / zoom

      // Snap to grid if not holding shift
      const snappedX = !e.shiftKey ? Math.round(x / GRID_SIZE) * GRID_SIZE : x
      const snappedY = !e.shiftKey ? Math.round(y / GRID_SIZE) * GRID_SIZE : y

      // Update node position
      const updatedWorkflow = {
        ...workflow,
        nodes: workflow.nodes.map((node) =>
          node.id === draggingNodeId ? { ...node, position: { x: snappedX, y: snappedY } } : node,
        ),
      }
      onChange(updatedWorkflow)
    },
    [
      draggingNodeId,
      dragOffset.x,
      dragOffset.y,
      readOnly,
      workflow,
      onChange,
      autoScrolling,
      SCROLL_EDGE_SIZE,
      zoom,
      GRID_SIZE,
    ],
  )

  // End dragging
  const handleMouseUp = useCallback(() => {
    if (draggingNodeId !== null) {
      setDraggingNodeId(null)
      setAutoScrolling(false)
      if (scrollAnimationRef.current) {
        cancelAnimationFrame(scrollAnimationRef.current)
        scrollAnimationRef.current = null
      }
    }
  }, [draggingNodeId])

  // Start connecting nodes
  const handleStartConnecting = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      e.stopPropagation()
      if (readOnly) return
      setConnecting(nodeId)
    },
    [readOnly],
  )

  // Complete connection
  const handleCompleteConnection = useCallback(
    (targetId: string, e: React.MouseEvent) => {
      // Prevent the default action and stop propagation to avoid node selection
      e.preventDefault()
      e.stopPropagation()

      if (!connecting || readOnly || connecting === targetId) return

      // Add connection
      const updatedWorkflow = {
        ...workflow,
        nodes: workflow.nodes.map((node) =>
          node.id === connecting
            ? {
                ...node,
                nextNodeIds: [...node.nextNodeIds, targetId].filter((v, i, a) => a.indexOf(v) === i),
              }
            : node,
        ),
      }
      onChange(updatedWorkflow)
      setConnecting(null)
    },
    [connecting, readOnly, workflow, onChange],
  )

  // Add a new node
  const handleAddNode = useCallback(
    (type: "task" | "decision") => {
      if (readOnly) return

      const container = containerRef.current
      if (!container) return

      // Calculate center position of the visible viewport
      const centerX = (container.scrollLeft + container.clientWidth / 2) / zoom
      const centerY = (container.scrollTop + container.clientHeight / 2) / zoom

      // Snap to grid
      const snappedX = Math.round(centerX / GRID_SIZE) * GRID_SIZE
      const snappedY = Math.round(centerY / GRID_SIZE) * GRID_SIZE

      const id = `node_${Date.now()}`
      const newNode: WorkflowNode = {
        id,
        type,
        label: type === "task" ? "New Task" : "Decision",
        position: { x: snappedX, y: snappedY },
        nextNodeIds: [],
      }

      const updatedWorkflow = {
        ...workflow,
        nodes: [...workflow.nodes, newNode],
      }
      onChange(updatedWorkflow)
      setSelectedNodeId(id)
    },
    [readOnly, workflow, onChange, zoom, GRID_SIZE],
  )

  // Update node label
  const handleUpdateNodeLabel = useCallback(
    (nodeId: string, label: string) => {
      if (readOnly) return

      const updatedWorkflow = {
        ...workflow,
        nodes: workflow.nodes.map((node) => (node.id === nodeId ? { ...node, label } : node)),
      }
      onChange(updatedWorkflow)
    },
    [readOnly, workflow, onChange],
  )

  // Remove a node
  const handleRemoveNode = useCallback(
    (nodeId: string) => {
      if (readOnly || nodeId === "start" || nodeId === "end") return

      const filteredNodes = workflow.nodes.filter((node) => node.id !== nodeId)
      const updatedWorkflow = {
        ...workflow,
        nodes: filteredNodes.map((node) => ({
          ...node,
          nextNodeIds: node.nextNodeIds.filter((id) => id !== nodeId),
        })),
      }
      onChange(updatedWorkflow)
      setSelectedNodeId(null)
    },
    [readOnly, workflow, onChange],
  )

  // Remove a connection
  const handleRemoveConnection = useCallback(
    (sourceId: string, targetId: string) => {
      if (readOnly) return

      const updatedWorkflow = {
        ...workflow,
        nodes: workflow.nodes.map((node) =>
          node.id === sourceId ? { ...node, nextNodeIds: node.nextNodeIds.filter((id) => id !== targetId) } : node,
        ),
      }
      onChange(updatedWorkflow)
    },
    [readOnly, workflow, onChange],
  )

  // Handle mouse move for connection and dragging
  const handleMouseMoveForConnection = useCallback(
    (e: React.MouseEvent) => {
      if (connecting) {
        const container = containerRef.current
        if (!container) return

        const containerRect = container.getBoundingClientRect()
        setMousePosition({
          x: (e.clientX - containerRect.left + container.scrollLeft) / zoom,
          y: (e.clientY - containerRect.top + container.scrollTop) / zoom,
        })
      }

      // Also handle node dragging
      handleMouseMove(e)
    },
    [connecting, handleMouseMove, zoom],
  )

  // Render connections between nodes
  const renderConnections = () => {
    return workflow.nodes.flatMap((node) =>
      node.nextNodeIds.map((targetId) => {
        const target = workflow.nodes.find((n) => n.id === targetId)
        if (!target) return null

        // Calculate line coordinates
        const sourceX = node.position.x + 75 // Half of node width
        const sourceY = node.position.y + 30 // Half of node height
        const targetX = target.position.x + 75
        const targetY = target.position.y + 30

        // Create a path with an arrow
        const path = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`

        return (
          <g key={`${node.id}-${targetId}`}>
            <path d={path} stroke="black" strokeWidth="2" fill="none" markerEnd="url(#arrowhead)" />
            {!readOnly && (
              <circle
                cx={(sourceX + targetX) / 2}
                cy={(sourceY + targetY) / 2}
                r="8"
                fill="white"
                stroke="black"
                strokeWidth="1"
                cursor="pointer"
                onClick={() => handleRemoveConnection(node.id, targetId)}
              />
            )}
            {!readOnly && (
              <text
                x={(sourceX + targetX) / 2}
                y={(sourceY + targetY) / 2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12"
                fontWeight="bold"
                pointerEvents="none"
              >
                ×
              </text>
            )}
          </g>
        )
      }),
    )
  }

  // Render the temporary connection line when connecting nodes
  const renderTempConnection = () => {
    if (!connecting) return null

    const sourceNode = workflow.nodes.find((n) => n.id === connecting)
    if (!sourceNode) return null

    const sourceX = sourceNode.position.x + 75
    const sourceY = sourceNode.position.y + 30

    return (
      <line
        x1={sourceX}
        y1={sourceY}
        x2={mousePosition.x}
        y2={mousePosition.y}
        stroke="black"
        strokeWidth="2"
        strokeDasharray="5,5"
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      {!readOnly && (
        <div className="flex justify-between p-2 border-b">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => handleAddNode("task")}>
              <PlusCircle className="mr-1 h-4 w-4" />
              Add Task
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleAddNode("decision")}>
              <PlusCircle className="mr-1 h-4 w-4" />
              Add Decision
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <Button size="sm" variant="outline" onClick={handleZoomOut} title="Zoom Out (Ctrl+-)">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={handleResetZoom} title="Reset Zoom (Ctrl+0)">
              <RotateCcw className="h-4 w-4" />
              {Math.round(zoom * 100)}%
            </Button>
            <Button size="sm" variant="outline" onClick={handleZoomIn} title="Zoom In (Ctrl++)">
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="flex-1 relative overflow-auto bg-gray-50"
        onClick={handleBackgroundClick}
        onMouseMove={handleMouseMoveForConnection}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ minHeight: "500px", minWidth: "100%" }}
        tabIndex={0} // Make the container focusable for keyboard events
      >
        <div
          ref={canvasRef}
          className="absolute"
          style={{
            minWidth: "3000px",
            minHeight: "3000px",
            backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
            backgroundImage: `
              linear-gradient(to right, rgba(200, 200, 200, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(200, 200, 200, 0.1) 1px, transparent 1px),
              linear-gradient(to right, rgba(200, 200, 200, 0.2) ${GRID_SIZE * zoom}px, transparent ${GRID_SIZE * zoom}px),
              linear-gradient(to bottom, rgba(200, 200, 200, 0.2) ${GRID_SIZE * zoom}px, transparent ${GRID_SIZE * zoom}px)
            `,
            backgroundPosition: "0 0",
            transform: `scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" />
              </marker>
            </defs>
            <g className="connections" pointerEvents="auto">
              {renderConnections()}
              {renderTempConnection()}
            </g>
          </svg>

          {workflow.nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute cursor-move rounded-md shadow-md ${
                selectedNodeId === node.id ? "ring-2 ring-blue-500" : ""
              } ${connecting ? "cursor-pointer" : ""}`}
              style={{
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                width: "150px",
                backgroundColor:
                  node.type === "start"
                    ? "#4ade80"
                    : node.type === "end"
                      ? "#f87171"
                      : node.type === "decision"
                        ? "#fbbf24"
                        : "#ffffff",
              }}
              onClick={(e) => handleNodeClick(node.id, e)}
              onMouseDown={(e) => handleDragStart(node.id, e)}
              onMouseUp={(e) => (connecting ? handleCompleteConnection(node.id, e) : null)}
            >
              <div className="p-2 flex items-center justify-between">
                <Badge variant="outline">{node.type}</Badge>
                {!readOnly && node.type !== "start" && node.type !== "end" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveNode(node.id)
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="px-2 pb-2">
                {selectedNodeId === node.id && !readOnly ? (
                  <Input
                    value={node.label}
                    onChange={(e) => handleUpdateNodeLabel(node.id, e.target.value)}
                    onClick={(e) => {
                      e.stopPropagation()
                      // Ensure the input gets focus
                      ;(e.target as HTMLInputElement).focus()
                    }}
                    onMouseUp={(e) => {
                      // Prevent the node's onMouseUp handler from firing when clicking on the input
                      e.stopPropagation()
                    }}
                    autoFocus
                    className="text-sm h-7"
                  />
                ) : (
                  <div className="font-medium text-sm">{node.label}</div>
                )}
              </div>
              {!readOnly && (
                <div className="absolute -right-3 top-1/2 transform -translate-y-1/2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 rounded-full bg-white"
                    onClick={(e) => handleStartConnecting(node.id, e)}
                  >
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              )}
              {!readOnly && (
                <div
                  className="absolute top-0 left-0 right-0 h-6 cursor-move flex items-center justify-center"
                  onMouseDown={(e) => handleDragStart(node.id, e)}
                >
                  <MoveIcon className="h-3 w-3 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedNodeId && (
        <Card className="mt-2 border-t">
          <CardContent className="p-3">
            <h3 className="text-sm font-medium mb-2">Properties</h3>
            <div className="text-xs text-gray-500">Select a node to edit its properties</div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Viewer component is now a simple wrapper that passes readOnly=true
export function WorkflowViewer({ xml }: { xml: string }) {
  // Parse the XML to a workflow model
  const workflow = xmlToWorkflow(xml)
  // Dummy onChange function since we're in read-only mode
  const handleChange = () => {}

  return <WorkflowDesigner workflow={workflow} onChange={handleChange} readOnly={true} />
}

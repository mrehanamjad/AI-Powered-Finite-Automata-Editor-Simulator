"use client"

import type React from "react"

import { useEffect, useRef, useState, useCallback } from "react"
import { useTheme } from "next-themes"
import type { AutomataDefinition, SimulationState } from "@/lib/automata-types"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ZoomIn, ZoomOut, MoveHorizontal } from "lucide-react"

interface AutomataGraphProps {
  automata: AutomataDefinition
  simulation: SimulationState | null
}

interface Position {
  x: number
  y: number
}

interface StateNode {
  id: string
  position: Position
  isAccepting: boolean
  isInitial: boolean
  isCurrent: boolean
  radius: number
  label: string
}

interface TransitionEdge {
  from: string
  to: string
  label: string
  isActive: boolean
  isSelfLoop: boolean
  controlPoint?: Position
  animationProgress?: number
}

export default function AutomataGraph({ automata, simulation }: AutomataGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [nodes, setNodes] = useState<StateNode[]>([])
  const [edges, setEdges] = useState<TransitionEdge[]>([])
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 500 })
  const [animationFrame, setAnimationFrame] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const { theme } = useTheme()

  // Handle canvas resizing
  const updateCanvasSize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setCanvasSize({
        width: Math.max(600, rect.width),
        height: Math.max(500, rect.height),
      })
    }
  }, [])

  useEffect(() => {
    updateCanvasSize()
    window.addEventListener("resize", updateCanvasSize)
    return () => window.removeEventListener("resize", updateCanvasSize)
  }, [updateCanvasSize])

  // Animation loop for smooth transitions
  useEffect(() => {
    const animate = () => {
      setAnimationFrame((prev) => prev + 1)
      requestAnimationFrame(animate)
    }
    const animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  // Calculate optimal node positions
  useEffect(() => {
    const { width, height } = canvasSize
    const centerX = width / 2
    const centerY = height / 2
    const nodeRadius = 40

    let newNodes: StateNode[]

    if (automata.states.length === 1) {
      // Single state in center
      newNodes = [
        {
          id: automata.states[0],
          position: { x: centerX, y: centerY },
          isAccepting: automata.acceptingStates.includes(automata.states[0]),
          isInitial: automata.states[0] === automata.initialState,
          isCurrent: simulation?.currentStates.includes(automata.states[0]) || false,
          radius: nodeRadius,
          label: automata.states[0],
        },
      ]
    } else if (automata.states.length === 2) {
      // Two states horizontally aligned
      const spacing = Math.min(width * 0.3, 200)
      newNodes = automata.states.map((state, index) => ({
        id: state,
        position: {
          x: centerX + (index === 0 ? -spacing / 2 : spacing / 2),
          y: centerY,
        },
        isAccepting: automata.acceptingStates.includes(state),
        isInitial: state === automata.initialState,
        isCurrent: simulation?.currentStates.includes(state) || false,
        radius: nodeRadius,
        label: state,
      }))
    } else if (automata.states.length <= 8) {
      // Circle layout for small number of states
      const radius = Math.min(width, height) * 0.35
      newNodes = automata.states.map((state, index) => {
        const angle = (2 * Math.PI * index) / automata.states.length - Math.PI / 2
        return {
          id: state,
          position: {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          },
          isAccepting: automata.acceptingStates.includes(state),
          isInitial: state === automata.initialState,
          isCurrent: simulation?.currentStates.includes(state) || false,
          radius: nodeRadius,
          label: state,
        }
      })
    } else {
      // Force-directed layout for many states
      // Initialize with circle layout
      const radius = Math.min(width, height) * 0.4
      newNodes = automata.states.map((state, index) => {
        const angle = (2 * Math.PI * index) / automata.states.length
        return {
          id: state,
          position: {
            x: centerX + radius * Math.cos(angle),
            y: centerY + radius * Math.sin(angle),
          },
          isAccepting: automata.acceptingStates.includes(state),
          isInitial: state === automata.initialState,
          isCurrent: simulation?.currentStates.includes(state) || false,
          radius: nodeRadius,
          label: state,
        }
      })

      // Apply force-directed algorithm
      const iterations = 50
      const k = 100 // Optimal distance

      for (let iter = 0; iter < iterations; iter++) {
        // Calculate repulsive forces
        for (let i = 0; i < newNodes.length; i++) {
          let fx = 0,
            fy = 0

          for (let j = 0; j < newNodes.length; j++) {
            if (i !== j) {
              const dx = newNodes[i].position.x - newNodes[j].position.x
              const dy = newNodes[i].position.y - newNodes[j].position.y
              const distance = Math.sqrt(dx * dx + dy * dy) || 1

              // Repulsive force
              const force = (k * k) / distance
              fx += (dx / distance) * force
              fy += (dy / distance) * force
            }
          }

          // Apply forces
          newNodes[i].position.x += fx * 0.1
          newNodes[i].position.y += fy * 0.1

          // Keep nodes within bounds
          newNodes[i].position.x = Math.max(nodeRadius, Math.min(width - nodeRadius, newNodes[i].position.x))
          newNodes[i].position.y = Math.max(nodeRadius, Math.min(height - nodeRadius, newNodes[i].position.y))
        }

        // Calculate attractive forces (based on edges)
        Object.entries(automata.transitions).forEach(([key, targets]) => {
          const [fromState] = key.split(",")
          targets.forEach((toState) => {
            if (fromState !== toState) {
              const fromNode = newNodes.find((n) => n.id === fromState)
              const toNode = newNodes.find((n) => n.id === toState)

              if (fromNode && toNode) {
                const dx = fromNode.position.x - toNode.position.x
                const dy = fromNode.position.y - toNode.position.y
                const distance = Math.sqrt(dx * dx + dy * dy) || 1

                // Attractive force
                const force = (distance * distance) / k

                const fx = (dx / distance) * force
                const fy = (dy / distance) * force

                fromNode.position.x -= fx * 0.1
                fromNode.position.y -= fy * 0.1
                toNode.position.x += fx * 0.1
                toNode.position.y += fy * 0.1
              }
            }
          })
        })
      }
    }

    setNodes(newNodes)
  }, [automata, canvasSize])

  // Update node current state based on simulation
  useEffect(() => {
    if (simulation) {
      setNodes((prev) =>
        prev.map((node) => ({
          ...node,
          isCurrent: simulation.currentStates.includes(node.id),
        })),
      )
    }
  }, [simulation])

  // Calculate edges with better curve handling
  useEffect(() => {
    const newEdges: TransitionEdge[] = []
    const edgeMap = new Map<string, string[]>()

    // Group transitions by state pair
    Object.entries(automata.transitions).forEach(([key, targets]) => {
      const [fromState, symbol] = key.split(",")
      targets.forEach((toState) => {
        const edgeKey = fromState === toState ? `${fromState}-self` : `${fromState}-${toState}`
        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, [])
        }
        edgeMap.get(edgeKey)!.push(symbol)
      })
    })

    // Create edges with combined labels
    edgeMap.forEach((symbols, edgeKey) => {
      const [fromState, toState] = edgeKey.includes("-self")
        ? [edgeKey.replace("-self", ""), edgeKey.replace("-self", "")]
        : edgeKey.split("-")

      const isActive =
        simulation?.lastTransition?.from === fromState &&
        symbols.includes(simulation.lastTransition.symbol) &&
        simulation?.lastTransition?.to === toState

      const isSelfLoop = fromState === toState
      let controlPoint: Position | undefined

      if (!isSelfLoop && nodes.length > 0) {
        const fromNode = nodes.find((n) => n.id === fromState)
        const toNode = nodes.find((n) => n.id === toState)
        if (fromNode && toNode) {
          // Calculate control point for curved edges
          const midX = (fromNode.position.x + toNode.position.x) / 2
          const midY = (fromNode.position.y + toNode.position.y) / 2
          const dx = toNode.position.x - fromNode.position.x
          const dy = toNode.position.y - fromNode.position.y
          const length = Math.sqrt(dx * dx + dy * dy)
          const offset = Math.min(50, length * 0.2)

          controlPoint = {
            x: midX + (-dy / length) * offset,
            y: midY + (dx / length) * offset,
          }
        }
      }

      newEdges.push({
        from: fromState,
        to: toState,
        label: symbols.join(", "),
        isActive,
        isSelfLoop,
        controlPoint,
        animationProgress: isActive ? 0 : undefined,
      })
    })

    setEdges(newEdges)
  }, [automata.transitions, simulation, nodes])

  // Animate active transitions
  useEffect(() => {
    if (simulation?.lastTransition) {
      setEdges((prev) =>
        prev.map((edge) => {
          if (edge.isActive) {
            return {
              ...edge,
              animationProgress: (animationFrame % 60) / 60,
            }
          }
          return edge
        }),
      )
    }
  }, [animationFrame, simulation])

  // Mouse event handlers for pan and zoom
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = (e.clientX - rect.left) / zoom - pan.x
      const y = (e.clientY - rect.top) / zoom - pan.y

      // Check if clicking on a node
      const clickedNode = nodes.find((node) => {
        const dx = node.position.x - x
        const dy = node.position.y - y
        return dx * dx + dy * dy <= node.radius * node.radius
      })

      if (clickedNode) {
        setDraggedNode(clickedNode.id)
      } else {
        setIsDragging(true)
      }

      setDragStart({ x: e.clientX, y: e.clientY })
    },
    [nodes, zoom, pan],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging && !draggedNode) return

      if (draggedNode) {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = (e.clientX - rect.left) / zoom - pan.x
        const y = (e.clientY - rect.top) / zoom - pan.y

        setNodes((prev) => prev.map((node) => (node.id === draggedNode ? { ...node, position: { x, y } } : node)))
      } else {
        const dx = e.clientX - dragStart.x
        const dy = e.clientY - dragStart.y

        setPan((prev) => ({
          x: prev.x + dx / zoom,
          y: prev.y + dy / zoom,
        }))

        setDragStart({ x: e.clientX, y: e.clientY })
      }
    },
    [isDragging, draggedNode, dragStart, zoom, pan],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDraggedNode(null)
  }, [])

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.2, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.2, 0.5))
  }, [])

  const handleResetView = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  // Enhanced drawing function
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = canvasSize.width
    canvas.height = canvasSize.height

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Apply zoom and pan transformations
    ctx.save()
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Background
    const isDark = theme === "dark"
    const bgColor = isDark ? "#1a1a1a" : "#ffffff"
    const gridColor = isDark ? "#333333" : "#f0f0f0"
    const textColor = isDark ? "#ffffff" : "#000000"
    const nodeColor = isDark ? "#2a2a2a" : "#ffffff"
    const nodeBorderColor = isDark ? "#555555" : "#666666"
    const activeNodeColor = isDark ? "#3b5249" : "#f0f9ff"
    const activeNodeBorderColor = isDark ? "#4ade80" : "#0ea5e9"
    const acceptingStateColor = isDark ? "#4ade80" : "#10b981"
    const edgeColor = isDark ? "#666666" : "#94a3b8"
    const activeEdgeColor = isDark ? "#4ade80" : "#0ea5e9"
    const labelBgColor = isDark ? "#2a2a2a" : "#ffffff"

    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid
    ctx.strokeStyle = gridColor
    ctx.lineWidth = 1

    const gridSize = 50 * zoom
    const offsetX = (pan.x * zoom) % gridSize
    const offsetY = (pan.y * zoom) % gridSize

    for (let x = offsetX; x < canvas.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    for (let y = offsetY; y < canvas.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Apply zoom and pan
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.scale(zoom, zoom)
    ctx.translate(-canvas.width / 2 + pan.x * zoom, -canvas.height / 2 + pan.y * zoom)

    // Draw edges
    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from)
      const toNode = nodes.find((n) => n.id === edge.to)

      if (!fromNode || !toNode) return

      // Edge styling
      const isActive = edge.isActive
      ctx.strokeStyle = isActive ? activeEdgeColor : edgeColor
      ctx.lineWidth = isActive ? 3 : 2
      ctx.fillStyle = isActive ? activeEdgeColor : edgeColor

      // Add glow effect for active edges
      if (isActive) {
        ctx.shadowColor = activeEdgeColor
        ctx.shadowBlur = 8
      } else {
        ctx.shadowBlur = 0
      }

      if (edge.isSelfLoop) {
        // Enhanced self-loop
        const loopRadius = fromNode.radius * 1.2
        const x = fromNode.position.x
        const y = fromNode.position.y - fromNode.radius - loopRadius / 2

        ctx.beginPath()
        ctx.arc(x, y, loopRadius, 0.3 * Math.PI, 2.7 * Math.PI)
        ctx.stroke()

        // Arrow for self-loop
        const arrowX = x + loopRadius * Math.cos(2.7 * Math.PI)
        const arrowY = y + loopRadius * Math.sin(2.7 * Math.PI)
        drawArrow(ctx, arrowX, arrowY, 2.7 * Math.PI + Math.PI / 2)

        // Label for self-loop
        ctx.font = "bold 14px Arial"
        ctx.textAlign = "center"
        ctx.fillStyle = textColor

        // Label background
        const labelWidth = ctx.measureText(edge.label).width + 10
        ctx.fillStyle = labelBgColor
        ctx.fillRect(x - labelWidth / 2, y - loopRadius - 25, labelWidth, 20)

        ctx.fillStyle = isActive ? activeEdgeColor : edgeColor
        ctx.fillText(edge.label, x, y - loopRadius - 15)

        // Animation for active transition
        if (isActive && edge.animationProgress !== undefined) {
          const progress = edge.animationProgress
          const particleAngle = 0.3 * Math.PI + 2.4 * Math.PI * progress

          ctx.fillStyle = activeEdgeColor
          ctx.beginPath()
          ctx.arc(x + loopRadius * Math.cos(particleAngle), y + loopRadius * Math.sin(particleAngle), 4, 0, 2 * Math.PI)
          ctx.fill()
        }
      } else {
        // Curved edge
        const startX = fromNode.position.x
        const startY = fromNode.position.y
        const endX = toNode.position.x
        const endY = toNode.position.y

        if (edge.controlPoint) {
          // Quadratic curve
          ctx.beginPath()
          ctx.moveTo(startX, startY)
          ctx.quadraticCurveTo(edge.controlPoint.x, edge.controlPoint.y, endX, endY)
          ctx.stroke()

          // Calculate arrow position and angle
          const t = 0.9 // Position along curve for arrow
          const arrowX = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * edge.controlPoint.x + t * t * endX
          const arrowY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * edge.controlPoint.y + t * t * endY

          // Calculate tangent for arrow direction
          const tangentX = 2 * (1 - t) * (edge.controlPoint.x - startX) + 2 * t * (endX - edge.controlPoint.x)
          const tangentY = 2 * (1 - t) * (edge.controlPoint.y - startY) + 2 * t * (endY - edge.controlPoint.y)
          const angle = Math.atan2(tangentY, tangentX)

          drawArrow(ctx, arrowX, arrowY, angle)

          // Label at curve midpoint
          const labelX = 0.25 * startX + 0.5 * edge.controlPoint.x + 0.25 * endX
          const labelY = 0.25 * startY + 0.5 * edge.controlPoint.y + 0.25 * endY

          // Label background
          ctx.fillStyle = labelBgColor
          const labelWidth = ctx.measureText(edge.label).width + 10
          ctx.fillRect(labelX - labelWidth / 2, labelY - 10, labelWidth, 20)

          ctx.fillStyle = isActive ? activeEdgeColor : edgeColor
          ctx.font = "bold 12px Arial"
          ctx.textAlign = "center"
          ctx.fillText(edge.label, labelX, labelY + 4)

          // Animation for active transition
          if (isActive && edge.animationProgress !== undefined) {
            const progress = edge.animationProgress
            const particleX =
              (1 - progress) * (1 - progress) * startX +
              2 * (1 - progress) * progress * edge.controlPoint.x +
              progress * progress * endX
            const particleY =
              (1 - progress) * (1 - progress) * startY +
              2 * (1 - progress) * progress * edge.controlPoint.y +
              progress * progress * endY

            ctx.fillStyle = activeEdgeColor
            ctx.beginPath()
            ctx.arc(particleX, particleY, 4, 0, 2 * Math.PI)
            ctx.fill()
          }
        }
      }

      ctx.shadowBlur = 0 // Reset shadow
    })

    // Draw nodes
    nodes.forEach((node) => {
      const { x, y } = node.position
      const radius = node.radius
      const isCurrent = node.isCurrent
      const isAccepting = node.isAccepting
      const isInitial = node.isInitial

      // Node shadow
      ctx.shadowColor = "rgba(0, 0, 0, 0.2)"
      ctx.shadowBlur = 8
      ctx.shadowOffsetY = 4

      // Node fill
      ctx.fillStyle = isCurrent ? activeNodeColor : nodeColor
      ctx.beginPath()
      ctx.arc(x, y, radius, 0, 2 * Math.PI)
      ctx.fill()

      // Node border
      ctx.shadowBlur = 0
      ctx.strokeStyle = isCurrent ? activeNodeBorderColor : nodeBorderColor
      ctx.lineWidth = isCurrent ? 3 : 2
      ctx.stroke()

      // Accepting state (double circle)
      if (isAccepting) {
        ctx.strokeStyle = acceptingStateColor
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(x, y, radius - 8, 0, 2 * Math.PI)
        ctx.stroke()
      }

      // Initial state arrow
      if (isInitial) {
        ctx.strokeStyle = edgeColor
        ctx.fillStyle = edgeColor
        ctx.lineWidth = 2

        const arrowStartX = x - radius - 40
        const arrowEndX = x - radius - 5

        ctx.beginPath()
        ctx.moveTo(arrowStartX, y)
        ctx.lineTo(arrowEndX, y)
        ctx.stroke()

        drawArrow(ctx, arrowEndX, y, 0)

        // "Start" label
        ctx.font = "12px Arial"
        ctx.textAlign = "center"
        ctx.fillStyle = textColor
        ctx.fillText("Start", arrowStartX - 15, y - 15)
      }

      // State label
      ctx.fillStyle = textColor
      ctx.font = "bold 16px Arial"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(node.label, x, y)

      // Current state indicator
      if (isCurrent) {
        const pulseRadius = radius + 5 + Math.sin(animationFrame * 0.1) * 5
        ctx.strokeStyle = activeNodeBorderColor
        ctx.lineWidth = 2
        ctx.globalAlpha = 0.5
        ctx.beginPath()
        ctx.arc(x, y, pulseRadius, 0, 2 * Math.PI)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    })

    // Helper function to draw arrows
    function drawArrow(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number) {
      const arrowLength = 12
      const arrowAngle = Math.PI / 6

      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - arrowLength * Math.cos(angle - arrowAngle), y - arrowLength * Math.sin(angle - arrowAngle))
      ctx.moveTo(x, y)
      ctx.lineTo(x - arrowLength * Math.cos(angle + arrowAngle), y - arrowLength * Math.sin(angle + arrowAngle))
      ctx.stroke()
    }

    ctx.restore()
  }, [nodes, edges, canvasSize, animationFrame, zoom, pan, theme])

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-2 gap-1 max-sm:flex-col max-sm:items-start">
        <div className="flex items-center gap-2 ">
          <Button variant="outline" size="sm" onClick={handleZoomIn} title="Zoom In">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Slider
            className="w-32"
            value={[zoom * 100]}
            min={50}
            max={300}
            step={10}
            onValueChange={(value) => setZoom(value[0] / 100)}
          />
          <span className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
        </div>
        <Button variant="outline" size="sm" onClick={handleResetView} title="Reset View">
          <MoveHorizontal className="h-4 w-4 mr-1" />
          <span >Reset</span>
        </Button>
      </div>
      <div
        ref={containerRef}
        className="w-full h-full flex-1 flex items-center justify-center bg-background rounded-lg border border-border overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas
          ref={canvasRef}
          className="rounded-lg"
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            cursor: isDragging ? "grabbing" : draggedNode ? "move" : "grab",
          }}
        />
      </div>
    </div>
  )
}

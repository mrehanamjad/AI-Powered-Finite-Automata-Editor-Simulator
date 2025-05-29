"use client"

import { useState, useCallback, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import AutomataInput from "./automata-input"
import AutomataGraph from "./automata-graph"
import AutomataSimulator from "./automata-simulator"
import AutomataExamples from "./automata-examples"
import { ModeToggle } from "./mode-toggle"
import { Download, Info, Maximize2, ChartNetwork } from "lucide-react"
import type { AutomataDefinition, SimulationState } from "@/lib/automata-types"
import { defaultDFA } from "@/lib/automata-examples"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

export default function AutomataVisualizer() {
  const [automata, setAutomata] = useState<AutomataDefinition>(defaultDFA)
  const [simulation, setSimulation] = useState<SimulationState | null>(null)
  const [activeTab, setActiveTab] = useState("design")
  const { toast } = useToast()

  const handleAutomataChange = useCallback(
    (newAutomata: AutomataDefinition) => {
      setAutomata(newAutomata)
      setSimulation(null) // Reset simulation when automata changes

      toast({
        title: "Automaton Updated",
        description: `${newAutomata.type} with ${newAutomata.states.length} states and ${Object.keys(newAutomata.transitions).length} transitions`,
        duration: 2000,
      })
    },
    [toast],
  )

  const handleSimulationChange = useCallback((newSimulation: SimulationState | null) => {
    setSimulation(newSimulation)

    if (newSimulation?.isComplete) {
      setActiveTab("simulate")
    }
  }, [])

  const loadExample = useCallback(
    (example: AutomataDefinition) => {
      setAutomata(example)
      setSimulation(null)

      toast({
        title: "Example Loaded",
        description: `Loaded ${example.type} example with ${example.states.length} states`,
        duration: 2000,
      })
    },
    [toast],
  )

  const exportAutomata = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(automata, null, 2))
    const downloadAnchorNode = document.createElement("a")
    downloadAnchorNode.setAttribute("href", dataStr)
    downloadAnchorNode.setAttribute("download", `${automata.type.toLowerCase()}_automaton.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()

    toast({
      title: "Export Successful",
      description: "Automaton configuration saved as JSON",
      duration: 2000,
    })
  }, [automata, toast])

  const exportImage = useCallback(() => {
    const canvas = document.querySelector("canvas")
    if (canvas) {
      const dataUrl = canvas.toDataURL("image/png")
      const downloadAnchorNode = document.createElement("a")
      downloadAnchorNode.setAttribute("href", dataUrl)
      downloadAnchorNode.setAttribute("download", `${automata.type.toLowerCase()}_diagram.png`)
      document.body.appendChild(downloadAnchorNode)
      downloadAnchorNode.click()
      downloadAnchorNode.remove()

      toast({
        title: "Image Exported",
        description: "Diagram saved as PNG image",
        duration: 2000,
      })
    }
  }, [automata.type, toast])

  // Auto-switch to simulation tab when simulation starts
  useEffect(() => {
    if (simulation && !simulation.isComplete) {
      setActiveTab("simulate")
    }
  }, [simulation])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold"></h2>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={exportAutomata} title="Export as JSON">
            <Download className="h-4 w-4" /> 
          </Button>
          <Button variant="outline" size="icon" onClick={exportImage} title="Export as Image">
            <ChartNetwork className="h-4 w-4" /> 
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" title="Help">
                <Info className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <div className="space-y-4">
                <h2 className="text-xl font-bold">Finite Automata Visualizer Help</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-bold">Design Tab</h3>
                    <p>Create and edit your automaton by defining states, alphabet, and transitions.</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Choose between DFA and NFA types</li>
                      <li>Add states as comma-separated values</li>
                      <li>Define the input alphabet</li>
                      <li>Set initial and accepting states</li>
                      <li>Define transitions in the format: state,symbol → target</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold">Simulate Tab</h3>
                    <p>Test your automaton with input strings and see step-by-step execution.</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Enter an input string to test</li>
                      <li>Use play/pause to control simulation</li>
                      <li>Step forward/backward through execution</li>
                      <li>See current states and transitions highlighted</li>
                      <li>View computation paths for NFAs</li>
                    </ul>
                  </div>
                </div>
            
              </div>
            </DialogContent>
          </Dialog>
          <ModeToggle />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="simulate">Simulate</TabsTrigger>
        </TabsList>

        <TabsContent value="design" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Automaton Definition</CardTitle>
                  <CardDescription>Define states, alphabet, and transitions</CardDescription>
                </CardHeader>
                <CardContent>
                  <AutomataInput automata={automata} onChange={handleAutomataChange} />
                </CardContent>
              </Card>

              <AutomataExamples onSelect={loadExample} />
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Visualization</CardTitle>
                  <CardDescription>
                    {automata.type} with {automata.states.length} states and {Object.keys(automata.transitions).length}{" "}
                    transitions
                  </CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" title="Fullscreen">
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] max-h-[90vh]">
                    <div className="h-[80vh]">
                      <AutomataGraph automata={automata} simulation={simulation} />
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="h-[600px]">
                <AutomataGraph automata={automata} simulation={simulation} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="simulate" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>String Simulation</CardTitle>
                  <CardDescription>Test input strings and see step-by-step execution</CardDescription>
                </CardHeader>
                <CardContent>
                  <AutomataSimulator
                    automata={automata}
                    simulation={simulation}
                    onSimulationChange={handleSimulationChange}
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Visualization</CardTitle>
                <CardDescription>
                  {simulation ? (
                    simulation.isComplete ? (
                      simulation.isAccepted ? (
                        <span className="text-green-500 font-medium">String Accepted ✓</span>
                      ) : (
                        <span className="text-red-500 font-medium">String Rejected ✗</span>
                      )
                    ) : (
                      <span className="text-amber-500 font-medium">Simulation in progress...</span>
                    )
                  ) : (
                    "Start simulation to see execution"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[600px]">
                <AutomataGraph automata={automata} simulation={simulation} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

      </Tabs>
    </div>
  )
}

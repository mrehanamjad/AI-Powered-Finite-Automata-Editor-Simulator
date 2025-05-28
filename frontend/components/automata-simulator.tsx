"use client"

import { Textarea } from "@/components/ui/textarea"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Clock } from "lucide-react"
import type { AutomataDefinition, SimulationState } from "@/lib/automata-types"
import { simulateAutomata, stepSimulation } from "@/lib/automata-simulator"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AutomataSimulatorProps {
  automata: AutomataDefinition
  simulation: SimulationState | null
  onSimulationChange: (simulation: SimulationState | null) => void
}

export default function AutomataSimulator({ automata, simulation, onSimulationChange }: AutomataSimulatorProps) {
  const [inputString, setInputString] = useState("110")
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState([1000]) // milliseconds
  const [simulationHistory, setSimulationHistory] = useState<SimulationState[]>([])
  const [batchInput, setBatchInput] = useState("110\n101\n111")
  const [batchResults, setBatchResults] = useState<{ input: string; accepted: boolean }[]>([])
  const [activeTab, setActiveTab] = useState("single")
  const historyEndRef = useRef<HTMLDivElement>(null)

  // Update default input when automata changes
  useEffect(() => {
    if (automata.type === "DFA" && automata.alphabet.includes("a") && automata.alphabet.includes("b")) {
      setInputString("ab")
    } else if (automata.alphabet.includes("0") && automata.alphabet.includes("1")) {
      setInputString("110")
    }
  }, [automata])

  // Scroll to bottom of history when updated
  useEffect(() => {
    if (historyEndRef.current) {
      historyEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [simulationHistory])

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isPlaying && simulation && !simulation.isComplete) {
      interval = setInterval(() => {
        const nextState = stepSimulation(simulation, automata)
        if (nextState) {
          onSimulationChange(nextState)
          setSimulationHistory((prev) => [...prev, nextState])
        } else {
          setIsPlaying(false)
        }
      }, speed[0])
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isPlaying, simulation, automata, speed, onSimulationChange])

  const startSimulation = () => {
    const newSimulation = simulateAutomata(automata, inputString)
    onSimulationChange(newSimulation)
    setSimulationHistory([newSimulation])
  }

  const resetSimulation = () => {
    onSimulationChange(null)
    setIsPlaying(false)
    setSimulationHistory([])
  }

  const stepForward = () => {
    if (simulation) {
      const nextState = stepSimulation(simulation, automata)
      if (nextState) {
        onSimulationChange(nextState)
        setSimulationHistory((prev) => [...prev, nextState])
      }
    }
  }

  const stepBackward = () => {
    if (simulation && simulationHistory.length > 1) {
      const previousState = simulationHistory[simulationHistory.length - 2]
      onSimulationChange(previousState)
      setSimulationHistory((prev) => prev.slice(0, -1))
    }
  }

  const togglePlayPause = () => {
    if (!simulation && !isPlaying) {
      startSimulation()
    }
    setIsPlaying(!isPlaying)
  }

  const runBatchTest = () => {
    const inputs = batchInput.split("\n").filter((s) => s.trim())
    const results = inputs.map((input) => {
      let simulation = simulateAutomata(automata, input)

      // Run simulation to completion
      while (!simulation.isComplete) {
        const next = stepSimulation(simulation, automata)
        if (!next) break
        simulation = next
      }

      return {
        input,
        accepted: simulation.isAccepted,
      }
    })

    setBatchResults(results)
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="single">Single String</TabsTrigger>
          <TabsTrigger value="batch">Batch Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="input-string">Input String</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="input-string"
                  value={inputString}
                  onChange={(e) => setInputString(e.target.value)}
                  placeholder="Enter string to simulate"
                />
                <Button onClick={startSimulation} variant="default">
                  Start
                </Button>
              </div>
            </div>

            <div>
              <Label className="flex items-center gap-1">
                <Clock className="h-4 w-4" /> Simulation Speed
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs">Slow</span>
                <Slider value={speed} min={100} max={2000} step={100} onValueChange={setSpeed} className="w-32" />
                <span className="text-xs">Fast</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={togglePlayPause} disabled={simulation?.isComplete} variant="outline">
              {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {isPlaying ? "Pause" : "Play"}
            </Button>
            <Button onClick={stepBackward} disabled={!simulation || simulationHistory.length <= 1} variant="outline">
              <SkipBack className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button onClick={stepForward} disabled={!simulation || simulation.isComplete} variant="outline">
              <SkipForward className="w-4 h-4 mr-1" /> Next
            </Button>
            <Button onClick={resetSimulation} variant="outline">
              <RotateCcw className="w-4 h-4 mr-1" /> Reset
            </Button>
          </div>

          {simulation && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Simulation Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Step:</strong> {simulation.step} / {simulation.inputString.length}
                    </div>
                    <div>
                      <strong>Current Symbol:</strong>{" "}
                      {simulation.step < simulation.inputString.length
                        ? simulation.inputString[simulation.step]
                        : "End"}
                    </div>
                    <div>
                      <strong>Current States:</strong>
                      <div className="flex gap-1 mt-1">
                        {simulation.currentStates.map((state) => (
                          <Badge key={state} variant="secondary">
                            {state}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <strong>Status:</strong>
                      <Badge
                        variant={
                          simulation.isComplete ? (simulation.isAccepted ? "default" : "destructive") : "secondary"
                        }
                      >
                        {simulation.isComplete ? (simulation.isAccepted ? "Accepted" : "Rejected") : "Running"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Input String Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="font-mono text-lg">
                      {simulation.inputString.split("").map((char, index) => (
                        <span
                          key={index}
                          className={`px-1 ${
                            index < simulation.step
                              ? "bg-green-200 dark:bg-green-900 text-green-800 dark:text-green-200"
                              : index === simulation.step
                                ? "bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
                                : "text-muted-foreground"
                          }`}
                        >
                          {char}
                        </span>
                      ))}
                    </div>
                    <Progress value={(simulation.step / simulation.inputString.length) * 100} />
                  </div>
                </CardContent>
              </Card>

              {automata.type === "NFA" && simulation.computationPaths && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Computation Paths (NFA)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {simulation.computationPaths.map((path, index) => (
                        <div key={index} className="text-sm">
                          <strong>Path {index + 1}:</strong>
                          <div className="flex gap-1 mt-1">
                            {path.states.map((state, stateIndex) => (
                              <Badge key={stateIndex} variant={path.isAccepting ? "default" : "secondary"}>
                                {state}
                              </Badge>
                            ))}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Status: {path.isAccepting ? "Accepting" : "Non-accepting"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Simulation History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-60 overflow-y-auto space-y-2 p-1">
                    {simulationHistory.map((state, index) => (
                      <div key={index} className="p-2 border rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Step {index}</span>
                          <Badge variant="outline">{state.currentStates.join(", ")}</Badge>
                        </div>
                        {state.lastTransition && (
                          <div className="text-sm mt-1 text-muted-foreground">
                            Transition: {state.lastTransition.from} --({state.lastTransition.symbol})&gt;{" "}
                            {state.lastTransition.to}
                          </div>
                        )}
                      </div>
                    ))}
                    <div ref={historyEndRef} />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="batch" className="space-y-4">
          <div>
            <Label htmlFor="batch-input">Input Strings (one per line)</Label>
            <Textarea
              id="batch-input"
              value={batchInput}
              onChange={(e) => setBatchInput(e.target.value)}
              placeholder="Enter strings to test (one per line)"
              rows={5}
            />
          </div>

          <Button onClick={runBatchTest}>Run Tests</Button>

          {batchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {batchResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <code className="font-mono">{result.input}</code>
                      <Badge variant={result.accepted ? "default" : "destructive"}>
                        {result.accepted ? "Accepted" : "Rejected"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

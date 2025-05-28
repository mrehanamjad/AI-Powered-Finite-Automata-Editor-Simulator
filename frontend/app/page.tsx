"use client"
import AutomataVisualizer from "@/components/automata-visualizer"
import { ThemeProvider } from "@/components/theme-provider"

export default function Page() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="automata-theme">
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto py-8 px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">Finite Automata Visualizer</h1>
            <p className="text-lg text-muted-foreground">
              Design, visualize, and simulate Deterministic and Non-deterministic Finite Automata
            </p>
          </div>
          <AutomataVisualizer />
        </div>
      </div>
    </ThemeProvider>
  )
}

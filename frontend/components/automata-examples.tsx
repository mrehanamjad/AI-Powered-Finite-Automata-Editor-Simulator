"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { AutomataDefinition } from "@/lib/automata-types"
import { defaultDFA, exampleNFA, binaryDivisibleByThree, evenNumberOfZeros } from "@/lib/automata-examples"

interface AutomataExamplesProps {
  onSelect: (example: AutomataDefinition) => void
}

export default function AutomataExamples({ onSelect }: AutomataExamplesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Automata</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Button onClick={() => onSelect(defaultDFA)} variant="outline" size="sm">
            DFA: Binary ends with 0
          </Button>
          <Button onClick={() => onSelect(exampleNFA)} variant="outline" size="sm">
            NFA: Contains 01
          </Button>
          <Button onClick={() => onSelect(binaryDivisibleByThree)} variant="outline" size="sm">
            DFA: Binary divisible by 3
          </Button>
          <Button onClick={() => onSelect(evenNumberOfZeros)} variant="outline" size="sm">
            DFA: Even number of 0s
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export interface AutomataDefinition {
  type: "DFA" | "NFA"
  states: string[]
  alphabet: string[]
  transitions: { [key: string]: string[] } // "state,symbol" -> ["target1", "target2"]
  initialState: string
  acceptingStates: string[]
}

export interface ComputationPath {
  states: string[]
  isAccepting: boolean
}

export interface SimulationState {
  inputString: string
  step: number
  currentStates: string[]
  isComplete: boolean
  isAccepted: boolean
  lastTransition?: {
    from: string
    symbol: string
    to: string
  }
  computationPaths?: ComputationPath[] // For NFA
}

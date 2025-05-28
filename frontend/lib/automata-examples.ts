import type { AutomataDefinition } from "./automata-types"

export const defaultDFA: AutomataDefinition = {
  type: "DFA",
  states: ["q0", "q1", "q2"],
  alphabet: ["0", "1"],
  transitions: {
    "q0,0": ["q2"],
    "q0,1": ["q0"],
    "q1,0": ["q1"],
    "q1,1": ["q2"],
    "q2,0": ["q0"],
    "q2,1": ["q1"],
  },
  initialState: "q1",
  acceptingStates: ["q1"],
}

export const exampleNFA: AutomataDefinition = {
  type: "NFA",
  states: ["q0", "q1", "q2"],
  alphabet: ["0", "1"],
  transitions: {
    "q0,0": ["q0", "q1"],
    "q0,1": ["q0"],
    "q1,1": ["q2"],
  },
  initialState: "q0",
  acceptingStates: ["q2"],
}

export const binaryDivisibleByThree: AutomataDefinition = {
  type: "DFA",
  states: ["r0", "r1", "r2"],
  alphabet: ["0", "1"],
  transitions: {
    "r0,0": ["r0"],
    "r0,1": ["r1"],
    "r1,0": ["r2"],
    "r1,1": ["r0"],
    "r2,0": ["r1"],
    "r2,1": ["r2"],
  },
  initialState: "r0",
  acceptingStates: ["r0"],
}

export const evenNumberOfZeros: AutomataDefinition = {
  type: "DFA",
  states: ["even", "odd"],
  alphabet: ["0", "1"],
  transitions: {
    "even,0": ["odd"],
    "even,1": ["even"],
    "odd,0": ["even"],
    "odd,1": ["odd"],
  },
  initialState: "even",
  acceptingStates: ["even"],
}

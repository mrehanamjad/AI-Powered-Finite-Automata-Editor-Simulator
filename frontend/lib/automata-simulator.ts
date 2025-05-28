import type { AutomataDefinition, SimulationState, ComputationPath } from "./automata-types"

export function simulateAutomata(automata: AutomataDefinition, inputString: string): SimulationState {
  return {
    inputString,
    step: 0,
    currentStates: [automata.initialState],
    isComplete: false,
    isAccepted: false,
    computationPaths: automata.type === "NFA" ? [{ states: [automata.initialState], isAccepting: false }] : undefined,
  }
}

export function stepSimulation(simulation: SimulationState, automata: AutomataDefinition): SimulationState | null {
  if (simulation.isComplete || simulation.step >= simulation.inputString.length) {
    // Check if we're at the end and need to determine acceptance
    if (simulation.step >= simulation.inputString.length && !simulation.isComplete) {
      const isAccepted = simulation.currentStates.some((state) => automata.acceptingStates.includes(state))
      return {
        ...simulation,
        isComplete: true,
        isAccepted,
      }
    }
    return null
  }

  const currentSymbol = simulation.inputString[simulation.step]
  const newStates: string[] = []
  let lastTransition: { from: string; symbol: string; to: string } | undefined

  // Calculate next states
  for (const currentState of simulation.currentStates) {
    const transitionKey = `${currentState},${currentSymbol}`
    const targetStates = automata.transitions[transitionKey] || []

    for (const targetState of targetStates) {
      if (!newStates.includes(targetState)) {
        newStates.push(targetState)
      }
      lastTransition = { from: currentState, symbol: currentSymbol, to: targetState }
    }
  }

  const newStep = simulation.step + 1
  const isComplete = newStep >= simulation.inputString.length
  const isAccepted = isComplete && newStates.some((state) => automata.acceptingStates.includes(state))

  // Handle NFA computation paths
  let computationPaths: ComputationPath[] | undefined
  if (automata.type === "NFA" && simulation.computationPaths) {
    computationPaths = []

    for (const path of simulation.computationPaths) {
      const lastState = path.states[path.states.length - 1]
      const transitionKey = `${lastState},${currentSymbol}`
      const targetStates = automata.transitions[transitionKey] || []

      if (targetStates.length === 0) {
        // Dead end - path terminates
        continue
      }

      for (const targetState of targetStates) {
        const newPath: ComputationPath = {
          states: [...path.states, targetState],
          isAccepting: isComplete && automata.acceptingStates.includes(targetState),
        }
        computationPaths.push(newPath)
      }
    }
  }

  return {
    inputString: simulation.inputString,
    step: newStep,
    currentStates: newStates.length > 0 ? newStates : [], // Handle case where no transitions exist
    isComplete,
    isAccepted,
    lastTransition,
    computationPaths,
  }
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { AutomataDefinition } from "@/lib/automata-types";

interface AutomataInputProps {
  automata: AutomataDefinition;
  onChange: (automata: AutomataDefinition) => void;
}

interface AutomatonResponseKey {
  States: string;
  Alphabet: string;
  Initial_State: string;
  Accepting_States: string;
  Transitions: string;
}

interface AutomatonResponse {
  dfa: AutomatonResponseKey;
  nfa: AutomatonResponseKey;
}

export default function AutomataInput({
  automata,
  onChange,
}: AutomataInputProps) {
  const [states, setStates] = useState(automata.states.join(", "));
  const [alphabet, setAlphabet] = useState(automata.alphabet.join(", "));
  const [transitionsText, setTransitionsText] = useState("");
  const [initialState, setInitialState] = useState(automata.initialState);
  const [acceptingStates, setAcceptingStates] = useState(
    automata.acceptingStates.join(", ")
  );
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [regex, setRegex] = useState("");
  const [regexExpError, setRegexExpError] = useState("");
  const [loadingApi, setLoadingApi] = useState(false);
  const [regexDialogOpen, setRegexDialogOpen] = useState(false);
  const [aiDialogOpen, setAIDialogOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loadingAiResponse, setLoadingAiResponse] = useState(false);

  useEffect(() => {
    // Convert transitions object to text format
    const transitionLines = Object.entries(automata.transitions)
      .map(([key, values]) => {
        const [state, symbol] = key.split(",");
        return values
          .map((target) => `${state},${symbol} → ${target}`)
          .join("\n");
      })
      .join("\n");
    setTransitionsText(transitionLines);

    // Update other fields
    setStates(automata.states.join(", "));
    setAlphabet(automata.alphabet.join(", "));
    setInitialState(automata.initialState);
    setAcceptingStates(automata.acceptingStates.join(", "));
  }, [automata]);

  function isValidRegex(pattern: string): boolean {
    try {
      new RegExp(pattern);
      return true;
    } catch (e) {
      return false;
    }
  }

  function parseAutomaton(
    raw: AutomatonResponseKey,
    type: "DFA" | "NFA"
  ): AutomataDefinition {
    const parseList = (text: string): string[] =>
      text
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const transitions: Record<string, string[]> = {};
    raw.Transitions.split("\n").forEach((line) => {
      const match = line.match(
        /^\s*(\w+)\s*,\s*(.*?)\s*(?:->|→)\s*qfrozenset\(\{?([^\}]+)\}?\)|^\s*(\w+)\s*,\s*(.*?)\s*(?:->|→)\s*(\w+)\s*$/
      );

      if (match) {
        // Match either qfrozenset style or normal transition
        if (match[1]) {
          // frozenset format: q0,a → qfrozenset({1})
          const fromState = match[1];
          const symbol = match[2] || ""; // can be ε
          const targets = match[3].split(",").map((s) => `q${s.trim()}`);
          const key = `${fromState},${symbol}`;
          transitions[key] = targets;
        } else if (match[4]) {
          // normal format: q0,a → q1
          const fromState = match[4];
          const symbol = match[5] || "";
          const toState = match[6];
          const key = `${fromState},${symbol}`;
          if (!transitions[key]) transitions[key] = [];
          transitions[key].push(toState);
        }
      }
    });

    return {
      type,
      states: parseList(raw.States),
      alphabet: parseList(raw.Alphabet),
      initialState: raw.Initial_State.trim(),
      acceptingStates: parseList(raw.Accepting_States),
      transitions,
    };
  }

const handleAiSubmit = async () => {
  if (!aiInput.trim()) return;

  setLoadingAiResponse(true);
  setAiResponse("");

  try {
    const res = await fetch("https://fa-editor-ai-api.vercel.app/ai-dfa-nfa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: aiInput }),
    });

    if (!res.ok) throw new Error("Failed to fetch AI response");

    const data: AutomatonResponse = await res.json();

    if (data?.dfa) {
      const parsed = parseAutomaton(data.dfa, "DFA");
      onChange(parsed); // <- Now using the NFA
      setAIDialogOpen(false);
    } else {
      setValidationErrors(["Invalid response from server"]);
    }
  } catch (err) {
    console.log("Error fetching AI response:", err);
    setAiResponse("Error fetching AI response");
    setValidationErrors(["Error fetching AI response"]);
  } finally {
    setLoadingAiResponse(false);
  }
};


  const handleConvertRegex = async () => {
    const isValid = isValidRegex(regex);
    if (!isValid) {
      setRegexExpError("Invalid regex pattern");
      return;
    }

    setRegexExpError("");
    setLoadingApi(true);

    try {
      const res = await fetch("https://fa-editor-ai-api.vercel.app/dfa-nfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ regex }),
      });

      if (!res.ok) throw new Error("Failed to convert regex");

      const data: AutomatonResponse = await res.json();
      if (data?.dfa) {
        const parsed = parseAutomaton(data.dfa, "DFA"); // or "NFA" if preferred
        onChange(parsed); // Update the full automata in parent
        setRegexDialogOpen(false);
      } else {
        setValidationErrors(["Invalid response from server"]);
      }
    } catch (error) {
      console.error("Error converting regex:", error);
      setValidationErrors(["Error converting regex to automaton"]);
      setRegexExpError("Server error while converting regex");
    } finally {
      setLoadingApi(false);
    }
  };

  const validateAutomaton = (newAutomata: AutomataDefinition): string[] => {
    const errors: string[] = [];

    // Check if initial state is in states list
    if (!newAutomata.states.includes(newAutomata.initialState)) {
      errors.push("Initial state must be one of the defined states");
    }

    // Check if accepting states are in states list
    for (const state of newAutomata.acceptingStates) {
      if (!newAutomata.states.includes(state)) {
        errors.push(`Accepting state "${state}" is not in the states list`);
      }
    }

    // Check transitions
    Object.entries(newAutomata.transitions).forEach(([key, targets]) => {
      const [fromState, symbol] = key.split(",");

      if (!newAutomata.states.includes(fromState)) {
        errors.push(`Transition from undefined state "${fromState}"`);
      }

      if (!newAutomata.alphabet.includes(symbol)) {
        errors.push(`Transition with undefined symbol "${symbol}"`);
      }

      targets.forEach((toState) => {
        if (!newAutomata.states.includes(toState)) {
          errors.push(`Transition to undefined state "${toState}"`);
        }
      });
    });

    // Check if DFA has exactly one transition for each state-symbol pair
    if (newAutomata.type === "DFA") {
      const stateSymbolPairs = new Set<string>();

      Object.entries(newAutomata.transitions).forEach(([key, targets]) => {
        if (stateSymbolPairs.has(key)) {
          errors.push(
            `Multiple transitions for state-symbol pair "${key}" in DFA`
          );
        }
        stateSymbolPairs.add(key);

        if (targets.length > 1) {
          errors.push(`Multiple target states for "${key}" in DFA`);
        }
      });

      // For DFA completeness check, only warn if it's not complete
      const missingTransitions: string[] = [];
      newAutomata.states.forEach((state) => {
        newAutomata.alphabet.forEach((symbol) => {
          const key = `${state},${symbol}`;
          if (!newAutomata.transitions[key]) {
            missingTransitions.push(key);
          }
        });
      });

      if (missingTransitions.length > 0) {
        errors.push(
          `DFA is incomplete. Missing transitions: ${missingTransitions.join(
            ", "
          )}`
        );
      }
    }

    return errors;
  };

  const handleUpdate = () => {
    try {
      const stateList = states
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      const alphabetList = alphabet
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      const acceptingStatesList = acceptingStates
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);

      // Parse transitions
      const transitions: { [key: string]: string[] } = {};
      const transitionLines = transitionsText
        .split("\n")
        .filter((line) => line.trim());

      for (const line of transitionLines) {
        // Handle both -> and → arrow symbols
        const match = line.match(
          /^\s*(\w+)\s*,\s*(.+?)\s*(?:->|→)\s*(\w+)\s*$/
        );
        if (match) {
          const [, fromState, symbol, toState] = match;
          const key = `${fromState},${symbol}`;
          if (!transitions[key]) {
            transitions[key] = [];
          }
          transitions[key].push(toState);
        }
      }

      const newAutomata: AutomataDefinition = {
        type: automata.type,
        states: stateList,
        alphabet: alphabetList,
        transitions,
        initialState,
        acceptingStates: acceptingStatesList,
      };

      // Validate automaton
      const errors = validateAutomaton(newAutomata);
      setValidationErrors(errors);

      // Always update the automaton, even with warnings
      onChange(newAutomata);
    } catch (error) {
      console.error("Error parsing automata definition:", error);
      setValidationErrors(["Error parsing automaton definition"]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="w-full p-2  flex  gap-2 flex-wrap">
        <Dialog open={regexDialogOpen} onOpenChange={setRegexDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="border-purple-600 border-2">Convert Regex to NFA/DFA</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Convert Regex to NFA/DFA</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Regex
                </Label>
                <Input
                  id="Regex"
                  type="text"
                  className="col-span-3"
                  onChange={(e) => setRegex(e.target.value)}
                  placeholder="Enter regex here"
                  value={regex}
                />
                {regexExpError && (
                  <p className="text-sm text-red-500 col-span-4 text-center mt-1">
                    {regexExpError}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleConvertRegex} className="bg-gradient-to-r from-cyan-500 to-purple-600">
                {loadingApi ? "Loading..." : "Get DFA/NFA"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* ----- Ai ------*/}
        <Dialog open={aiDialogOpen} onOpenChange={setAIDialogOpen}>
          <DialogTrigger asChild>
            <Button type="button" className="bg-gradient-to-r from-cyan-500 to-purple-600" onClick={() => setAIDialogOpen(true)}>
              AI ✨
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ask AI a Question</DialogTitle>
              <DialogDescription>
                Type a question about finite automata, regular expressions, or
                anything related. The AI will try to provide you with DFA or
                NFA.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Textarea
                placeholder="e.g., Design a DFA that accepts all strings over the alphabet {a, b} where the string contains zero or more 'a's followed by exactly one 'b' at the end."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                rows={3}
              />
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-600" onClick={handleAiSubmit} disabled={loadingAiResponse}>
                {loadingAiResponse ? "Thinking..." : "Ask"}
              </Button>
              {aiResponse && (
                <div className="border p-3 rounded bg-muted text-sm whitespace-pre-wrap">
                  {aiResponse}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div>
        <Label htmlFor="type">Type</Label>
        <Select
          value={automata.type}
          onValueChange={(value: "DFA" | "NFA") =>
            onChange({ ...automata, type: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="DFA">DFA (Deterministic)</SelectItem>
            <SelectItem value="NFA">NFA (Non-deterministic)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="states">States (comma-separated)</Label>
        <Input
          id="states"
          value={states}
          onChange={(e) => setStates(e.target.value)}
          placeholder="q0, q1, q2"
        />
      </div>

      <div>
        <Label htmlFor="alphabet">Alphabet (comma-separated)</Label>
        <Input
          id="alphabet"
          value={alphabet}
          onChange={(e) => setAlphabet(e.target.value)}
          placeholder="0, 1, a, b"
        />
      </div>

      <div>
        <Label htmlFor="initial">Initial State</Label>
        <Select value={initialState} onValueChange={setInitialState}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {automata.states.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="accepting">Accepting States (comma-separated)</Label>
        <Input
          id="accepting"
          value={acceptingStates}
          onChange={(e) => setAcceptingStates(e.target.value)}
          placeholder="q1, q2"
        />
      </div>

      <div>
        <Label htmlFor="transitions">
          Transitions (one per line: state,symbol → target)
        </Label>
        <Textarea
          id="transitions"
          value={transitionsText}
          onChange={(e) => setTransitionsText(e.target.value)}
          placeholder="q0,0 → q1&#10;q0,1 → q0&#10;q1,0 → q2"
          rows={8}
          className="font-mono"
        />
      </div>

      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <Button onClick={handleUpdate} className="w-full">
        Update Automaton
      </Button>
    </div>
  );
}

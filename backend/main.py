from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from automata.fa.nfa import NFA
from automata.fa.dfa import DFA
from typing import Dict, Any
import uvicorn

from ai import generate_regex_from_natural_language  # Importing from ai.py

app = FastAPI(
    title="Regex Pattern Simulator API",
    description="API for simulating regex patterns using automata theory",
    version="1.0.0"
)

# ---------- Middleware for CORS ----------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace "*" with frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Pydantic Models ----------

class RegexTestRequest(BaseModel):
    regex: str

class DFANFAJsonUIResponse(BaseModel):
    States: str
    Alphabet: str
    Initial_State: str
    Accepting_States: str
    Transitions: str

class RegexToDFaNFAResponse(BaseModel):
    dfa: DFANFAJsonUIResponse
    nfa: DFANFAJsonUIResponse

class AIRegexRequest(BaseModel):
    description: str

# ---------- Utility Functions ----------

def build_nfa_from_regex(regex: str) -> NFA:
    """Build NFA from regular expression"""
    try:
        return NFA.from_regex(regex)
    except AttributeError:
        raise NotImplementedError("NFA.from_regex is not implemented in automata-lib.")

def convert_nfa_to_dfa(nfa: NFA) -> DFA:
    """Convert NFA to DFA"""
    return DFA.from_nfa(nfa)

def convert_dfa_nfa_json_to_ui_format(dfa_json: Dict[str, Any]) -> Dict[str, str]:
    """Convert DFA/NFA JSON to UI-friendly format"""
    # Convert states and alphabet to comma-separated strings
    states = ', '.join([f"q{str(state)}" for state in dfa_json['states']])
    alphabet = ', '.join(map(str, dfa_json['alphabet']))

    # Convert start state and accepting states
    initial_state = f"q{str(dfa_json['start_state'])}"
    accepting_states = ', '.join([f"q{str(state)}" for state in dfa_json['final_states']])

    # Convert transitions
    transitions = []
    for from_state, symbol_map in dfa_json['transitions'].items():
        for symbol, to_state in symbol_map.items():
            transition_line = f"q{str(from_state)},{symbol} → q{str(to_state)}"
            transitions.append(transition_line)
    transitions_str = '\n'.join(transitions)

    return {
        "States": states,
        "Alphabet": alphabet,
        "Initial_State": initial_state,
        "Accepting_States": accepting_states,
        "Transitions": transitions_str
    }


def regex_to_dfa_nfa(regex: str) -> Dict[str, Any]:
    """Convert regex to DFA and NFA JSON format"""
    nfa = build_nfa_from_regex(request.regex)
    dfa = convert_nfa_to_dfa(nfa)

    nfa_json = {
            "states": list(nfa.states),
            "alphabet": list(nfa.input_symbols),
            "start_state": nfa.initial_state,
            "final_states": list(nfa.final_states),
            "transitions": nfa.transitions
        }

    dfa_json = {
            "states": list(dfa.states),
            "alphabet": list(dfa.input_symbols),
            "start_state": dfa.initial_state,
            "final_states": list(dfa.final_states),
            "transitions": dfa.transitions
        }

    dfa_ui = convert_dfa_nfa_json_to_ui_format(dfa_json)
    nfa_ui = convert_dfa_nfa_json_to_ui_format(nfa_json)

    return {
            "dfa": dfa_ui,
            "nfa": nfa_ui
    }

   


# ---------- API Endpoints ----------

@app.get("/")
async def root():
    return {
        "message": "Regex Pattern Simulator API",
        "version": "1.0.0",
        "endpoints": {
            "dfa-nfa": "POST /dfa-nfa",
            "health": "GET /health"
        }
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/dfa-nfa", response_model=RegexToDFaNFAResponse)
async def regex_to_dfa_nfa_api(request: RegexTestRequest):
    if not request.regex.strip():
        raise HTTPException(status_code=400, detail="Regex pattern is required")

    try:
        
        dfa_nfa = regex_to_dfa_nfa(request.regex)

        return RegexToDFaNFAResponse(
            dfa=DFANFAJsonUIResponse(**dfa_nfa['dfa']),
            nfa=DFANFAJsonUIResponse(**dfa_nfa['nfa'])
        )

    except NotImplementedError as nie:
        raise HTTPException(status_code=501, detail=str(nie))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")


@app.post("/ai-dfa-nfa", response_model=RegexToDFaNFAResponse)
async def generate_dfa_nfa_from_description(request: AIRegexRequest):
    if not request.description.strip():
        raise HTTPException(status_code=400, detail="Description is required")

    try:
        # Step 1: Get regex from Gemini
        regex = generate_regex_from_natural_language(request.description)

        dfa_nfa = regex_to_dfa_nfa(regex)

        return RegexToDFaNFAResponse(
            dfa=DFANFAJsonUIResponse(**dfa_nfa['dfa']),
            nfa=DFANFAJsonUIResponse(**dfa_nfa['nfa'])
        )

    except NotImplementedError as nie:
        raise HTTPException(status_code=501, detail=str(nie))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Simulation error: {str(e)}")

# ---------- Run Server ----------

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

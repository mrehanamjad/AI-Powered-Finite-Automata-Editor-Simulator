# AI Powered Finite Automata Editor & Simulator
AI Powered Finite Autometa Editor and Simulator | Design, visualize, and simulate Deterministic and Non-deterministic Finite Automata | Convert Regex to DFA and NFA | ***AI Assistant for Finite Automata***

---

## 🔍 Introduction

**FA-Editor-AI** is a web-based platform that empowers users to:

- Design and simulate **DFA** and **NFA**
- Convert **regular expressions** to **DFA** and **NFA**
- Use a built-in **AI assistant** to generate automata from natural language prompts

Whether you're a student, teacher, or enthusiast, this tool simplifies complex automata concepts through an intuitive and interactive interface.

---

## ✨ Features

- 🧠 **Natural Language to Automata With AI**  
  Ask ***AI***: _"Create a DFA that accepts binary numbers divisible by 3"_ — and instantly get the diagram.

- 🔁 **Regex to DFA/NFA Conversion**  
  Enter a regex and get both DFA and NFA diagrams with state transitions.

- 🎨 **Visual FA Designer**  
  Manually draw and simulate FA with transitions, states, start and accepting states.

- 🖼️ **Export Diagrams**  
  Export your automaton designs as high-quality images and also as json.

---

## 🚀 Tech Stack

### 🔧 Frontend (Next.js + TailwindCSS + Radix UI)
- **Framework:** Next.js 15
- **Styling:** TailwindCSS, TailwindCSS Animate
- **UI Components:** Radix UI, Lucide React, Sonner
- **Form Handling:** React Hook Form, Zod
- **Carousel & Charts:** Embla Carousel, Recharts
- **Dark Mode:** Next Themes

### ⚙️ Backend (FastAPI + LangChain + Python)
- **API Server:** FastAPI
- **AI Logic:** LangChain + Gemini API
- **Regex to DFA/NFA:** automata-lib
- **Diagram Export:** SVG/Image generation

---
## 📦 NPM Dependencies Summary

- **UI:** `@radix-ui/*`, `lucide-react`, `clsx`, `cmdk`, `react-resizable-panels`
- **Forms:** `react-hook-form`, `zod`, `@hookform/resolvers`
- **Carousel/Charts:** `embla-carousel-react`, `recharts`
- **Styling:** `tailwindcss`, `tailwindcss-animate`, `autoprefixer`, `tailwind-merge`
- **UX Enhancements:** `sonner`, `vaul`, `react-day-picker`, `date-fns`

---
Diployed links: https://fa-editor-ai.vercel.app/

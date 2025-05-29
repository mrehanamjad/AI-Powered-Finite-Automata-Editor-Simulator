import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FA-Editor-AI',
  description: 'AI Powered Finite Autometa Editor and Simulator | Design, visualize, and simulate Deterministic and Non-deterministic Finite Automata | Convert Regex to DFA and NFA | AI Assistant for Finite Automata',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

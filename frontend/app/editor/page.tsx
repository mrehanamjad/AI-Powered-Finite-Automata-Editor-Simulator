"use client";
import AutomataVisualizer from "@/components/automata-visualizer";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ThemeProvider } from "@/components/theme-provider";

export default function Page() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="automata-theme">
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
        <div className="container mx-auto py-8 px-4">
        
          <AutomataVisualizer />
        </div>
        <Footer />
      </div>
    </ThemeProvider>
  );
}

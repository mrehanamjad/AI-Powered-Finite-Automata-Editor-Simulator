"use client"
import React, { useState, useEffect } from 'react';
import { Play, Zap, Brain, Code, ArrowRight, CheckCircle, Star, Menu, X, Github, Twitter, Linkedin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const AutomataLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      title: "Visual DFA/NFA Design",
      description: "Intuitive drag-and-drop interface to create complex automata",
      icon: <Play className="w-6 h-6 text-cyan-400" />,
      imgSrc: "/visual.png"
    },
    {
      title: "AI-Powered Generation",
      description: "Ask questions in natural language and get instant automata diagrams",
      icon: <Brain className="w-6 h-6 text-purple-400" />,
      imgSrc: "/aigen.png",
    },
    {
      title: "Regex Conversion",
      description: "Seamlessly convert regular expressions to DFA/NFA",
      icon: <Code className="w-6 h-6 text-pink-400" />,
      imgSrc: "/regexConvertor.png",
    },
    {
      title: "Real-time Simulation",
      description: "Test your automata with step-by-step execution visualization",
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      imgSrc: "/simulation.png",
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              FA-EDITOR-AI
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-cyan-400 transition-colors">Features</button>
            <button onClick={() => document.getElementById('demo')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-cyan-400 transition-colors">Demo</button>
            <button onClick={() => document.getElementById('about')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-cyan-400 transition-colors">About</button>
            <Link href="/editor" className="">
            <button className="bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-2 rounded-full hover:shadow-lg hover:shadow-purple-500/25 transition-all transform hover:scale-105">
              Try Now
            </button>
            </Link>
          </div>

          <button 
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-slate-800/95 backdrop-blur-md z-40 p-6">
          <div className="flex flex-col space-y-4">
            <button onClick={() => document.getElementById('features')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-cyan-400 transition-colors">Features</button>
            <button onClick={() => document.getElementById('demo')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-cyan-400 transition-colors">Demo</button>
            <button onClick={() => document.getElementById('about')?.scrollIntoView({behavior: 'smooth'})} className="hover:text-cyan-400 transition-colors">About</button>
            <button className="bg-gradient-to-r from-cyan-500 to-purple-600 px-6 py-2 rounded-full w-full">
              Try Now
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-sm">AI-Powered Automata Design</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Design <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Finite Automata</span> with Intelligence
            </h1>
            
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              The first AI-powered platform to design, visualize, and simulate Deterministic and Non-deterministic Finite Automata. 
              Convert regex to DFA/NFA and ask questions in natural language to generate diagrams instantly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button className="group bg-gradient-to-r from-cyan-500 to-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-purple-500/25 transition-all transform hover:scale-105 flex items-center space-x-2">
              <span>Start Creating</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Feature Showcase */}
          <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="text-left">
                <h3 className="text-2xl font-bold mb-4">{features[currentFeature].title}</h3>
                <p className="text-slate-300 mb-6">{features[currentFeature].description}</p>
                <div className="flex items-center space-x-4">
                  {features[currentFeature].icon}
                  <span className="text-sm text-cyan-400">Feature {currentFeature + 1} of {features.length}</span>
                </div>
              </div>
              <div className="relative">
                <div className="bg-slate-700/50 rounded-lg p-6 h-64 flex items-center justify-center">
                  <Image 
                    alt='feature-diagram-image' 
                    src={features[currentFeature].imgSrc} 
                    width={500} 
                    height={300} 
                    className='w-full h-full object-cover rounded-lg'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Everything you need to master finite automata theory and practice
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 hover:bg-slate-800/60 transition-all transform hover:scale-105 hover:shadow-xl border border-slate-700/50"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Chat Demo */}
      <section id="demo" className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Ask AI, Get Automata</h2>
            <p className="text-xl text-slate-300">
              Simply describe what you want in natural language
            </p>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
            <div className="grid lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-semibold mb-6">Natural Language Input</h3>
                <div className="bg-slate-900/50 rounded-lg p-6 mb-6">
                  <p className="text-slate-300 italic">
                    "Design a DFA that accepts all strings over the alphabet a, b where the string contains zero or more 'a's followed by exactly one 'b' at the end."
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-cyan-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>AI processes your request</span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-6">Generated Automaton</h3>
                <div className="bg-slate-900/50 rounded-lg p-6 h-48 flex items-center justify-center">
                  <div className="w-full h-full">
                    <Image alt='ai-generated-diagram-image' src={'/ai-generated-diagramimage.png'} width={1000} height={500} className='w-full h-full' />
                    
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-2xl p-12 border border-cyan-500/30">
            <h2 className="text-4xl font-bold mb-6">Ready to Master Automata Theory?</h2>
            <p className="text-xl text-slate-300 mb-8">
              Join thousands of students and professionals using FA-EDITOR-AI to learn and teach finite automata
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/editor" className="">
              <button className="bg-gradient-to-r from-cyan-500 to-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl hover:shadow-purple-500/25 transition-all transform hover:scale-105">
                Get Start 
              </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">FA-EDITOR-AI</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="https://github.com/mrehanamjad/" className="text-slate-400 hover:text-cyan-400 transition-colors">
                <Github className="w-5 h-5" />
              </Link>
              <Link href="https://www.linkedin.com/in/mrehanamjad/" className="text-slate-400 hover:text-cyan-400 transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="http://x.com/m_rrehanamjad" className="text-slate-400 hover:text-cyan-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <span className="text-slate-400">© 2025 FA-EDITOR-AI. All rights reserved.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AutomataLanding;
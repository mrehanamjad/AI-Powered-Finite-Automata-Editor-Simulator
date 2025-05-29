import { Github,  Linkedin, Twitter, Zap } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

function Footer() {
  return (
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
  )
}

export default Footer
import { Github, Linkedin, Twitter, Zap } from "lucide-react";
import Link from "next/link";
import React from "react";

function Header() {
  return (
    <nav className="relative z-50 px-6 py-4 bg-gradient-to-b from-cyan-200 ">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            FA-EDITOR-AI
          </span>
        </div>

        <div className="hidden sm:flex items-center space-x-4">
          <Link
            href="https://github.com/mrehanamjad/"
            className="text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <Github className="w-5 h-5" />
          </Link>
          <Link
            href="https://www.linkedin.com/in/mrehanamjad/"
            className="text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <Linkedin className="w-5 h-5" />
          </Link>
          <Link
            href="http://x.com/m_rrehanamjad"
            className="text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <Twitter className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Header;

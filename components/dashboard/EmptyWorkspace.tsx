'use client'

import { Lightbulb, Sparkles, Code, Shield, Rocket } from 'lucide-react'

export default function EmptyWorkspace() {
  const handleStartBuilding = () => {
    // TODO: Route to VettCode Vibe when available
    alert('VettCode Vibe integration coming soon!')
  }

  const handleCreateManually = () => {
    // TODO: Route to manual project creation when available
    alert('Manual project creation coming soon!')
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl p-8 md:p-12 text-center">
        {/* Main Message */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            Your workspace is ready
          </h2>
          <p className="text-lg text-gray-300">
            Every application starts with an idea. Start building something real with VettCode.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={handleStartBuilding}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>Start with VettCode Vibe</span>
          </button>
          
          <button
            onClick={handleCreateManually}
            className="w-full sm:w-auto px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-lg transition-colors"
          >
            Create a project manually
          </button>
        </div>

        {/* Lifecycle Visualization */}
        <div className="inline-flex items-center gap-3 px-6 py-4 bg-gray-950/50 border border-gray-700 rounded-xl">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-gray-300">IDEA</span>
          </div>
          
          <div className="w-8 h-px bg-gradient-to-r from-purple-500 to-purple-400" />
          
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-green-600/20 border border-green-500/30 flex items-center justify-center">
              <Code className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-300">CODE</span>
          </div>
          
          <div className="w-8 h-px bg-gradient-to-r from-green-500 to-green-400" />
          
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-300">SECURE</span>
          </div>
          
          <div className="w-8 h-px bg-gradient-to-r from-blue-500 to-blue-400" />
          
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-orange-600/20 border border-orange-500/30 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-sm font-medium text-gray-300">SHIP</span>
          </div>
        </div>

        {/* Mobile Lifecycle */}
        <div className="sm:hidden flex flex-col items-center gap-3 px-6 py-4 bg-gray-950/50 border border-gray-700 rounded-xl mt-8">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
              <Lightbulb className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-gray-300">IDEA</span>
          </div>
          
          <div className="w-px h-6 bg-gradient-to-b from-purple-500 to-green-500 ml-5" />
          
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-lg bg-green-600/20 border border-green-500/30 flex items-center justify-center flex-shrink-0">
              <Code className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm font-medium text-gray-300">CODE</span>
          </div>
          
          <div className="w-px h-6 bg-gradient-to-b from-green-500 to-blue-500 ml-5" />
          
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm font-medium text-gray-300">SECURE</span>
          </div>
          
          <div className="w-px h-6 bg-gradient-to-b from-blue-500 to-orange-500 ml-5" />
          
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-lg bg-orange-600/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
              <Rocket className="w-5 h-5 text-orange-400" />
            </div>
            <span className="text-sm font-medium text-gray-300">SHIP</span>
          </div>
        </div>
      </div>
    </div>
  )
}

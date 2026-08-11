'use client'

import { Plus } from 'lucide-react'

interface DashboardWelcomeProps {
  name: string
}

export default function DashboardWelcome({ name }: DashboardWelcomeProps) {
  const handleNewProject = () => {
    // TODO: Implement project creation when backend is ready
    alert('Project creation coming soon!')
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Welcome back, {name}
        </h1>
        <p className="text-lg text-gray-400">
          What are you building today?
        </p>
      </div>

      <button
        onClick={handleNewProject}
        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg shadow-purple-500/20"
      >
        <Plus className="w-5 h-5" />
        <span>New Project</span>
      </button>
    </div>
  )
}

'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'
import CreateProjectModal from './CreateProjectModal'

export default function ProjectsHeader() {
  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-gray-400">
            Organize your code, scans, and development work
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-semibold rounded-lg flex items-center gap-2 transition-all"
        >
          <Plus className="w-5 h-5" />
          New Project
        </button>
      </div>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false)
            window.location.reload()
          }}
        />
      )}
    </>
  )
}

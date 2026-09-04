'use client'

import { useEffect, useState } from 'react'
import { FolderKanban, Globe, Smartphone, Database, Package, MoreVertical, ExternalLink, Archive, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface Project {
  _id: string
  name: string
  description?: string
  type: string
  repository?: string
  language?: string
  framework?: string
  scanCount: number
  lastScanAt?: string
  status: string
  createdAt: string
  updatedAt: string
}

interface ProjectsListProps {
  userId: string
}

export default function ProjectsList({ userId }: ProjectsListProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('active')

  useEffect(() => {
    fetchProjects()
  }, [filter])

  const fetchProjects = async () => {
    try {
      const res = await fetch(`/api/projects?status=${filter === 'all' ? '' : filter}`)
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProjectIcon = (type: string) => {
    switch (type) {
      case 'web': return Globe
      case 'mobile': return Smartphone
      case 'api': return Database
      case 'library': return Package
      default: return FolderKanban
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'web': return 'text-blue-400 bg-blue-500/20'
      case 'mobile': return 'text-green-400 bg-green-500/20'
      case 'api': return 'text-purple-400 bg-purple-500/20'
      case 'library': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-800 rounded w-3/4 mb-4"></div>
            <div className="h-3 bg-gray-800 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-800 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
        <FolderKanban className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No projects yet</h3>
        <p className="text-gray-400 mb-6">
          Create your first project to start organizing your work
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 text-white font-semibold rounded-lg transition-all"
        >
          Create Project
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-3">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'active'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter('archived')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'archived'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          Archived
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-purple-600 text-white'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          All
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => {
          const Icon = getProjectIcon(project.type)
          const typeColor = getTypeColor(project.type)

          return (
            <Link
              key={project._id}
              href={`/dashboard/projects/${project._id}`}
              className="group bg-gray-900 border border-gray-800 hover:border-purple-500/50 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-purple-500/10"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeColor}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-gray-800 rounded-lg transition-all">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                {project.name}
              </h3>
              
              {project.description && (
                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {project.description}
                </p>
              )}

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                {project.language && (
                  <span className="flex items-center gap-1">
                    {project.language}
                  </span>
                )}
                {project.framework && (
                  <span className="flex items-center gap-1">
                    {project.framework}
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <span className="text-sm text-gray-400">
                  {project.scanCount} {project.scanCount === 1 ? 'scan' : 'scans'}
                </span>
                {project.repository && (
                  <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors" />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

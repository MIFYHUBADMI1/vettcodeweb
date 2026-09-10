'use client'

import { ExternalLink, Globe, Lightbulb, PlusCircle, Clock, Hammer, ArrowRight } from 'lucide-react'
import type { MirrorSiteProject, MirrorSiteProjectsResult } from '@/lib/mirrorsite'
import { mirrorSiteStateLabel, mirrorSiteStateColor } from '@/lib/mirrorsite'

const MIRRORSITE_URL = 'https://mirrorsite.atai.ink'

function formatRelativeTime(ms: number): string {
  const diff = Date.now() - ms
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function StateBadge({ state }: { state: string }) {
  const label = mirrorSiteStateLabel(state)
  const color = mirrorSiteStateColor(state)

  const bgMap: Record<string, string> = {
    'text-green-400': 'bg-green-500/10 border-green-500/20',
    'text-yellow-400': 'bg-yellow-500/10 border-yellow-500/20',
    'text-red-400': 'bg-red-500/10 border-red-500/20',
    'text-gray-400': 'bg-gray-500/10 border-gray-500/20',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color} ${bgMap[color] ?? 'bg-gray-500/10 border-gray-500/20'}`}>
      {state === 'building' || state === 'deploying' ? (
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 mr-1.5 animate-pulse" />
      ) : null}
      {label}
    </span>
  )
}

function ProjectCard({ project }: { project: MirrorSiteProject }) {
  const Icon = project.mode === 'website' ? Globe : Lightbulb

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group bg-gray-900 border border-gray-800 hover:border-violet-500/50 rounded-xl p-6 transition-all hover:shadow-lg hover:shadow-violet-500/10 flex flex-col gap-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="w-11 h-11 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-violet-400" />
        </div>
        <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-violet-400 transition-colors flex-shrink-0 mt-0.5" />
      </div>

      {/* Name + source */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-white group-hover:text-violet-300 transition-colors truncate mb-1">
          {project.name}
        </h3>
        {project.sourceUrl && (
          <p className="text-xs text-gray-500 truncate">{project.sourceUrl}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-800">
        <StateBadge state={project.state} />
        <span className="flex items-center gap-1 text-xs text-gray-600">
          <Clock className="w-3 h-3" />
          {formatRelativeTime(project.updatedAt)}
        </span>
      </div>
    </a>
  )
}

interface MirrorSiteProjectsPageProps {
  data: MirrorSiteProjectsResult | null
}

export default function MirrorSiteProjectsPage({ data }: MirrorSiteProjectsPageProps) {
  const newProjectUrl = data?.newProjectUrl ?? `${MIRRORSITE_URL}/new`
  const dashboardUrl = data?.mirrorSiteUrl ?? `${MIRRORSITE_URL}/dashboard`
  const projects = data?.projects ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Hammer className="w-6 h-6 text-violet-400" />
            <h1 className="text-3xl font-bold text-white">Projects</h1>
          </div>
          <p className="text-gray-400">
            Your applications built with{' '}
            <a
              href={dashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              MirrorSite AI
            </a>
          </p>
        </div>

        <a
          href={newProjectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          New Project
        </a>
      </div>

      {/* Not configured */}
      {data === null && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 text-yellow-300 text-sm">
          MirrorSite integration is not configured. Add <code className="font-mono bg-yellow-500/10 px-1 rounded">MIRRORSITE_API_URL</code> and <code className="font-mono bg-yellow-500/10 px-1 rounded">ATAI_INTERNAL_KEY</code> to your <code className="font-mono bg-yellow-500/10 px-1 rounded">.env</code> file and restart the server.
        </div>
      )}

      {/* Empty state */}
      {data !== null && projects.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-16 text-center">
          <Hammer className="w-14 h-14 text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No projects yet</h2>
          <p className="text-gray-400 mb-8 max-w-sm mx-auto">
            Turn an idea or an existing website into a full application with MirrorSite AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={`${MIRRORSITE_URL}/new/idea`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              Start from an idea
            </a>
            <a
              href={`${MIRRORSITE_URL}/new/website`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4" />
              Mirror a website
            </a>
          </div>
        </div>
      )}

      {/* Projects grid */}
      {projects.length > 0 && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>

          <div className="flex items-center justify-center pt-2">
            <a
              href={dashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-violet-400 transition-colors"
            >
              View all projects on MirrorSite AI
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </>
      )}
    </div>
  )
}

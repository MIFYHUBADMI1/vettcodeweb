import Link from 'next/link'
import { ExternalLink, Hammer, PlusCircle, Globe, Lightbulb, ArrowRight, Clock } from 'lucide-react'
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

function ProjectRow({ project }: { project: MirrorSiteProject }) {
  const Icon = project.mode === 'website' ? Globe : Lightbulb
  const stateColor = mirrorSiteStateColor(project.state)
  const stateLabel = mirrorSiteStateLabel(project.state)

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between gap-4 px-4 py-3 rounded-lg hover:bg-gray-800/60 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-violet-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate group-hover:text-violet-300 transition-colors">
            {project.name}
          </p>
          {project.sourceUrl && (
            <p className="text-xs text-gray-500 truncate">{project.sourceUrl}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-1 text-xs text-gray-500">
          <Clock className="w-3 h-3" />
          {formatRelativeTime(project.updatedAt)}
        </div>
        <span className={`text-xs font-medium ${stateColor}`}>{stateLabel}</span>
        <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-violet-400 transition-colors" />
      </div>
    </a>
  )
}

interface MirrorSiteProjectsCardProps {
  data: MirrorSiteProjectsResult | null
}

export default function MirrorSiteProjectsCard({ data }: MirrorSiteProjectsCardProps) {
  const newProjectUrl = data?.newProjectUrl ?? `${MIRRORSITE_URL}/new`
  const dashboardUrl = data?.mirrorSiteUrl ?? `${MIRRORSITE_URL}/dashboard`
  const projects = data?.projects ?? []

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Hammer className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-bold text-white">MirrorSite AI Projects</h2>
          <span className="text-xs px-2 py-0.5 bg-violet-500/15 text-violet-300 rounded-full border border-violet-500/20">
            Build layer
          </span>
        </div>
        <a
          href={dashboardUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-violet-300 transition-colors"
        >
          Open MirrorSite <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Body */}
      <div className="px-2 py-2">
        {projects.length === 0 ? (
          /* Empty state */
          <div className="py-8 text-center">
            <Hammer className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-1">No projects built yet</p>
            <p className="text-xs text-gray-600 mb-5">
              Turn an idea or website into a full application with MirrorSite AI.
            </p>
            <a
              href={newProjectUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Start building
            </a>
          </div>
        ) : (
          /* Project list */
          <>
            <div className="divide-y divide-gray-800/50">
              {projects.slice(0, 5).map((p) => (
                <ProjectRow key={p.id} project={p} />
              ))}
            </div>
            <div className="pt-3 pb-1 px-4 flex items-center justify-between">
              {projects.length > 5 && (
                <a
                  href={dashboardUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  +{projects.length - 5} more projects
                </a>
              )}
              <a
                href={newProjectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                New project
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

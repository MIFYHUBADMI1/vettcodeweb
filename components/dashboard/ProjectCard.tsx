'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import ProjectLifecycle, { BuildStatus, SecureStatus, ShipStatus } from './ProjectLifecycle'

interface ProjectCardProps {
  id: string
  name: string
  lastUpdated: string
  buildStatus: BuildStatus
  secureStatus: SecureStatus
  shipStatus: ShipStatus
}

export default function ProjectCard({
  id,
  name,
  lastUpdated,
  buildStatus,
  secureStatus,
  shipStatus
}: ProjectCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all hover:shadow-lg hover:shadow-purple-500/10 group">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-purple-400 transition-colors">
              {name}
            </h3>
            <p className="text-sm text-gray-400">
              Updated {lastUpdated}
            </p>
          </div>
        </div>

        {/* Lifecycle Status */}
        <div className="py-4 border-t border-gray-800">
          <ProjectLifecycle
            buildStatus={buildStatus}
            secureStatus={secureStatus}
            shipStatus={shipStatus}
            variant="horizontal"
          />
        </div>

        {/* Action */}
        <div className="flex items-center justify-end pt-2 border-t border-gray-800">
          <Link
            href={`/dashboard/projects/${id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span>Open Project</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  )
}

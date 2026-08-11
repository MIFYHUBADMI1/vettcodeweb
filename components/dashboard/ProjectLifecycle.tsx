'use client'

import { CheckCircle, AlertTriangle, Circle, Code, Shield, Rocket } from 'lucide-react'
import clsx from 'clsx'

export type LifecycleStage = 'build' | 'secure' | 'ship'

export type BuildStatus = 'not-started' | 'in-progress' | 'ready'
export type SecureStatus = 'not-scanned' | 'scan-required' | 'issues-found' | 'secure'
export type ShipStatus = 'not-deployed' | 'deployment-pending' | 'online' | 'deployment-failed'

interface ProjectLifecycleProps {
  buildStatus: BuildStatus
  secureStatus: SecureStatus
  shipStatus: ShipStatus
  variant?: 'horizontal' | 'vertical'
  compact?: boolean
}

export default function ProjectLifecycle({
  buildStatus,
  secureStatus,
  shipStatus,
  variant = 'horizontal',
  compact = false
}: ProjectLifecycleProps) {
  const getBuildConfig = () => {
    switch (buildStatus) {
      case 'ready':
        return { icon: CheckCircle, label: 'Ready', color: 'text-green-400', bgColor: 'bg-green-600/20', borderColor: 'border-green-500/30' }
      case 'in-progress':
        return { icon: Code, label: 'In progress', color: 'text-blue-400', bgColor: 'bg-blue-600/20', borderColor: 'border-blue-500/30' }
      case 'not-started':
      default:
        return { icon: Circle, label: 'Not started', color: 'text-gray-400', bgColor: 'bg-gray-600/20', borderColor: 'border-gray-500/30' }
    }
  }

  const getSecureConfig = () => {
    switch (secureStatus) {
      case 'secure':
        return { icon: CheckCircle, label: 'Secure', color: 'text-green-400', bgColor: 'bg-green-600/20', borderColor: 'border-green-500/30' }
      case 'issues-found':
        return { icon: AlertTriangle, label: 'Issues found', color: 'text-yellow-400', bgColor: 'bg-yellow-600/20', borderColor: 'border-yellow-500/30' }
      case 'scan-required':
        return { icon: Shield, label: 'Scan required', color: 'text-orange-400', bgColor: 'bg-orange-600/20', borderColor: 'border-orange-500/30' }
      case 'not-scanned':
      default:
        return { icon: Circle, label: 'Not scanned', color: 'text-gray-400', bgColor: 'bg-gray-600/20', borderColor: 'border-gray-500/30' }
    }
  }

  const getShipConfig = () => {
    switch (shipStatus) {
      case 'online':
        return { icon: CheckCircle, label: 'Online', color: 'text-green-400', bgColor: 'bg-green-600/20', borderColor: 'border-green-500/30' }
      case 'deployment-pending':
        return { icon: Rocket, label: 'Deploying', color: 'text-blue-400', bgColor: 'bg-blue-600/20', borderColor: 'border-blue-500/30' }
      case 'deployment-failed':
        return { icon: AlertTriangle, label: 'Failed', color: 'text-red-400', bgColor: 'bg-red-600/20', borderColor: 'border-red-500/30' }
      case 'not-deployed':
      default:
        return { icon: Circle, label: 'Not deployed', color: 'text-gray-400', bgColor: 'bg-gray-600/20', borderColor: 'border-gray-500/30' }
    }
  }

  const build = getBuildConfig()
  const secure = getSecureConfig()
  const ship = getShipConfig()

  const BuildIcon = build.icon
  const SecureIcon = secure.icon
  const ShipIcon = ship.icon

  if (variant === 'vertical') {
    return (
      <div className="flex flex-col gap-3">
        {/* BUILD */}
        <div className="flex items-center gap-3">
          <div className={clsx(
            'flex items-center justify-center rounded-lg border',
            build.bgColor,
            build.borderColor,
            compact ? 'w-8 h-8' : 'w-10 h-10'
          )}>
            <BuildIcon className={clsx(build.color, compact ? 'w-4 h-4' : 'w-5 h-5')} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-gray-400 uppercase">Build</div>
            <div className={clsx('font-medium', build.color, compact ? 'text-sm' : 'text-base')}>
              {build.label}
            </div>
          </div>
        </div>

        {/* Connector */}
        <div className="w-px h-4 bg-gradient-to-b from-gray-600 to-gray-700 ml-5" />

        {/* SECURE */}
        <div className="flex items-center gap-3">
          <div className={clsx(
            'flex items-center justify-center rounded-lg border',
            secure.bgColor,
            secure.borderColor,
            compact ? 'w-8 h-8' : 'w-10 h-10'
          )}>
            <SecureIcon className={clsx(secure.color, compact ? 'w-4 h-4' : 'w-5 h-5')} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-gray-400 uppercase">Secure</div>
            <div className={clsx('font-medium', secure.color, compact ? 'text-sm' : 'text-base')}>
              {secure.label}
            </div>
          </div>
        </div>

        {/* Connector */}
        <div className="w-px h-4 bg-gradient-to-b from-gray-600 to-gray-700 ml-5" />

        {/* SHIP */}
        <div className="flex items-center gap-3">
          <div className={clsx(
            'flex items-center justify-center rounded-lg border',
            ship.bgColor,
            ship.borderColor,
            compact ? 'w-8 h-8' : 'w-10 h-10'
          )}>
            <ShipIcon className={clsx(ship.color, compact ? 'w-4 h-4' : 'w-5 h-5')} />
          </div>
          <div className="flex-1">
            <div className="text-xs font-semibold text-gray-400 uppercase">Ship</div>
            <div className={clsx('font-medium', ship.color, compact ? 'text-sm' : 'text-base')}>
              {ship.label}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Horizontal variant
  return (
    <div className="flex items-center gap-3">
      {/* BUILD */}
      <div className="flex items-center gap-2">
        <div className={clsx(
          'flex items-center justify-center rounded-lg border',
          build.bgColor,
          build.borderColor,
          compact ? 'w-7 h-7' : 'w-8 h-8'
        )}>
          <BuildIcon className={clsx(build.color, compact ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
        </div>
        <div>
          <div className={clsx('text-xs font-semibold text-gray-400 uppercase', compact && 'text-[10px]')}>
            Build
          </div>
          <div className={clsx('font-medium', build.color, compact ? 'text-xs' : 'text-sm')}>
            {build.label}
          </div>
        </div>
      </div>

      {/* Connector */}
      <div className="h-px flex-1 bg-gradient-to-r from-gray-600 to-gray-700 max-w-[40px]" />

      {/* SECURE */}
      <div className="flex items-center gap-2">
        <div className={clsx(
          'flex items-center justify-center rounded-lg border',
          secure.bgColor,
          secure.borderColor,
          compact ? 'w-7 h-7' : 'w-8 h-8'
        )}>
          <SecureIcon className={clsx(secure.color, compact ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
        </div>
        <div>
          <div className={clsx('text-xs font-semibold text-gray-400 uppercase', compact && 'text-[10px]')}>
            Secure
          </div>
          <div className={clsx('font-medium', secure.color, compact ? 'text-xs' : 'text-sm')}>
            {secure.label}
          </div>
        </div>
      </div>

      {/* Connector */}
      <div className="h-px flex-1 bg-gradient-to-r from-gray-600 to-gray-700 max-w-[40px]" />

      {/* SHIP */}
      <div className="flex items-center gap-2">
        <div className={clsx(
          'flex items-center justify-center rounded-lg border',
          ship.bgColor,
          ship.borderColor,
          compact ? 'w-7 h-7' : 'w-8 h-8'
        )}>
          <ShipIcon className={clsx(ship.color, compact ? 'w-3.5 h-3.5' : 'w-4 h-4')} />
        </div>
        <div>
          <div className={clsx('text-xs font-semibold text-gray-400 uppercase', compact && 'text-[10px]')}>
            Ship
          </div>
          <div className={clsx('font-medium', ship.color, compact ? 'text-xs' : 'text-sm')}>
            {ship.label}
          </div>
        </div>
      </div>
    </div>
  )
}

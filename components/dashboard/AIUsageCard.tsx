/**
 * AI Usage Card
 * Shows AI usage and plan information on the main dashboard
 */

'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react'

interface AIUsageCardProps {
  usage: {
    today: {
      requests: number
      remaining: number
    }
    thisMonth?: {
      requests: number
      remaining: number | null
    }
  }
  plan: {
    name: string
    tier: string
    dailyLimit: number
    monthlyLimit: number
  }
  isLoading?: boolean
}

export default function AIUsageCard({ usage, plan, isLoading }: AIUsageCardProps) {
  if (isLoading) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-700 rounded w-1/3 mb-4" />
        <div className="h-4 bg-gray-700 rounded w-1/2 mb-2" />
        <div className="h-2 bg-gray-700 rounded w-full mb-4" />
        <div className="h-4 bg-gray-700 rounded w-2/3" />
      </div>
    )
  }

  const dailyPercentage = (usage.today.requests / plan.dailyLimit) * 100
  const isLowUsage = dailyPercentage < 50
  const isMediumUsage = dailyPercentage >= 50 && dailyPercentage < 80
  const isHighUsage = dailyPercentage >= 80

  const getUsageColor = () => {
    if (isHighUsage) return 'text-orange-400'
    if (isMediumUsage) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getProgressBarColor = () => {
    if (isHighUsage) return 'bg-orange-500'
    if (isMediumUsage) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">AI Usage</h3>
            <p className="text-xs text-gray-400">{plan.name}</p>
          </div>
        </div>
        
        <Link
          href="/profile?tab=usage"
          className="text-xs text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
        >
          View Plan
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Daily Usage */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Today</span>
          <span className={`text-sm font-semibold ${getUsageColor()}`}>
            {usage.today.requests} / {plan.dailyLimit}
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full ${getProgressBarColor()} transition-all duration-500`}
            style={{ width: `${Math.min(dailyPercentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {usage.today.remaining} requests remaining
        </p>
      </div>

      {/* Monthly Usage (if applicable) */}
      {plan.monthlyLimit > 0 && usage.thisMonth && (
        <div className="pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">This Month</span>
            <span className="text-xs text-gray-300 font-medium">
              {usage.thisMonth.requests} / {plan.monthlyLimit}
            </span>
          </div>
        </div>
      )}

      {/* Upgrade CTA for free users */}
      {plan.tier === 'free' && isHighUsage && (
        <Link
          href="/profile?tab=subscription"
          className="mt-4 block text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 rounded-lg text-sm font-semibold transition-all"
        >
          <span className="flex items-center justify-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Upgrade for More
          </span>
        </Link>
      )}
    </div>
  )
}

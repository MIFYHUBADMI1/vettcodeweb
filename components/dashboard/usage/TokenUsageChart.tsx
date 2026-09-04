'use client'

import { BarChart3 } from 'lucide-react'

interface TokenUsageChartProps {
  userId: string
}

export default function TokenUsageChart({ userId }: TokenUsageChartProps) {
  // TODO: Implement actual chart with usage history
  // For now, show placeholder

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Usage History</h2>
      </div>

      <div className="flex items-center justify-center h-64 border border-gray-800 rounded-lg">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">Usage history chart coming soon</p>
          <p className="text-sm text-gray-500 mt-1">
            Track your daily token usage over time
          </p>
        </div>
      </div>
    </div>
  )
}

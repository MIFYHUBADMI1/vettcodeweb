/**
 * Refresh Button Component
 * Reusable button for manual data refresh
 */

'use client'

import { RefreshCw } from 'lucide-react'

interface RefreshButtonProps {
  onRefresh: () => void | Promise<void> | Promise<any>
  isRefreshing: boolean
  lastUpdated?: Date
}

export default function RefreshButton({ onRefresh, isRefreshing, lastUpdated }: RefreshButtonProps) {
  const handleRefresh = async () => {
    try {
      await onRefresh()
    } catch (error) {
      // Error handling is done by the query itself
      console.error('Refresh error:', error)
    }
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffSecs < 10) return 'just now'
    if (diffSecs < 60) return `${diffSecs} seconds ago`
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    
    const diffHours = Math.floor(diffMs / 3600000)
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <div className="flex items-center gap-3">
      {lastUpdated && (
        <span className="text-sm text-gray-400">
          Updated {getRelativeTime(lastUpdated)}
        </span>
      )}
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex items-center gap-2 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Refresh data"
      >
        <RefreshCw 
          className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
        />
        <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
      </button>
    </div>
  )
}

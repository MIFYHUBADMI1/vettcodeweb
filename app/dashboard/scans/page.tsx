/**
 * Security Scans Page - VettCode Security Report Library
 * /dashboard/scans
 * 
 * Displays user's scan history with search, filters, and sorting
 */

'use client'

import { useState, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import RefreshButton from '@/components/RefreshButton'
import ScansSummary from '@/components/dashboard/ScansSummary'
import ScanCard from '@/components/dashboard/ScanCard'
import { useScans } from '@/lib/hooks/useScans'
import { 
  Shield, 
  Clock,
  AlertCircle,
  CheckCircle,
  Terminal,
  ChevronRight,
  Search,
  X,
  Filter,
  ArrowUpDown
} from 'lucide-react'
import clsx from 'clsx'

type FilterType = 'all' | 'secure' | 'needs-attention' | 'critical'
type SortType = 'newest' | 'oldest' | 'most-critical' | 'most-issues'

export default function ScansPage() {
  const { data: session } = useSession()
  const { data, isLoading, error, refetch, dataUpdatedAt, isFetching } = useScans()

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortType>('newest')

  const scans = data?.scans || []

  // Filter scans based on search query
  const searchedScans = useMemo(() => {
    if (!searchQuery.trim()) return scans

    const query = searchQuery.toLowerCase()
    return scans.filter((scan) =>
      scan.scanPath.toLowerCase().includes(query)
    )
  }, [scans, searchQuery])

  // Filter scans based on active filter
  const filteredScans = useMemo(() => {
    switch (activeFilter) {
      case 'secure':
        return searchedScans.filter(
          (s) => s.criticalCount === 0 && s.highCount === 0
        )
      case 'needs-attention':
        return searchedScans.filter(
          (s) => s.mediumCount > 0 || s.lowCount > 0
        )
      case 'critical':
        return searchedScans.filter((s) => s.criticalCount > 0 || s.highCount > 0)
      default:
        return searchedScans
    }
  }, [searchedScans, activeFilter])

  // Sort scans
  const sortedScans = useMemo(() => {
    const sorted = [...filteredScans]

    switch (sortBy) {
      case 'oldest':
        return sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      case 'most-critical':
        return sorted.sort((a, b) => {
          const aScore = a.criticalCount * 100 + a.highCount * 10 + a.mediumCount
          const bScore = b.criticalCount * 100 + b.highCount * 10 + b.mediumCount
          return bScore - aScore
        })
      case 'most-issues':
        return sorted.sort((a, b) => b.totalFindings - a.totalFindings)
      case 'newest':
      default:
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }
  }, [filteredScans, sortBy])

  // Count for each filter
  const filterCounts = useMemo(() => {
    return {
      all: scans.length,
      secure: scans.filter((s) => s.criticalCount === 0 && s.highCount === 0).length,
      needsAttention: scans.filter((s) => s.mediumCount > 0 || s.lowCount > 0).length,
      critical: scans.filter((s) => s.criticalCount > 0 || s.highCount > 0).length,
    }
  }, [scans])

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 max-w-7xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Shield className="w-8 h-8 text-purple-400" />
                <h1 className="text-3xl font-bold text-white">Security Scans</h1>
              </div>
              <p className="text-gray-400">
                Your completed VettCode security reports. Review your scan history,
                understand your security status, and open detailed reports.
              </p>
            </div>

            {/* Refresh Button */}
            {!isLoading && scans.length > 0 && (
              <RefreshButton
                onRefresh={refetch}
                isRefreshing={isFetching}
                lastUpdated={new Date(dataUpdatedAt)}
              />
            )}
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {/* Summary Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-700 rounded w-1/2 mb-2" />
                  <div className="h-4 bg-gray-700 rounded w-1/3" />
                </div>
              ))}
            </div>

            {/* Scan Cards Skeleton */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 animate-pulse"
              >
                <div className="h-6 bg-gray-700 rounded w-1/3 mb-4" />
                <div className="h-4 bg-gray-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-6 text-red-400">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium">Failed to load scans</p>
                <p className="text-sm mt-1">
                  {error.message || "Couldn't load your security scans"}
                </p>
                <button
                  onClick={() => refetch()}
                  disabled={isFetching}
                  className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && scans.length === 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-12 text-center">
            <Terminal className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              No security scans yet
            </h3>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Your completed VettCode CLI scans will appear here. Run your first
              scan and your report will automatically appear in your VettCode
              account.
            </p>
            <div className="bg-gray-900/50 rounded-lg p-6 max-w-xl mx-auto text-left">
              <p className="text-sm text-gray-400 mb-3 font-medium">
                Quick Start:
              </p>
              <code className="block bg-black/50 rounded px-4 py-3 text-green-400 font-mono text-sm mb-4">
                $ vettcode login
                <br />
                $ vettcode scan .
              </code>
              <a
                href="https://github.com/MIFYHUBADMI1/vettcodeweb#cli"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
              >
                Learn About VettCode CLI
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!isLoading && !error && scans.length > 0 && (
          <>
            {/* Summary Dashboard */}
            <ScansSummary scans={scans} />

            {/* Search, Filters, and Sort */}
            <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search scans by path or project name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Filters and Sort */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {/* Filter Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setActiveFilter('all')}
                    className={clsx(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      activeFilter === 'all'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800 border border-gray-700'
                    )}
                  >
                    All <span className="text-xs opacity-75">({filterCounts.all})</span>
                  </button>
                  <button
                    onClick={() => setActiveFilter('secure')}
                    className={clsx(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      activeFilter === 'secure'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800 border border-gray-700'
                    )}
                  >
                    Secure{' '}
                    <span className="text-xs opacity-75">
                      ({filterCounts.secure})
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveFilter('needs-attention')}
                    className={clsx(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      activeFilter === 'needs-attention'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800 border border-gray-700'
                    )}
                  >
                    Needs Attention{' '}
                    <span className="text-xs opacity-75">
                      ({filterCounts.needsAttention})
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveFilter('critical')}
                    className={clsx(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                      activeFilter === 'critical'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800 border border-gray-700'
                    )}
                  >
                    Critical Issues{' '}
                    <span className="text-xs opacity-75">
                      ({filterCounts.critical})
                    </span>
                  </button>
                </div>

                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortType)}
                    className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="most-critical">Most Critical</option>
                    <option value="most-issues">Most Issues</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Scans List */}
            {sortedScans.length === 0 ? (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center">
                <Filter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">
                  No scans match your filters
                </h3>
                <p className="text-gray-400 mb-4">
                  Try adjusting your search or filter criteria
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setActiveFilter('all')
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedScans.map((scan) => (
                  <ScanCard key={scan.id} scan={scan} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

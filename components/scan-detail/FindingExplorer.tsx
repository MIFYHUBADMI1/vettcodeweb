/**
 * Finding Explorer Component
 * Search, filter, and paginated view of all findings
 */

'use client'

import { useState, useMemo } from 'react'
import { Search, X, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { Finding } from '@/lib/types'
import FindingCard from './FindingCard'
import clsx from 'clsx'

interface FindingExplorerProps {
  findings: Finding[]
  onFindingClick?: (finding: Finding) => void
}

type FilterType = 'all' | 'critical' | 'high' | 'medium' | 'low' | 'info'

const FINDINGS_PER_PAGE = 10

export default function FindingExplorer({ findings, onFindingClick }: FindingExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter findings based on search and filter
  const filteredFindings = useMemo(() => {
    let result = findings

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (f) =>
          f.title.toLowerCase().includes(query) ||
          f.message.toLowerCase().includes(query) ||
          f.file.toLowerCase().includes(query) ||
          f.metadata.ruleId?.toLowerCase().includes(query)
      )
    }

    // Apply filter
    if (activeFilter !== 'all') {
      const severityMap: Record<FilterType, Finding['severity'] | null> = {
        all: null,
        critical: 'CRITICAL',
        high: 'HIGH',
        medium: 'MEDIUM',
        low: 'LOW',
        info: 'INFO',
      }
      const severity = severityMap[activeFilter]
      if (severity) {
        result = result.filter((f) => f.severity === severity)
      }
    }

    return result
  }, [findings, searchQuery, activeFilter])

  // Pagination
  const totalPages = Math.ceil(filteredFindings.length / FINDINGS_PER_PAGE)
  const startIndex = (currentPage - 1) * FINDINGS_PER_PAGE
  const endIndex = startIndex + FINDINGS_PER_PAGE
  const paginatedFindings = filteredFindings.slice(startIndex, endIndex)

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1)
  }, [searchQuery, activeFilter])

  // Filter counts
  const filterCounts = useMemo(() => {
    return {
      all: findings.length,
      critical: findings.filter((f) => f.severity === 'CRITICAL').length,
      high: findings.filter((f) => f.severity === 'HIGH').length,
      medium: findings.filter((f) => f.severity === 'MEDIUM').length,
      low: findings.filter((f) => f.severity === 'LOW').length,
      info: findings.filter((f) => f.severity === 'INFO').length,
    }
  }, [findings])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of findings section
    document.getElementById('findings-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div id="findings-section" className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Filter className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-bold text-white">
            All Findings ({findings.length})
          </h2>
        </div>
        <p className="text-sm text-gray-400">
          Search, filter, and review all security issues found in your scan
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search findings by title, file, or rule..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-12 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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

      {/* Filter Buttons */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveFilter('all')}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeFilter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-900/50 text-gray-300 hover:bg-gray-900 border border-gray-700'
          )}
        >
          All <span className="text-xs opacity-75">({filterCounts.all})</span>
        </button>
        <button
          onClick={() => setActiveFilter('critical')}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeFilter === 'critical'
              ? 'bg-red-600 text-white'
              : 'bg-gray-900/50 text-gray-300 hover:bg-gray-900 border border-gray-700'
          )}
        >
          Critical <span className="text-xs opacity-75">({filterCounts.critical})</span>
        </button>
        <button
          onClick={() => setActiveFilter('high')}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeFilter === 'high'
              ? 'bg-orange-600 text-white'
              : 'bg-gray-900/50 text-gray-300 hover:bg-gray-900 border border-gray-700'
          )}
        >
          High <span className="text-xs opacity-75">({filterCounts.high})</span>
        </button>
        <button
          onClick={() => setActiveFilter('medium')}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeFilter === 'medium'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-900/50 text-gray-300 hover:bg-gray-900 border border-gray-700'
          )}
        >
          Medium <span className="text-xs opacity-75">({filterCounts.medium})</span>
        </button>
        <button
          onClick={() => setActiveFilter('low')}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeFilter === 'low'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-900/50 text-gray-300 hover:bg-gray-900 border border-gray-700'
          )}
        >
          Low <span className="text-xs opacity-75">({filterCounts.low})</span>
        </button>
        <button
          onClick={() => setActiveFilter('info')}
          className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium transition-all',
            activeFilter === 'info'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-900/50 text-gray-300 hover:bg-gray-900 border border-gray-700'
          )}
        >
          Info <span className="text-xs opacity-75">({filterCounts.info})</span>
        </button>
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between mb-4 text-sm text-gray-400">
        <span>
          Showing {startIndex + 1}–{Math.min(endIndex, filteredFindings.length)} of{' '}
          {filteredFindings.length} {filteredFindings.length === 1 ? 'finding' : 'findings'}
        </span>
        {totalPages > 1 && (
          <span>
            Page {currentPage} of {totalPages}
          </span>
        )}
      </div>

      {/* Findings List */}
      {paginatedFindings.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No findings match your search</h3>
          <p className="text-gray-400 mb-4">Try adjusting your search or filter criteria</p>
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
        <div className="space-y-4 mb-6">
          {paginatedFindings.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              onClick={() => onFindingClick?.(finding)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-gray-900/50 border border-gray-700 text-gray-300 hover:bg-gray-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number

              if (totalPages <= 7) {
                pageNum = i + 1
              } else if (currentPage <= 4) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 3) {
                pageNum = totalPages - 6 + i
              } else {
                pageNum = currentPage - 3 + i
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={clsx(
                    'w-10 h-10 rounded-lg text-sm font-medium transition-all',
                    currentPage === pageNum
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-900/50 border border-gray-700 text-gray-300 hover:bg-gray-900 hover:text-white'
                  )}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-gray-900/50 border border-gray-700 text-gray-300 hover:bg-gray-900 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            aria-label="Next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}

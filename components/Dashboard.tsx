'use client'

import { useState } from 'react'
import { ArrowLeft, Shield, AlertTriangle, Info } from 'lucide-react'
import { ScanResult, Finding } from '@/lib/types'
import FindingCard from './FindingCard'
import SummaryChart from './SummaryChart'

interface DashboardProps {
  scanData: ScanResult
  onReset: () => void
}

export default function Dashboard({ scanData, onReset }: DashboardProps) {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Filter findings
  const filteredFindings = scanData.findings.filter((f) => {
    if (selectedSeverity !== 'all' && f.severity !== selectedSeverity) return false
    if (selectedCategory !== 'all' && f.category !== selectedCategory) return false
    return true
  })

  const severityCounts = {
    CRITICAL: scanData.summary.critical,
    HIGH: scanData.summary.high,
    MEDIUM: scanData.summary.medium,
    LOW: scanData.summary.low,
    INFO: scanData.summary.info,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Scan Results</h2>
            <p className="text-gray-600">
              Scanned: <span className="font-mono text-sm">{scanData.scan.path}</span>
            </p>
            <p className="text-gray-500 text-sm">
              {new Date(scanData.scan.timestamp).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Upload New Scan</span>
          </button>
        </div>

        {/* Severity Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-critical">{severityCounts.CRITICAL}</div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-high">{severityCounts.HIGH}</div>
            <div className="text-sm text-gray-600">High</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-medium">{severityCounts.MEDIUM}</div>
            <div className="text-sm text-gray-600">Medium</div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-low">{severityCounts.LOW}</div>
            <div className="text-sm text-gray-600">Low</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-info">{severityCounts.INFO}</div>
            <div className="text-sm text-gray-600">Info</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <SummaryChart summary={scanData.summary} />

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold text-gray-700 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity
            </label>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
              <option value="INFO">Info</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              <option value="CODE">Code Issues</option>
              <option value="SECRET">Secrets</option>
              <option value="DEPENDENCY">Dependencies</option>
              <option value="CONFIG">Configuration</option>
            </select>
          </div>
        </div>
      </div>

      {/* Findings List */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-gray-800">
          {filteredFindings.length} Finding{filteredFindings.length !== 1 ? 's' : ''}
        </h3>
        {filteredFindings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <Shield className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700">No issues found!</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          filteredFindings.map((finding) => (
            <FindingCard key={finding.id} finding={finding} />
          ))
        )}
      </div>
    </div>
  )
}

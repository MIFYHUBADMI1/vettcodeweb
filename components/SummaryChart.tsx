'use client'

import { ScanResult } from '@/lib/types'

interface SummaryChartProps {
  summary: ScanResult['summary']
}

export default function SummaryChart({ summary }: SummaryChartProps) {
  const total = summary.total
  const data = [
    { label: 'Critical', count: summary.critical, color: '#DC2626' },
    { label: 'High', count: summary.high, color: '#EA580C' },
    { label: 'Medium', count: summary.medium, color: '#EAB308' },
    { label: 'Low', count: summary.low, color: '#3B82F6' },
    { label: 'Info', count: summary.info, color: '#6B7280' },
  ].filter((item) => item.count > 0)

  if (data.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-semibold text-gray-700 mb-4">Severity Distribution</h3>
      
      {/* Bar Chart */}
      <div className="space-y-3">
        {data.map((item) => {
          const percentage = (item.count / total) * 100

          return (
            <div key={item.label}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">{item.label}</span>
                <span className="text-gray-600">
                  {item.count} ({percentage.toFixed(1)}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Total */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-gray-700">Total Issues</span>
          <span className="text-2xl font-bold text-purple-600">{total}</span>
        </div>
      </div>
    </div>
  )
}

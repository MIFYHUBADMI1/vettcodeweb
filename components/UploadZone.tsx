'use client'

import { useState, useCallback } from 'react'
import { Upload, FileJson, AlertCircle } from 'lucide-react'
import { ScanResult } from '@/lib/types'

interface UploadZoneProps {
  onUpload: (data: ScanResult) => void
}

export default function UploadZone({ onUpload }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleFile = useCallback(
    async (file: File) => {
      setLoading(true)
      setError(null)

      try {
        const text = await file.text()
        const json = JSON.parse(text)

        // Validate structure
        if (!json.version || !json.scan || !json.findings) {
          throw new Error('Invalid VettCode scan format')
        }

        onUpload(json as ScanResult)
      } catch (err: any) {
        setError(err.message || 'Failed to parse JSON file')
      } finally {
        setLoading(false)
      }
    },
    [onUpload]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)

      const file = e.dataTransfer.files[0]
      if (file && file.type === 'application/json') {
        handleFile(file)
      } else {
        setError('Please drop a JSON file')
      }
    },
    [handleFile]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        handleFile(file)
      }
    },
    [handleFile]
  )

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      const text = e.clipboardData.getData('text')
      if (!text) return

      setLoading(true)
      setError(null)

      try {
        const json = JSON.parse(text)
        if (!json.version || !json.scan || !json.findings) {
          throw new Error('Invalid VettCode scan format')
        }
        onUpload(json as ScanResult)
      } catch (err: any) {
        setError(err.message || 'Failed to parse JSON')
      } finally {
        setLoading(false)
      }
    },
    [onUpload]
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Instructions */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        <h2 className="text-2xl font-bold mb-4">How to Use VettCode Dashboard</h2>
        <ol className="space-y-3 text-gray-700">
          <li className="flex items-start">
            <span className="font-bold mr-2">1.</span>
            <span>
              Run VettCode CLI with JSON export:{' '}
              <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                vettcode scan . --output results.json
              </code>
            </span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">2.</span>
            <span>Upload the results.json file below</span>
          </li>
          <li className="flex items-start">
            <span className="font-bold mr-2">3.</span>
            <span>Get AI-powered explanations for each finding</span>
          </li>
        </ol>
      </div>

      {/* Upload Zone */}
      <div
        className={`
          border-4 border-dashed rounded-lg p-12 text-center transition-all
          ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-white'}
          ${loading ? 'opacity-50' : ''}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onPaste={handlePaste}
      >
        <div className="flex flex-col items-center space-y-4">
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
              <p className="text-lg text-gray-600">Processing...</p>
            </>
          ) : (
            <>
              <Upload className="w-16 h-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-700">
                Upload VettCode Scan Results
              </h3>
              <p className="text-gray-500">
                Drag & drop your JSON file here, or click to browse
              </p>
              <input
                type="file"
                accept="application/json"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <FileJson className="w-5 h-5" />
                <span>Choose File</span>
              </label>
              <p className="text-sm text-gray-400">
                Or paste JSON directly (Ctrl+V / Cmd+V)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-800">Upload Error</h4>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Example */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-700 mb-2">📝 Example JSON Format:</h3>
        <pre className="text-xs bg-gray-800 text-gray-200 p-4 rounded overflow-x-auto">
          {JSON.stringify(
            {
              version: '1.0.0',
              scan: { path: '/project', timestamp: '2024-01-01T00:00:00Z' },
              summary: { total: 5, critical: 1, high: 2, medium: 2, low: 0, info: 0 },
              findings: [
                {
                  id: 1,
                  severity: 'HIGH',
                  title: 'SQL Injection',
                  file: 'auth.js',
                  line: 42,
                },
              ],
            },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  )
}

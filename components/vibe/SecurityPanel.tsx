/**
 * Security Panel Component
 * Display security scan results and findings
 */

'use client';

import { useState } from 'react';
import { Shield, Loader2, Play, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import SecuritySummary from './SecuritySummary';
import SecurityFindingList from './SecurityFindingList';
import type { NormalizedFinding } from '@/lib/types';

interface SecurityPanelProps {
  projectId: string;
}

export default function SecurityPanel({ projectId }: SecurityPanelProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    scanId: string;
    findings: NormalizedFinding[];
    totalFindings: number;
    criticalCount: number;
    highCount: number;
    mediumCount: number;
    lowCount: number;
    infoCount: number;
  } | null>(null);

  const handleRunScan = async () => {
    setIsScanning(true);
    toast.info('Starting security scan...');

    try {
      const response = await fetch(`/api/vibe/projects/${projectId}/scan`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Scan failed');
      }

      const data = await response.json();
      setScanResult(data.scan);

      if (data.scan.totalFindings === 0) {
        toast.success('🎉 No security issues found!');
      } else {
        toast.warning(`Found ${data.scan.totalFindings} security issues`);
      }
    } catch (error) {
      console.error('Scan failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to run scan');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-white">Security</h3>
        </div>

        <button
          onClick={handleRunScan}
          disabled={isScanning}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors flex items-center gap-2"
        >
          {isScanning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Run Scan
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {!scanResult && !isScanning && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">
                No Scan Yet
              </h4>
              <p className="text-sm text-gray-400 mb-6">
                Run a security scan to check your code for vulnerabilities, secrets, and dependency issues.
              </p>
              <button
                onClick={handleRunScan}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium text-white transition-colors inline-flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                Run First Scan
              </button>
            </div>
          </div>
        )}

        {isScanning && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-white mb-2">
                Scanning Your Code
              </h4>
              <p className="text-sm text-gray-400">
                Running security analysis with Semgrep, OSV-Scanner, and Gitleaks...
              </p>
            </div>
          </div>
        )}

        {scanResult && (
          <div className="space-y-6">
            {/* Summary */}
            <SecuritySummary
              totalFindings={scanResult.totalFindings}
              criticalCount={scanResult.criticalCount}
              highCount={scanResult.highCount}
              mediumCount={scanResult.mediumCount}
              lowCount={scanResult.lowCount}
              infoCount={scanResult.infoCount}
            />

            {/* Findings List */}
            {scanResult.findings.length > 0 ? (
              <SecurityFindingList
                findings={scanResult.findings}
                projectId={projectId}
              />
            ) : (
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <h4 className="font-semibold text-green-400 mb-2">
                  All Clear!
                </h4>
                <p className="text-sm text-gray-400">
                  No security issues found in your project.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

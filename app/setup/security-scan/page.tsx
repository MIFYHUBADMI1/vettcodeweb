/**
 * Security Scan Setup Guide
 * Complete step-by-step guide for installing and using VettCode CLI
 */

'use client'

import { useState } from 'react'
import { 
  Terminal, 
  CheckCircle, 
  Copy, 
  Download,
  Shield,
  Code,
  Key,
  Package,
  ChevronRight,
  ExternalLink,
  ArrowLeft,
  Play
} from 'lucide-react'
import { toast } from 'react-toastify'
import Link from 'next/link'

export default function SecurityScanSetupPage() {
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const copyToClipboard = async (text: string, commandName: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCommand(commandName)
      toast.success(`Copied: ${commandName}`)
      setTimeout(() => setCopiedCommand(null), 2000)
    } catch (err) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const toggleStep = (stepNumber: number) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(stepNumber)) {
      newCompleted.delete(stepNumber)
    } else {
      newCompleted.add(stepNumber)
    }
    setCompletedSteps(newCompleted)
  }

  const CodeBlock = ({ code, label }: { code: string; label: string }) => (
    <div className="relative group">
      <pre className="bg-gray-950 border border-gray-800 rounded-lg p-4 overflow-x-auto">
        <code className="text-green-400 font-mono text-sm">{code}</code>
      </pre>
      <button
        onClick={() => copyToClipboard(code, label)}
        className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
        title="Copy to clipboard"
      >
        {copiedCommand === label ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
          <Copy className="w-4 h-4 text-gray-400" />
        )}
      </button>
    </div>
  )

  const StepCard = ({ 
    number, 
    title, 
    children, 
    icon: Icon 
  }: { 
    number: number
    title: string
    children: React.ReactNode
    icon: any
  }) => {
    const isCompleted = completedSteps.has(number)
    
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-purple-500/30 transition-all">
        <div className="flex items-start gap-4">
          <button
            onClick={() => toggleStep(number)}
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
              isCompleted
                ? 'bg-green-600 border-green-600'
                : 'bg-gray-800 border-gray-700 hover:border-purple-500'
            }`}
          >
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-white" />
            ) : (
              <span className="text-sm font-bold text-gray-400">{number}</span>
            )}
          </button>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <Icon className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
            </div>
            <div className="space-y-4 text-gray-300">{children}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-green-600 flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Security Scan Setup</h1>
              <p className="text-lg text-gray-400">
                Learn to install and use VettCode CLI for security scanning
              </p>
            </div>
          </div>

          <div className="bg-blue-950/30 border border-blue-800/50 rounded-lg p-4 mt-6">
            <p className="text-blue-300 text-sm">
              <span className="font-semibold">💡 Beginner-Friendly:</span> This guide is designed for complete beginners. We'll walk you through everything step by step, even if this is your first time using a command line tool!
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Your Progress</span>
            <span className="text-sm text-purple-400 font-semibold">
              {completedSteps.size} / 6 steps completed
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-green-600 transition-all duration-500"
              style={{ width: `${(completedSteps.size / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-6">
          {/* Step 1: Install Node.js */}
          <StepCard number={1} title="Install Node.js" icon={Download}>
            <p>
              VettCode CLI requires Node.js (JavaScript runtime) to be installed on your computer.
            </p>
            
            <div className="bg-gray-950/50 rounded-lg p-4 border border-gray-800">
              <p className="text-sm text-gray-400 mb-3">
                <strong>What is Node.js?</strong> It's a program that lets you run JavaScript code on your computer (not just in browsers).
              </p>
              
              <div className="space-y-2">
                <p className="text-sm font-semibold text-white">Installation Steps:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                  <li>Visit <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">nodejs.org</a></li>
                  <li>Download the <strong>LTS</strong> version (recommended)</li>
                  <li>Run the installer and follow the setup wizard</li>
                  <li>Keep all default settings (just click "Next")</li>
                </ol>
              </div>
            </div>

            <div>
              <p className="text-sm mb-2">After installation, verify it works:</p>
              <CodeBlock code="node --version" label="Check Node.js" />
              <p className="text-xs text-gray-500 mt-2">
                You should see something like: <code>v20.11.0</code>
              </p>
            </div>
          </StepCard>

          {/* Step 2: Install VettCode CLI */}
          <StepCard number={2} title="Install VettCode CLI" icon={Package}>
            <p>
              Now we'll install VettCode CLI globally on your computer so you can use it from anywhere.
            </p>

            <div className="bg-gray-950/50 rounded-lg p-4 border border-gray-800">
              <p className="text-sm text-gray-400 mb-3">
                <strong>What does "globally" mean?</strong> It means you can run <code className="text-purple-400">vettcode</code> commands from any folder on your computer.
              </p>
            </div>

            <div>
              <p className="text-sm mb-2">Open your terminal and run:</p>
              <CodeBlock code="npm install -g vettcode" label="Install VettCode" />
            </div>

            <div className="bg-yellow-950/30 border border-yellow-800/50 rounded-lg p-4">
              <p className="text-yellow-300 text-sm">
                <strong>How to open terminal:</strong><br />
                <strong>Windows:</strong> Press <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Win + R</kbd>, type <code>cmd</code>, press Enter<br />
                <strong>Mac:</strong> Press <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Cmd + Space</kbd>, type <code>terminal</code>, press Enter<br />
                <strong>Linux:</strong> Press <kbd className="px-2 py-1 bg-gray-800 rounded text-xs">Ctrl + Alt + T</kbd>
              </p>
            </div>

            <div>
              <p className="text-sm mb-2">Verify installation:</p>
              <CodeBlock code="vettcode --version" label="Check VettCode" />
              <p className="text-xs text-gray-500 mt-2">
                You should see the VettCode version number
              </p>
            </div>
          </StepCard>

          {/* Step 3: Sign In */}
          <StepCard number={3} title="Sign In to VettCode" icon={Key}>
            <p>
              VettCode requires authentication to save your scan results and provide AI-powered explanations.
            </p>

            <div className="bg-gray-950/50 rounded-lg p-4 border border-gray-800">
              <p className="text-sm text-gray-400 mb-3">
                <strong>Why sign in?</strong> This connects your terminal to your VettCode account so you can:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                <li>View scan results in the web dashboard</li>
                <li>Get AI-powered security explanations</li>
                <li>Track your scan history</li>
                <li>Access VettCode Coach</li>
              </ul>
            </div>

            <div>
              <p className="text-sm mb-2">Run the login command:</p>
              <CodeBlock code="vettcode login" label="Login" />
              <p className="text-xs text-gray-500 mt-2">
                This will open your browser for secure authentication
              </p>
            </div>

            <div className="flex items-start gap-2 bg-blue-950/30 border border-blue-800/50 rounded-lg p-4">
              <ExternalLink className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-300">
                  Don't have an account yet?{' '}
                  <a 
                    href="https://vettedcodewe.vercel.app/signup" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    Create one for free
                  </a>
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm mb-2">Verify you're signed in:</p>
              <CodeBlock code="vettcode whoami" label="Check Login" />
              <p className="text-xs text-gray-500 mt-2">
                Shows your email and account details
              </p>
            </div>
          </StepCard>

          {/* Step 4: Setup Security Tools */}
          <StepCard number={4} title="Setup Security Tools" icon={Shield}>
            <p>
              VettCode uses specialized security tools to scan your code. Let's check what's available and install what's missing.
            </p>

            <div className="bg-gray-950/50 rounded-lg p-4 border border-gray-800">
              <p className="text-sm text-gray-400 mb-3">
                <strong>What are these tools?</strong> VettCode orchestrates multiple best-in-class security scanners:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Code className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Semgrep:</strong> <span className="text-gray-300">Finds code vulnerabilities (SQL injection, XSS, etc.)</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Package className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">OSV-Scanner:</strong> <span className="text-gray-300">Checks for vulnerable dependencies</span>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <Key className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Gitleaks:</strong> <span className="text-gray-300">Detects exposed secrets and API keys</span>
                  </div>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-sm mb-2">Check what's installed:</p>
              <CodeBlock code="vettcode setup" label="Check Setup" />
              <p className="text-xs text-gray-500 mt-2">
                Shows which tools are installed and provides installation instructions for missing ones
              </p>
            </div>

            <div>
              <p className="text-sm mb-2">Let VettCode try to auto-install (recommended):</p>
              <CodeBlock code="vettcode setup --auto" label="Auto Setup" />
              <p className="text-xs text-gray-500 mt-2">
                VettCode will attempt to install missing tools automatically
              </p>
            </div>

            <div className="bg-yellow-950/30 border border-yellow-800/50 rounded-lg p-4">
              <p className="text-yellow-300 text-sm">
                <strong>Good News:</strong> VettCode works even if some tools are missing! You'll still get comprehensive security scanning with whatever tools are available.
              </p>
            </div>
          </StepCard>

          {/* Step 5: Run Your First Scan */}
          <StepCard number={5} title="Run Your First Scan" icon={Play}>
            <p>
              Now you're ready to scan your code! Let's run VettCode on your project.
            </p>

            <div className="bg-gray-950/50 rounded-lg p-4 border border-gray-800">
              <p className="text-sm text-gray-400 mb-3">
                <strong>What does scanning do?</strong> VettCode analyzes your code for:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-300">
                <li>Security vulnerabilities in your code</li>
                <li>Vulnerable dependencies (outdated packages)</li>
                <li>Exposed secrets (API keys, passwords)</li>
                <li>Configuration issues</li>
              </ul>
            </div>

            <div>
              <p className="text-sm mb-2">Navigate to your project folder:</p>
              <CodeBlock code="cd path/to/your/project" label="Navigate to Project" />
              <p className="text-xs text-gray-500 mt-2">
                Replace <code>path/to/your/project</code> with your actual project path
              </p>
            </div>

            <div>
              <p className="text-sm mb-2">Run the scan:</p>
              <CodeBlock code="vettcode scan ." label="Scan Current Directory" />
              <p className="text-xs text-gray-500 mt-2">
                The <code>.</code> means "scan the current directory"
              </p>
            </div>

            <div>
              <p className="text-sm mb-3">Other useful scan commands:</p>
              <div className="space-y-2">
                <div>
                  <CodeBlock code="vettcode scan ../my-app" label="Scan Specific Folder" />
                  <p className="text-xs text-gray-500 mt-1">Scan a specific folder</p>
                </div>
                <div>
                  <CodeBlock code="vettcode scan . --json" label="JSON Output" />
                  <p className="text-xs text-gray-500 mt-1">Output results as JSON (for automation)</p>
                </div>
                <div>
                  <CodeBlock code="vettcode scan . --output results.json" label="Save to File" />
                  <p className="text-xs text-gray-500 mt-1">Save results to a file</p>
                </div>
              </div>
            </div>
          </StepCard>

          {/* Step 6: View Results & Learn */}
          <StepCard number={6} title="View Results & Learn" icon={Terminal}>
            <p>
              After scanning, VettCode shows you the results and automatically syncs them to your web dashboard!
            </p>

            <div className="bg-gray-950/50 rounded-lg p-4 border border-gray-800">
              <p className="text-sm text-gray-400 mb-3">
                <strong>Understanding the results:</strong>
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <span className="text-red-400 font-semibold">🔴 Critical:</span> <span className="text-gray-300">Fix immediately - high risk!</span>
                </li>
                <li>
                  <span className="text-orange-400 font-semibold">🟠 High:</span> <span className="text-gray-300">Important - fix soon</span>
                </li>
                <li>
                  <span className="text-yellow-400 font-semibold">🟡 Medium:</span> <span className="text-gray-300">Should address when possible</span>
                </li>
                <li>
                  <span className="text-blue-400 font-semibold">⚪ Low:</span> <span className="text-gray-300">Minor issues, low priority</span>
                </li>
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <Link
                href="/dashboard/scans"
                className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/20 to-green-600/20 hover:from-purple-600/30 hover:to-green-600/30 border border-purple-500/30 rounded-lg transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-purple-400" />
                  <div>
                    <p className="font-semibold text-white">View Your Scans</p>
                    <p className="text-sm text-gray-400">See all your scan results</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
              </Link>

              <div className="bg-blue-950/30 border border-blue-800/50 rounded-lg p-4">
                <p className="text-blue-300 text-sm mb-2">
                  <strong>💡 Pro Tip:</strong> Use VettCode Coach for AI-powered explanations!
                </p>
                <p className="text-gray-300 text-sm">
                  In your scan results, click on any finding to get beginner-friendly explanations about what's wrong, why it matters, and exactly how to fix it.
                </p>
              </div>
            </div>
          </StepCard>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Additional Resources</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="https://github.com/MIFYHUBADMI1/vettcodeweb"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all group"
            >
              <ExternalLink className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">GitHub Repository</p>
                <p className="text-sm text-gray-400">View source code and documentation</p>
              </div>
            </a>

            <Link
              href="/docs"
              className="flex items-center gap-3 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all group"
            >
              <ExternalLink className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">Documentation</p>
                <p className="text-sm text-gray-400">Learn more about VettCode features</p>
              </div>
            </Link>

            <a
              href="https://semgrep.dev/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all group"
            >
              <ExternalLink className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">Semgrep Docs</p>
                <p className="text-sm text-gray-400">Learn about code analysis</p>
              </div>
            </a>

            <a
              href="https://owasp.org/Top10/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-all group"
            >
              <ExternalLink className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">OWASP Top 10</p>
                <p className="text-sm text-gray-400">Learn about common vulnerabilities</p>
              </div>
            </a>
          </div>
        </div>

        {/* Completion Message */}
        {completedSteps.size === 6 && (
          <div className="mt-8 bg-gradient-to-r from-green-600/20 to-purple-600/20 border border-green-500/30 rounded-xl p-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              🎉 Congratulations!
            </h3>
            <p className="text-gray-300 mb-6">
              You've completed the VettCode security scan setup! You're now ready to scan your projects and write more secure code.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 rounded-lg font-semibold transition-all"
            >
              Go to Dashboard
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

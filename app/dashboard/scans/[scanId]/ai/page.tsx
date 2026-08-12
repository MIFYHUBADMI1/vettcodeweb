/**
 * VettCode AI Coach Page - Redesigned
 * /dashboard/scans/[scanId]/ai
 * 
 * Professional security coaching workspace
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { useScan } from '@/lib/hooks/useScans'
import { generateQuickActions } from '@/lib/ai-chat-utils'
import { calculateSecurityScore } from '@/lib/security-score'
import { 
  Sparkles, 
  ArrowLeft, 
  Send, 
  Loader2, 
  AlertCircle,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Zap
} from 'lucide-react'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: Date
}

export default function AICoachPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const scanId = params.scanId as string

  const { data, isLoading, error } = useScan(scanId)
  const scan = data?.scan

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [quotaExceeded, setQuotaExceeded] = useState(false)
  const [hasLoadedOverview, setHasLoadedOverview] = useState(false)
  const [contextCollapsed, setContextCollapsed] = useState(false)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [showQuickActions, setShowQuickActions] = useState(false)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load initial overview when scan loads
  useEffect(() => {
    if (scan && !hasLoadedOverview && messages.length === 0) {
      loadInitialOverview()
    }
  }, [scan, hasLoadedOverview, messages.length])

  const loadInitialOverview = async () => {
    if (!scan) return

    setHasLoadedOverview(true)
    setIsGenerating(true)

    try {
      const response = await fetch(`/api/scans/${scanId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestOverview: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to load overview')
      }

      const data = await response.json()

      setMessages([
        {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(data.timestamp),
        },
      ])

      if (data.quotaExceeded) {
        setQuotaExceeded(true)
      }
    } catch (err) {
      console.error('Failed to load overview:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim()
    
    if (!textToSend || isGenerating) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsGenerating(true)

    try {
      const response = await fetch(`/api/scans/${scanId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: messages,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(data.timestamp),
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (data.quotaExceeded) {
        setQuotaExceeded(true)
      }
    } catch (err) {
      console.error('Chat error:', err)
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having trouble responding. Please try again in a moment.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsGenerating(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  // Calculate score
  const securityScore = scan ? calculateSecurityScore({
    criticalCount: scan.criticalCount,
    highCount: scan.highCount,
    mediumCount: scan.mediumCount,
    lowCount: scan.lowCount,
    infoCount: scan.infoCount,
    totalFindings: scan.totalFindings,
  }) : null

  // Generate quick actions
  const quickActions = scan && securityScore
    ? generateQuickActions({
        scanId,
        scanPath: scan.scanPath,
        totalFindings: scan.totalFindings,
        criticalCount: scan.criticalCount,
        highCount: scan.highCount,
        mediumCount: scan.mediumCount,
        lowCount: scan.lowCount,
        infoCount: scan.infoCount,
        score: securityScore.score,
        grade: securityScore.grade,
        categories: Array.from(new Set(scan.scanData.findings.map((f) => f.category))),
        priorityFindings: scan.scanData.findings.slice(0, 10),
      })
    : []

  const TrendIcon = securityScore
    ? securityScore.score >= 80
      ? TrendingUp
      : securityScore.score >= 50
      ? Minus
      : TrendingDown
    : Minus

  return (
    <DashboardLayout>
      {/* Compact Context Bar */}
      <div className="h-14 border-b border-gray-700 bg-gray-900/50 backdrop-blur-sm flex items-center px-4 gap-4">
        <button
          onClick={() => router.push(`/dashboard/scans/${scanId}`)}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Report</span>
        </button>
        
        <div className="h-4 w-px bg-gray-700" />
        
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span className="font-semibold text-white text-sm">VettCode Coach</span>
        </div>

        {scan && !isLoading && (
          <>
            <div className="h-4 w-px bg-gray-700 hidden md:block" />
            <span className="text-gray-400 text-sm truncate hidden md:block">
              {scan.scanPath}
            </span>
          </>
        )}
      </div>

      {/* Main Workspace */}
      <div className="flex h-[calc(100vh-8.5rem)] overflow-hidden">
        {/* Scan Context Sidebar */}
        {scan && !isLoading && (
          <div className={`${contextCollapsed ? 'w-0' : 'w-full md:w-80'} transition-all border-r border-gray-700 bg-gray-900/30 flex-shrink-0 overflow-hidden`}>
            <div className="h-full overflow-y-auto p-4 space-y-4">
              {/* Mobile collapse button */}
              <button
                onClick={() => setContextCollapsed(!contextCollapsed)}
                className="md:hidden w-full flex items-center justify-between text-sm text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <span>Scan Context</span>
                {contextCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>

              {!contextCollapsed && (
                <>
                  {/* Security Score */}
                  <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Security Score</span>
                      <TrendIcon className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="text-3xl font-bold text-white">{securityScore?.score}</span>
                      <span className="text-lg text-gray-400">/100</span>
                      <span className="text-lg font-bold text-purple-400">{securityScore?.grade}</span>
                    </div>
                    <p className="text-xs text-gray-400">{securityScore?.status.replace(/_/g, ' ')}</p>
                  </div>

                  {/* Findings Breakdown */}
                  <div className="space-y-2">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Findings</span>
                    
                    {scan.criticalCount > 0 && (
                      <div className="flex items-center justify-between p-2 bg-red-500/10 border border-red-500/30 rounded">
                        <span className="text-sm text-red-300">Critical</span>
                        <span className="text-sm font-bold text-red-400">{scan.criticalCount}</span>
                      </div>
                    )}
                    
                    {scan.highCount > 0 && (
                      <div className="flex items-center justify-between p-2 bg-orange-500/10 border border-orange-500/30 rounded">
                        <span className="text-sm text-orange-300">High</span>
                        <span className="text-sm font-bold text-orange-400">{scan.highCount}</span>
                      </div>
                    )}
                    
                    {scan.mediumCount > 0 && (
                      <div className="flex items-center justify-between p-2 bg-yellow-500/10 border border-yellow-500/30 rounded">
                        <span className="text-sm text-yellow-300">Medium</span>
                        <span className="text-sm font-bold text-yellow-400">{scan.mediumCount}</span>
                      </div>
                    )}
                    
                    {scan.lowCount > 0 && (
                      <div className="flex items-center justify-between p-2 bg-blue-500/10 border border-blue-500/30 rounded">
                        <span className="text-sm text-blue-300">Low</span>
                        <span className="text-sm font-bold text-blue-400">{scan.lowCount}</span>
                      </div>
                    )}
                    
                    {scan.infoCount > 0 && (
                      <div className="flex items-center justify-between p-2 bg-gray-500/10 border border-gray-500/30 rounded">
                        <span className="text-sm text-gray-300">Info</span>
                        <span className="text-sm font-bold text-gray-400">{scan.infoCount}</span>
                      </div>
                    )}
                  </div>

                  {/* Priority Issues */}
                  {scan.scanData.findings.slice(0, 3).length > 0 && (
                    <div className="space-y-2">
                      <span className="text-xs text-gray-400 uppercase tracking-wide">Priority Issues</span>
                      <div className="space-y-1">
                        {scan.scanData.findings.slice(0, 3).map((finding, idx) => (
                          <div key={idx} className="p-2 bg-gray-800/50 border border-gray-700 rounded text-xs">
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-3 h-3 text-red-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-300 truncate">{finding.title}</p>
                                <p className="text-gray-500 text-[10px] mt-0.5">{finding.file}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Chat Workspace */}
        {scan && !isLoading && (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 && !isGenerating ? (
                /* Empty State - Show quick actions by default */
                <div className="h-full flex items-center justify-center p-6">
                  <div className="max-w-2xl w-full space-y-6">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                        <Sparkles className="w-6 h-6 text-purple-400" />
                      </div>
                      <h2 className="text-xl font-bold text-white">VettCode Coach</h2>
                      <p className="text-sm text-gray-400">
                        Ask me anything about the <span className="text-white font-medium">{scan.totalFindings} findings</span> in this scan
                      </p>
                    </div>

                    {/* Quick Start Actions - Always shown in empty state */}
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wide text-center">Quick Start</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {quickActions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => sendMessage(action)}
                            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500/50 text-gray-300 hover:text-white rounded-lg text-sm transition-all"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Conversation */
                <div className="p-4 md:p-6 space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className="flex gap-3">
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                        </div>
                      )}
                      
                      <div className={`flex-1 ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                        <div className={`${msg.role === 'user' ? 'bg-purple-600 text-white max-w-2xl' : 'bg-gray-800/50 border border-gray-700 text-gray-100'} rounded-lg px-4 py-3`}>
                          {msg.role === 'assistant' ? (
                            <div className="prose prose-invert prose-sm max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  code: ({ node, inline, className, children, ...props }: any) => {
                                    return inline ? (
                                      <code className="bg-gray-900 px-1.5 py-0.5 rounded text-purple-300 text-xs" {...props}>
                                        {children}
                                      </code>
                                    ) : (
                                      <div className="relative group">
                                        <button
                                          onClick={() => copyToClipboard(String(children), idx)}
                                          className="absolute top-2 right-2 p-1.5 bg-gray-900 hover:bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                          {copiedIndex === idx ? (
                                            <Check className="w-3 h-3 text-green-400" />
                                          ) : (
                                            <Copy className="w-3 h-3 text-gray-400" />
                                          )}
                                        </button>
                                        <code className="block bg-gray-900 p-3 rounded-lg text-xs overflow-x-auto" {...props}>
                                          {children}
                                        </code>
                                      </div>
                                    )
                                  },
                                  a: ({ node, children, ...props }: any) => (
                                    <a className="text-purple-400 hover:text-purple-300 underline" {...props}>
                                      {children}
                                    </a>
                                  ),
                                  ul: ({ node, children, ...props }: any) => (
                                    <ul className="space-y-1 list-disc list-inside" {...props}>
                                      {children}
                                    </ul>
                                  ),
                                  ol: ({ node, children, ...props }: any) => (
                                    <ol className="space-y-1 list-decimal list-inside" {...props}>
                                      {children}
                                    </ol>
                                  ),
                                  p: ({ node, children, ...props }: any) => (
                                    <p className="mb-2 last:mb-0 leading-relaxed" {...props}>
                                      {children}
                                    </p>
                                  ),
                                  h3: ({ node, children, ...props }: any) => (
                                    <h3 className="text-base font-semibold mt-3 mb-2 text-white" {...props}>
                                      {children}
                                    </h3>
                                  ),
                                  strong: ({ node, children, ...props }: any) => (
                                    <strong className="font-semibold text-white" {...props}>
                                      {children}
                                    </strong>
                                  ),
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {isGenerating && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                      </div>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3">
                        <p className="text-sm text-gray-400">Analyzing your scan...</p>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Composer */}
            <div className="border-t border-gray-700 bg-gray-900/50 p-4">
              {quotaExceeded && (
                <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                  <p className="text-xs text-yellow-400">
                    Daily AI limit reached. Upgrade for more requests or wait until tomorrow!
                  </p>
                </div>
              )}

              {/* Quick Actions Toggle - Only show when conversation started */}
              {messages.length > 0 && !isGenerating && (
                <div className="mb-3">
                  <button
                    onClick={() => setShowQuickActions(!showQuickActions)}
                    className="flex items-center gap-2 text-xs text-gray-400 hover:text-purple-400 transition-colors"
                  >
                    <Zap className="w-3 h-3" />
                    <span>{showQuickActions ? 'Hide' : 'Show'} quick actions</span>
                  </button>
                  
                  {showQuickActions && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {quickActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            sendMessage(action)
                            setShowQuickActions(false)
                          }}
                          disabled={isGenerating}
                          className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-purple-500/50 text-gray-300 hover:text-white rounded-lg text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {action}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask VettCode about this scan..."
                    disabled={isGenerating || quotaExceeded}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    rows={2}
                  />
                  <div className="absolute bottom-2 right-2 text-[10px] text-gray-600">
                    {input.length}/500
                  </div>
                </div>
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isGenerating || quotaExceeded}
                  className="px-4 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span className="hidden sm:inline">Send</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-gray-600 mt-2">
                Enter to send • Shift+Enter for new line
              </p>
            </div>
          </div>
        )}

        {/* Loading/Error States */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}

        {error && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-400 mb-4">Failed to load scan</p>
              <button
                onClick={() => router.push('/dashboard/scans')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Back to scans
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

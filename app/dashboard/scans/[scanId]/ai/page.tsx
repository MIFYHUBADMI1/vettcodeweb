/**
 * VettCode AI Coach Page - Complete Redesign
 * /dashboard/scans/[scanId]/ai
 * 
 * A professional security coaching workspace designed for learning
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useScan } from '@/lib/hooks/useScans'
import { generateQuickActions } from '@/lib/ai-chat-utils'
import { calculateSecurityScore } from '@/lib/security-score'
import { 
  Sparkles, 
  ArrowLeft, 
  Send, 
  Loader2, 
  AlertCircle,
  FileWarning,
  Copy,
  Check,
  ChevronDown,
  Menu,
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
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [showScanContext, setShowScanContext] = useState(false)

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isLoadingOverviewRef = useRef(false)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-grow textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
    }
  }, [input])

  // Load initial overview when scan loads
  // FIXED: Prevent duplicate requests by using a ref to track in-flight request
  useEffect(() => {
    if (scan && !hasLoadedOverview && messages.length === 0 && !isLoadingOverviewRef.current) {
      isLoadingOverviewRef.current = true
      loadInitialOverview()
    }
  }, [scan]) // FIXED: Only depend on scan, not messages.length or hasLoadedOverview

  const loadInitialOverview = async () => {
    if (!scan) return

    console.log('[AI-PAGE] Loading initial overview for scanId:', scanId)
    setHasLoadedOverview(true)
    setIsGenerating(true)

    try {
      console.log('[AI-PAGE] Fetching overview from API...')
      const response = await fetch(`/api/scans/${scanId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestOverview: true }),
      })

      console.log('[AI-PAGE] Overview API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[AI-PAGE] Overview API error:', errorText)
        throw new Error('Failed to load overview')
      }

      const data = await response.json()
      console.log('[AI-PAGE] Overview received. Source:', data.source, 'Provider:', data.provider)
      console.log('[AI-PAGE] Message length:', data.message.length)

      setMessages([
        {
          role: 'assistant',
          content: data.message,
          timestamp: new Date(data.timestamp),
        },
      ])

      if (data.quotaExceeded) {
        console.log('[AI-PAGE] Quota exceeded')
        setQuotaExceeded(true)
      }
    } catch (err) {
      console.error('[AI-PAGE] Failed to load overview:', err)
      // Don't show error, let user start conversation manually
    } finally {
      setIsGenerating(false)
      isLoadingOverviewRef.current = false // FIXED: Reset the ref
    }
  }

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim()
    
    if (!textToSend || isGenerating) {
      console.log('[AI-PAGE] sendMessage skipped - empty or generating')
      return
    }

    console.log('[AI-PAGE] Sending message:', textToSend.substring(0, 50))
    console.log('[AI-PAGE] Conversation history length:', messages.length)

    const userMessage: ChatMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsGenerating(true)

    try {
      console.log('[AI-PAGE] Calling chat API...')
      const response = await fetch(`/api/scans/${scanId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          conversationHistory: messages,
        }),
      })

      console.log('[AI-PAGE] Chat API response status:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('[AI-PAGE] Chat API error:', errorText)
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      console.log('[AI-PAGE] Chat response received. Source:', data.source, 'Provider:', data.provider, 'Model:', data.model)
      console.log('[AI-PAGE] Response message length:', data.message.length)
      console.log('[AI-PAGE] Response preview:', data.message.substring(0, 100))

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(data.timestamp),
      }

      setMessages((prev) => [...prev, assistantMessage])

      if (data.quotaExceeded) {
        console.log('[AI-PAGE] Quota exceeded after this request')
        setQuotaExceeded(true)
      }
    } catch (err) {
      console.error('[AI-PAGE] Chat error:', err)
      
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

  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* Compact Top Bar */}
      <div className="h-12 border-b border-gray-800 bg-gray-900/80 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push(`/dashboard/scans/${scanId}`)}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Report</span>
          </button>
          
          <div className="h-4 w-px bg-gray-800 hidden sm:block" />
          
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="font-semibold text-sm">VettCode Coach</span>
          </div>
        </div>

        {scan && !isLoading && (
          <button
            onClick={() => setShowScanContext(!showScanContext)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
          >
            <Menu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scan Context</span>
            <span className="sm:hidden">{scan.totalFindings}</span>
          </button>
        )}
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-sm">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
              <p className="text-red-400 mb-4">Failed to load scan</p>
              <button
                onClick={() => router.push('/dashboard/scans')}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
              >
                Back to scans
              </button>
            </div>
          </div>
        )}

        {/* AI Workspace */}
        {scan && !isLoading && (
          <>
            {/* Scan Context Drawer - Overlay on mobile/tablet */}
            {showScanContext && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                  onClick={() => setShowScanContext(false)}
                />
                
                {/* Drawer */}
                <div className="fixed top-0 right-0 bottom-0 w-80 bg-gray-900 border-l border-gray-800 z-50 overflow-y-auto p-4 space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white">Scan Context</h3>
                    <button
                      onClick={() => setShowScanContext(false)}
                      className="p-1 text-gray-400 hover:text-white rounded transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Score Overview */}
                  <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Security Score</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-white">{securityScore?.score}</span>
                      <span className="text-gray-400">/100</span>
                      <span className="text-xl font-bold text-purple-400">{securityScore?.grade}</span>
                    </div>
                    <p className="text-xs text-gray-400">{securityScore?.status.replace(/_/g, ' ')}</p>
                  </div>

                  {/* Findings Summary */}
                  <div className="space-y-1.5">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Findings</div>
                    
                    {scan.criticalCount > 0 && (
                      <div className="flex items-center justify-between px-2 py-1.5 bg-red-500/10 border border-red-500/30 rounded text-sm">
                        <span className="text-red-300">Critical</span>
                        <span className="font-bold text-red-400">{scan.criticalCount}</span>
                      </div>
                    )}
                    
                    {scan.highCount > 0 && (
                      <div className="flex items-center justify-between px-2 py-1.5 bg-orange-500/10 border border-orange-500/30 rounded text-sm">
                        <span className="text-orange-300">High</span>
                        <span className="font-bold text-orange-400">{scan.highCount}</span>
                      </div>
                    )}
                    
                    {scan.mediumCount > 0 && (
                      <div className="flex items-center justify-between px-2 py-1.5 bg-yellow-500/10 border border-yellow-500/30 rounded text-sm">
                        <span className="text-yellow-300">Medium</span>
                        <span className="font-bold text-yellow-400">{scan.mediumCount}</span>
                      </div>
                    )}
                    
                    {scan.lowCount > 0 && (
                      <div className="flex items-center justify-between px-2 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded text-sm">
                        <span className="text-blue-300">Low</span>
                        <span className="font-bold text-blue-400">{scan.lowCount}</span>
                      </div>
                    )}
                    
                    {scan.infoCount > 0 && (
                      <div className="flex items-center justify-between px-2 py-1.5 bg-gray-600/10 border border-gray-600/30 rounded text-sm">
                        <span className="text-gray-300">Info</span>
                        <span className="font-bold text-gray-400">{scan.infoCount}</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Link to Report */}
                  <button
                    onClick={() => router.push(`/dashboard/scans/${scanId}`)}
                    className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm transition-colors text-left flex items-center gap-2"
                  >
                    <FileWarning className="w-4 h-4" />
                    <span>View full report</span>
                  </button>
                </div>
              </>
            )}

            {/* Conversation Area - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {messages.length === 0 && !isGenerating ? (
                /* Empty State - Centered, Educational */
                <div className="min-h-full flex items-center justify-center p-6">
                  <div className="w-full max-w-2xl mx-auto text-center space-y-8">
                    {/* Hero */}
                    <div className="space-y-3">
                      <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto">
                        <Sparkles className="w-8 h-8 text-purple-400" />
                      </div>
                      <h1 className="text-2xl font-bold text-white">VettCode Coach</h1>
                      <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                        Understand your scan. Learn what went wrong. Fix it with confidence.
                      </p>
                      <p className="text-sm text-gray-500">
                        Ask me anything about the <span className="text-white font-medium">{scan.totalFindings} {scan.totalFindings === 1 ? 'finding' : 'findings'}</span> in this scan
                      </p>
                    </div>

                    {/* Suggested Questions */}
                    {quickActions.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs text-gray-500 uppercase tracking-wider">Suggested questions</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {quickActions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => sendMessage(action)}
                              disabled={isGenerating}
                              className="px-4 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-purple-500/50 text-gray-300 hover:text-white rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {action}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Conversation Messages - Centered max-width */
                <div className="w-full max-w-3xl mx-auto px-4 md:px-6 py-6 pb-8 space-y-6">
                  {messages.map((msg, idx) => (
                    <div key={idx}>
                      {msg.role === 'assistant' ? (
                        /* AI Message */
                        <div className="flex gap-3">
                          <div className="w-7 h-7 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 mb-1.5">VettCode Coach</div>
                            <div className="prose prose-invert prose-sm max-w-none">
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  code: ({ node, inline, className, children, ...props }: any) => {
                                    return inline ? (
                                      <code className="bg-gray-800 px-1.5 py-0.5 rounded text-purple-300 text-xs font-mono" {...props}>
                                        {children}
                                      </code>
                                    ) : (
                                      <div className="relative group my-3">
                                        <button
                                          onClick={() => copyToClipboard(String(children), idx)}
                                          className="absolute top-2 right-2 p-1.5 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                          title="Copy code"
                                        >
                                          {copiedIndex === idx ? (
                                            <Check className="w-3.5 h-3.5 text-green-400" />
                                          ) : (
                                            <Copy className="w-3.5 h-3.5" />
                                          )}
                                        </button>
                                        <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto border border-gray-800">
                                          <code className="text-xs font-mono text-gray-300" {...props}>
                                            {children}
                                          </code>
                                        </pre>
                                      </div>
                                    )
                                  },
                                  a: ({ node, children, ...props }: any) => (
                                    <a className="text-purple-400 hover:text-purple-300 underline underline-offset-2" {...props}>
                                      {children}
                                    </a>
                                  ),
                                  ul: ({ node, children, ...props }: any) => (
                                    <ul className="space-y-1.5 my-3" {...props}>
                                      {children}
                                    </ul>
                                  ),
                                  ol: ({ node, children, ...props }: any) => (
                                    <ol className="space-y-1.5 my-3" {...props}>
                                      {children}
                                    </ol>
                                  ),
                                  li: ({ node, children, ...props }: any) => (
                                    <li className="text-gray-300 leading-relaxed" {...props}>
                                      {children}
                                    </li>
                                  ),
                                  p: ({ node, children, ...props }: any) => (
                                    <p className="text-gray-300 leading-relaxed my-3 first:mt-0 last:mb-0" {...props}>
                                      {children}
                                    </p>
                                  ),
                                  h3: ({ node, children, ...props }: any) => (
                                    <h3 className="text-base font-semibold text-white mt-5 mb-2 first:mt-0" {...props}>
                                      {children}
                                    </h3>
                                  ),
                                  h4: ({ node, children, ...props }: any) => (
                                    <h4 className="text-sm font-semibold text-white mt-4 mb-2" {...props}>
                                      {children}
                                    </h4>
                                  ),
                                  strong: ({ node, children, ...props }: any) => (
                                    <strong className="font-semibold text-white" {...props}>
                                      {children}
                                    </strong>
                                  ),
                                  blockquote: ({ node, children, ...props }: any) => (
                                    <blockquote className="border-l-2 border-purple-500/50 pl-4 italic text-gray-400 my-3" {...props}>
                                      {children}
                                    </blockquote>
                                  ),
                                }}
                              >
                                {msg.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* User Message */
                        <div className="flex justify-end">
                          <div className="max-w-2xl bg-purple-600 text-white rounded-lg px-4 py-2.5">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* AI Thinking */}
                  {isGenerating && (
                    <div className="flex gap-3">
                      <div className="w-7 h-7 bg-purple-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1.5">VettCode Coach</div>
                        <p className="text-sm text-gray-400">Analyzing your scan...</p>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Composer Area - Clean, no box styling */}
            <div className="flex-shrink-0">
              {/* Quota Warning */}
              {quotaExceeded && (
                <div className="px-4 md:px-6 pb-2">
                  <div className="max-w-3xl mx-auto p-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-xs text-yellow-400">
                      Daily AI limit reached. Upgrade for more requests or wait until tomorrow.
                    </p>
                  </div>
                </div>
              )}

              {/* Input Composer */}
              <div className="px-4 md:px-6 pb-4">
                <div className="max-w-3xl mx-auto">
                  {/* Suggested Actions Panel - Expands UPWARD when open */}
                  {messages.length > 0 && quickActions.length > 0 && !isGenerating && (
                    <div className="relative">
                      <details className="group">
                        <summary className="hidden"></summary>
                        {/* This expands UPWARD */}
                        <div className="absolute bottom-full left-0 right-0 mb-2 max-h-[180px] overflow-y-auto">
                          <div className="flex flex-wrap gap-2 p-3 bg-gray-800/95 border border-gray-700 rounded-lg shadow-xl backdrop-blur-sm">
                            {quickActions.map((action, idx) => (
                              <button
                                key={idx}
                                onClick={() => sendMessage(action)}
                                disabled={isGenerating}
                                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-purple-500/50 text-gray-300 hover:text-white rounded-lg text-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        </div>
                      </details>
                    </div>
                  )}

                  {/* Input Area - With Border and Interactive Lighting */}
                  <div className="relative rounded-2xl border border-gray-700 bg-gray-800/30 p-1 transition-all duration-200 focus-within:border-purple-500/50 focus-within:bg-gray-800/50 focus-within:shadow-lg focus-within:shadow-purple-500/10">
                    {/* Suggested Questions Trigger - Inside border, floating left */}
                    {messages.length > 0 && quickActions.length > 0 && !isGenerating && (
                      <button
                        onClick={(e) => {
                          const details = e.currentTarget.closest('.max-w-3xl')?.querySelector('details')
                          if (details) {
                            details.open = !details.open
                          }
                        }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-purple-400 transition-colors rounded-lg hover:bg-gray-700/50 z-10"
                        title="Show suggested questions"
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                    )}

                    <textarea
                      ref={textareaRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask VettCode about this scan..."
                      disabled={isGenerating || quotaExceeded}
                      className={`w-full bg-transparent border-none ${messages.length > 0 && quickActions.length > 0 ? 'pl-11' : 'pl-3'} pr-12 py-3 text-sm text-white placeholder-gray-500 resize-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
                      rows={1}
                      style={{ minHeight: '48px', maxHeight: '160px' }}
                    />
                    
                    {/* Send Button - Inside border, floating right */}
                    <button
                      onClick={() => sendMessage()}
                      disabled={!input.trim() || isGenerating || quotaExceeded}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-purple-600 hover:scale-105"
                      title="Send message (Enter)"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

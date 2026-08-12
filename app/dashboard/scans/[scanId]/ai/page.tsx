/**
 * VettCode AI Coach Page
 * /dashboard/scans/[scanId]/ai
 * 
 * Scan-aware conversational AI security mentor
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
  ChevronLeft, 
  Send, 
  Loader2, 
  AlertCircle,
  Shield,
  Calendar,
  BarChart3,
  Lightbulb,
  MessageSquare,
  AlertTriangle
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
      // Silent fail - user can still chat
    } finally {
      setIsGenerating(false)
    }
  }

  const sendMessage = async (messageText?: string) => {
    const textToSend = messageText || input.trim()
    
    if (!textToSend || isGenerating) return

    // Add user message
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

      // Add assistant message
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
      
      // Add error message
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

  // Generate quick actions
  const quickActions = scan
    ? generateQuickActions({
        scanId,
        scanPath: scan.scanPath,
        totalFindings: scan.totalFindings,
        criticalCount: scan.criticalCount,
        highCount: scan.highCount,
        mediumCount: scan.mediumCount,
        lowCount: scan.lowCount,
        infoCount: scan.infoCount,
        ...calculateSecurityScore({
          criticalCount: scan.criticalCount,
          highCount: scan.highCount,
          mediumCount: scan.mediumCount,
          lowCount: scan.lowCount,
          infoCount: scan.infoCount,
          totalFindings: scan.totalFindings,
        }),
        categories: Array.from(new Set(scan.scanData.findings.map((f) => f.category))),
        priorityFindings: scan.scanData.findings.slice(0, 10),
      })
    : []

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push(`/dashboard/scans/${scanId}`)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to scan</span>
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-700 rounded w-1/2" />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4">
              <p className="text-red-400">Failed to load scan</p>
            </div>
          )}

          {/* Scan Header */}
          {scan && !isLoading && (
            <>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-white mb-1">VettCode Coach</h1>
                  <p className="text-gray-400">AI Security Overview</p>
                </div>
              </div>

              {/* Scan Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Shield className="w-4 h-4" />
                    <span>Project</span>
                  </div>
                  <p className="text-white font-medium truncate">{scan.scanPath}</p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Scanned</span>
                  </div>
                  <p className="text-white font-medium">
                    {new Date(scan.timestamp).toLocaleDateString()}
                  </p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <BarChart3 className="w-4 h-4" />
                    <span>Security Score</span>
                  </div>
                  <p className="text-white font-medium">
                    {calculateSecurityScore({
                      criticalCount: scan.criticalCount,
                      highCount: scan.highCount,
                      mediumCount: scan.mediumCount,
                      lowCount: scan.lowCount,
                      infoCount: scan.infoCount,
                      totalFindings: scan.totalFindings,
                    }).score}
                    /100
                  </p>
                </div>

                <div className="bg-gray-900/50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span>Total Findings</span>
                  </div>
                  <p className="text-white font-medium">{scan.totalFindings}</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Chat Area */}
        {scan && !isLoading && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && !isGenerating && (
                <div className="flex flex-col items-center justify-center h-full text-center px-4">
                  <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Ask VettCode Coach
                  </h3>
                  <p className="text-gray-400 mb-6 max-w-md">
                    Get AI-powered explanations about your security scan. Ask questions, learn
                    concepts, and get personalized guidance.
                  </p>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-3xl rounded-2xl px-5 py-4 ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-100 border border-gray-700'
                    }`}
                  >
                    <div className="prose prose-invert prose-sm max-w-none">
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Style code blocks
                            code: ({ node, inline, className, children, ...props }: any) => {
                              return inline ? (
                                <code className="bg-gray-900 px-1.5 py-0.5 rounded text-purple-300" {...props}>
                                  {children}
                                </code>
                              ) : (
                                <code className="block bg-gray-900 p-3 rounded-lg text-sm overflow-x-auto" {...props}>
                                  {children}
                                </code>
                              )
                            },
                            // Style links
                            a: ({ node, children, ...props }: any) => (
                              <a className="text-purple-400 hover:text-purple-300 underline" {...props}>
                                {children}
                              </a>
                            ),
                            // Style lists
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
                            // Style paragraphs
                            p: ({ node, children, ...props }: any) => (
                              <p className="mb-3 last:mb-0 leading-relaxed" {...props}>
                                {children}
                              </p>
                            ),
                            // Style headings
                            h3: ({ node, children, ...props }: any) => (
                              <h3 className="text-lg font-semibold mt-4 mb-2 text-white" {...props}>
                                {children}
                              </h3>
                            ),
                            // Style strong/bold
                            strong: ({ node, children, ...props }: any) => (
                              <strong className="font-semibold text-white" {...props}>
                                {children}
                              </strong>
                            ),
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 border border-gray-700 rounded-2xl px-5 py-4">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>VettCode Coach is thinking...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length > 0 && !isGenerating && quickActions.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-700 bg-gray-800/30">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-400">Quick actions:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(action)}
                      disabled={isGenerating}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quota Warning */}
            {quotaExceeded && (
              <div className="px-6 py-3 bg-yellow-500/10 border-t border-yellow-500/50">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-yellow-400 font-medium">AI Quota Reached</p>
                    <p className="text-yellow-300/70 mt-1">
                      You've reached your daily AI limit. Upgrade for more requests or wait until
                      tomorrow!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-6 border-t border-gray-700 bg-gray-800/50">
              <div className="flex gap-3">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything about this scan..."
                  disabled={isGenerating || quotaExceeded}
                  className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  rows={2}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isGenerating || quotaExceeded}
                  className="px-6 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isGenerating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Press Enter to send • Shift+Enter for new line
              </p>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

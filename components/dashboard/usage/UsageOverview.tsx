'use client'

import { useEffect, useState } from 'react'
import { Zap, TrendingUp, Calendar, Award } from 'lucide-react'

interface TokenBalance {
  currentBalance: number
  monthlyAllocation: number
  percentUsed: number
  plan: string
  // Free user specific
  dailyLimit?: number
  dailyUsed?: number
  dailyRemaining?: number
  isLastDayOfMonth?: boolean
}

interface UsageOverviewProps {
  userId: string
}

export default function UsageOverview({ userId }: UsageOverviewProps) {
  const [balance, setBalance] = useState<TokenBalance | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBalance()
  }, [userId])

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/usage/tokens')
      if (res.ok) {
        const data = await res.json()
        setBalance(data)
      }
    } catch (error) {
      console.error('Failed to fetch token balance:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-800 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-800 rounded w-32"></div>
          </div>
        ))}
      </div>
    )
  }

  const tokensUsed = balance ? balance.monthlyAllocation - balance.currentBalance : 0
  const percentUsed = balance?.percentUsed || 0

  return (
    <div className="space-y-6">
      {/* Token Balance Card */}
      <div className="bg-gradient-to-br from-purple-900/30 to-green-900/30 border border-purple-500/30 rounded-xl p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-gray-300">Token Balance</h2>
            </div>
            <p className="text-4xl font-bold text-white">
              {balance?.currentBalance.toLocaleString() || '0'}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              of {balance?.monthlyAllocation.toLocaleString() || '0'} monthly tokens
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${percentUsed > 80 ? 'text-red-400' : percentUsed > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
              {percentUsed}%
            </div>
            <p className="text-xs text-gray-400">used</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative mb-4">
          <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                percentUsed > 80
                  ? 'bg-gradient-to-r from-red-600 to-red-500'
                  : percentUsed > 50
                  ? 'bg-gradient-to-r from-yellow-600 to-yellow-500'
                  : 'bg-gradient-to-r from-green-600 to-green-500'
              }`}
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
        </div>

        {/* Daily Limit for Free Users */}
        {balance?.plan === 'free' && balance.dailyLimit && (
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-semibold text-blue-300">Daily Limit (Free Plan)</span>
              </div>
              <span className="text-sm font-bold text-blue-300">
                {balance.dailyRemaining}/{balance.dailyLimit} tokens
              </span>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(((balance.dailyUsed || 0) / balance.dailyLimit) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {balance.isLastDayOfMonth 
                ? '🎉 Last day of month! Use all remaining tokens today.'
                : `Resets daily. ~${Math.floor(balance.dailyLimit / 50)} AI requests/day with free models.`
              }
            </p>
          </div>
        )}

        {/* Warnings */}
        {percentUsed > 80 && balance?.plan === 'free' && (
          <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-400">
              ⚠️ You're running low on tokens. Upgrade to Pro for 100,000 tokens/month with no daily limits.
            </p>
          </div>
        )}
        {balance?.plan !== 'free' && percentUsed > 80 && (
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-sm text-yellow-400">
              💡 Don't worry! Your tokens will top up automatically next month (not reset, they accumulate).
            </p>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Tokens Used */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Tokens Used</p>
              <p className="text-2xl font-bold text-white">
                {tokensUsed.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Tokens Remaining */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Remaining</p>
              <p className="text-2xl font-bold text-white">
                {balance?.currentBalance.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Reset Date */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Resets On</p>
              <p className="text-lg font-bold text-white">
                {new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <Award className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-white mb-1">How Tokens Work</h3>
            <p className="text-sm text-gray-300">
              Tokens are used when you interact with AI features. Different AI models use different amounts of tokens per request. 
              Your tokens reset monthly, so use them freely to build, analyze, and secure your projects.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

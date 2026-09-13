import { Coins, ExternalLink, Sparkles } from 'lucide-react'
import type { MirrorSiteCredits } from '@/lib/mirrorsite-credits'

interface MirrorSiteCreditsCardProps {
  credits: MirrorSiteCredits
}

export default function MirrorSiteCreditsCard({ credits }: MirrorSiteCreditsCardProps) {
  if (!credits.hasAccount) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-500/20 rounded-lg">
            <Coins className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">MirrorSite AI Credits</h3>
            <p className="text-sm text-gray-400">Available for project generation</p>
          </div>
        </div>
        <a
          href="https://mirrorsite.atai.ink/billing"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors"
        >
          <span>Manage</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Credits */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-violet-500/10">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Balance</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {credits.credits.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">credits</p>
        </div>

        {/* Subscription Credits */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-violet-500/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Subscription</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {credits.subscriptionCredits.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">renewable credits</p>
        </div>

        {/* Permanent Credits */}
        <div className="bg-gray-900/50 rounded-lg p-4 border border-violet-500/10">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Permanent</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {credits.permanentCredits.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">never expire</p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-violet-500/10">
        <p className="text-xs text-gray-400">
          Credits are used to generate and build applications on MirrorSite AI. Each project analysis and build consumes credits based on complexity.
        </p>
      </div>
    </div>
  )
}

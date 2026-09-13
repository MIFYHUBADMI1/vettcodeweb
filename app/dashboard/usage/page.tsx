import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getMirrorSiteCredits } from '@/lib/mirrorsite-credits'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import UsageOverview from '@/components/dashboard/usage/UsageOverview'
import PlanComparison from '@/components/dashboard/usage/PlanComparison'
import TokenUsageChart from '@/components/dashboard/usage/TokenUsageChart'
import MirrorSiteCreditsCard from '@/components/dashboard/MirrorSiteCreditsCard'

export const metadata = {
  title: 'Usage & Plans - VettCode by ATAI',
  description: 'View your usage and manage your plan',
}

export default async function UsagePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/signin')
  }

  // Fetch MirrorSite credits
  const mirrorSiteCredits = await getMirrorSiteCredits(session.user.email!)

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Usage & Plans</h1>
          <p className="text-gray-400">
            Monitor your token usage and explore plan options
          </p>
        </div>

        {/* MirrorSite Credits */}
        {mirrorSiteCredits !== null && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">MirrorSite AI Credits</h2>
            <MirrorSiteCreditsCard credits={mirrorSiteCredits} />
          </div>
        )}

        {/* VettCode Tokens */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">VettCode Tokens</h2>

          {/* Usage Overview */}
          <UsageOverview userId={session.user.id} />

          {/* Token Usage Chart */}
          <div className="mt-6">
            <TokenUsageChart userId={session.user.id} />
          </div>
        </div>

        {/* Plan Comparison */}
        <PlanComparison currentPlan={session.user.plan || 'free'} />
      </div>
    </DashboardLayout>
  )
}

import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import UsageOverview from '@/components/dashboard/usage/UsageOverview'
import PlanComparison from '@/components/dashboard/usage/PlanComparison'
import TokenUsageChart from '@/components/dashboard/usage/TokenUsageChart'

export const metadata = {
  title: 'Usage & Plans - VettCode',
  description: 'View your usage and manage your plan',
}

export default async function UsagePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/signin')
  }

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

        {/* Usage Overview */}
        <UsageOverview userId={session.user.id} />

        {/* Token Usage Chart */}
        <TokenUsageChart userId={session.user.id} />

        {/* Plan Comparison */}
        <PlanComparison currentPlan={session.user.plan || 'free'} />
      </div>
    </DashboardLayout>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { getUsageAnalytics } from '@/lib/usage-tracking'
import { getUserPlan } from '@/lib/subscription'

export async function GET(request: NextRequest) {
  try {
    // In production, get from auth session
    const userId = request.nextUrl.searchParams.get('userId') || 'anonymous'

    // Get usage analytics
    const analytics = await getUsageAnalytics(userId)
    
    // Get user's plan
    const plan = await getUserPlan(userId)

    return NextResponse.json({
      plan: {
        name: plan.name,
        tier: plan.id,
        dailyLimit: plan.dailyAIRequestLimit,
        monthlyLimit: plan.monthlyAIRequestLimit,
      },
      usage: {
        today: {
          requests: analytics.today.requests,
          cost: analytics.today.cost,
          remaining: Math.max(0, plan.dailyAIRequestLimit - analytics.today.requests),
        },
        thisMonth: {
          requests: analytics.thisMonth.requests,
          cost: analytics.thisMonth.cost,
          remaining:
            plan.monthlyAIRequestLimit > 0
              ? Math.max(0, plan.monthlyAIRequestLimit - analytics.thisMonth.requests)
              : null,
        },
      },
      providers: analytics.topProviders,
      features: analytics.topFeatures,
    })
  } catch (error: any) {
    console.error('Usage API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get usage data' },
      { status: 500 }
    )
  }
}

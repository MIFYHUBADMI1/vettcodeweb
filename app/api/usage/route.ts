import { NextRequest, NextResponse } from 'next/server'
import { getUsageAnalytics } from '@/lib/usage-tracking'
import { getUserPlan } from '@/lib/subscription'
import { UserModel } from '@/lib/models/User'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // In production, get from auth session
    const userId = request.nextUrl.searchParams.get('userId') || 'anonymous'

    // Get usage analytics
    const analytics = await getUsageAnalytics(userId)

    // Get user's plan
    const plan = await getUserPlan(userId)

    // Get token balance (falls back to plan allocation for anonymous/invalid users)
    let balance = null
    try {
      balance = await UserModel.getTokenBalance(userId)
    } catch (error) {
      console.warn('[USAGE] Could not fetch token balance:', error)
    }

    return NextResponse.json({
      plan: {
        name: plan.name,
        tier: plan.id,
        monthlyTokens: plan.monthlyTokenAllocation,
      },
      tokens: {
        currentBalance: balance?.currentBalance ?? plan.monthlyTokenAllocation,
        monthlyAllocation: balance?.monthlyAllocation ?? plan.monthlyTokenAllocation,
        percentUsed: balance?.percentUsed ?? 0,
        plan: balance?.plan ?? plan.id,
        dailyLimit: balance?.dailyLimit,
        dailyUsed: balance?.dailyUsed,
        dailyRemaining: balance?.dailyRemaining,
        isLastDayOfMonth: balance?.isLastDayOfMonth,
      },
      usage: {
        today: {
          requests: analytics.today.requests,
          cost: analytics.today.cost,
        },
        thisMonth: {
          requests: analytics.thisMonth.requests,
          cost: analytics.thisMonth.cost,
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
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { UserModel } from '@/lib/models/User'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get token balance
    const balance = await UserModel.getTokenBalance(session.user.id)

    if (!balance) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(balance)
  } catch (error) {
    console.error('Failed to fetch token balance:', error)
    return NextResponse.json(
      { error: 'Failed to fetch token balance' },
      { status: 500 }
    )
  }
}

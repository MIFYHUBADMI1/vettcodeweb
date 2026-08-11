import { NextRequest, NextResponse } from 'next/server'
import { listScans } from '@/lib/imagekit'

export async function GET(request: NextRequest) {
  try {
    const scans = await listScans(20)

    return NextResponse.json({
      scans,
      count: scans.length,
    })
  } catch (error: any) {
    console.error('List scans API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to list scans' },
      { status: 500 }
    )
  }
}

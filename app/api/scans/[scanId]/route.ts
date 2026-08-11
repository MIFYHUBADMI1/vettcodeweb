/**
 * Scan Detail API
 * GET /api/scans/[scanId] - Get specific scan details
 * 
 * Requires authentication (CLI or Web)
 * Verifies scan ownership
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateCLIRequest } from '@/lib/cli-auth'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ScanModel } from '@/lib/models/Scan'

export async function GET(
  request: NextRequest,
  { params }: { params: { scanId: string } }
) {
  try {
    // Try CLI authentication first
    const cliAuth = await authenticateCLIRequest(request)
    let userId: string | null = null

    if (cliAuth.authenticated) {
      userId = cliAuth.userId!
    } else {
      // Try web session authentication
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        userId = session.user.id
      }
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { scanId } = params

    if (!scanId) {
      return NextResponse.json(
        { error: 'Scan ID is required' },
        { status: 400 }
      )
    }

    // Get scan from database
    const scan = await ScanModel.findById(scanId)

    if (!scan) {
      return NextResponse.json(
        { error: 'Scan not found' },
        { status: 404 }
      )
    }

    // Verify ownership
    if (scan.userId !== userId) {
      return NextResponse.json(
        { error: 'Scan not found' }, // Don't reveal that it exists
        { status: 404 }
      )
    }

    // Return full scan data
    return NextResponse.json({
      scan: {
        id: scan._id?.toString(),
        scanPath: scan.scanPath,
        timestamp: scan.timestamp.toISOString(),
        sensorsUsed: scan.sensorsUsed,
        sensorsSkipped: scan.sensorsSkipped,
        totalFindings: scan.totalFindings,
        criticalCount: scan.criticalCount,
        highCount: scan.highCount,
        mediumCount: scan.mediumCount,
        lowCount: scan.lowCount,
        infoCount: scan.infoCount,
        scanData: scan.scanData,
        createdAt: scan.createdAt.toISOString(),
      },
    })
  } catch (error: any) {
    console.error('Get scan API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get scan' },
      { status: 500 }
    )
  }
}

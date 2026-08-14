/**
 * Vibe Project Scan API
 * POST /api/vibe/projects/[id]/scan - Trigger security scan
 * GET  /api/vibe/projects/[id]/scan - Get latest scan results
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VibeProjectModel } from '@/lib/models/VibeProject';
import { ScanModel } from '@/lib/models/Scan';
import { runSecurityScan, linkScanToProject } from '@/lib/services/vibe-security-service';
import { checkQuota } from '@/lib/usage-tracking';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify project access
    const project = await VibeProjectModel.findById(params.id, session.user.email);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Check quota for security scans
    const quotaCheck = await checkQuota(session.user.email, 'security_scan');
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { error: quotaCheck.reason || 'Security scan quota exceeded' },
        { status: 429 }
      );
    }
    
    // Run security scan
    const scanResult = await runSecurityScan(params.id, session.user.email);
    
    // Link scan to project
    await linkScanToProject(params.id, session.user.email, scanResult.scanId);
    
    return NextResponse.json({
      success: true,
      scan: scanResult,
    });
  } catch (error) {
    console.error('Failed to run security scan:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to run security scan' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify project access
    const project = await VibeProjectModel.findById(params.id, session.user.email);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    
    // Get latest scan for this user (if project has linked scans, get the latest)
    const latestScan = await ScanModel.getLatest(session.user.email);
    
    if (!latestScan) {
      return NextResponse.json({ scan: null });
    }
    
    // Return scan summary with findings
    return NextResponse.json({
      scan: {
        scanId: latestScan._id!.toString(),
        findings: latestScan.scanData.findings,
        totalFindings: latestScan.totalFindings,
        criticalCount: latestScan.criticalCount,
        highCount: latestScan.highCount,
        mediumCount: latestScan.mediumCount,
        lowCount: latestScan.lowCount,
        infoCount: latestScan.infoCount,
        timestamp: latestScan.timestamp,
      },
    });
  } catch (error) {
    console.error('Failed to get scan results:', error);
    return NextResponse.json(
      { error: 'Failed to load scan results' },
      { status: 500 }
    );
  }
}

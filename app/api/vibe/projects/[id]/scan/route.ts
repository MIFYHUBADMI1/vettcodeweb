/**
 * Vibe Project Scan API
 * POST /api/vibe/projects/[id]/scan - Trigger security scan
 * GET  /api/vibe/projects/[id]/scan - Get latest scan results
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VibeProjectModel } from '@/lib/models/VibeProject';
import { ScanModel } from '@/lib/models/Scan';
import { checkQuota } from '@/lib/usage-tracking';
import { NextResponse } from 'next/server';

export const maxDuration = 300; // 5 minutes (for Vercel Pro)
export const dynamic = 'force-dynamic';

const SCAN_SERVICE_URL = process.env.VETTCODE_SCAN_SERVICE_URL || '';
const SCAN_SERVICE_API_KEY = process.env.VETTCODE_SERVICE_API_KEY || '';

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
    
    // Check if scanning service is configured
    if (!SCAN_SERVICE_URL || !SCAN_SERVICE_API_KEY) {
      return NextResponse.json(
        { 
          error: 'Security scanning is coming soon! Deploy the scanning service first.',
          message: 'To enable scanning, deploy the SCAN-SERVICE and configure VETTCODE_SCAN_SERVICE_URL and VETTCODE_SERVICE_API_KEY environment variables.',
          temporary: true
        },
        { status: 503 }
      );
    }
    
    // Check quota for security scans
    const quotaCheck = await checkQuota(session.user.email, 'security_scan');
    if (!quotaCheck.allowed) {
      return NextResponse.json(
        { error: quotaCheck.reason || 'Security scan quota exceeded' },
        { status: 429 }
      );
    }
    
    // Get project files
    const body = await request.json();
    const { files } = body;

    if (!files || !Array.isArray(files)) {
      return NextResponse.json(
        { error: 'Files array is required in request body' },
        { status: 400 }
      );
    }
    
    console.log(`[Scan API] Calling scanning service for project ${params.id}...`);
    
    // Call external scanning service
    const scanResponse = await fetch(`${SCAN_SERVICE_URL}/api/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SCAN_SERVICE_API_KEY}`,
      },
      body: JSON.stringify({
        projectId: params.id,
        userId: session.user.email,
        files,
      }),
    });

    if (!scanResponse.ok) {
      const errorData = await scanResponse.json().catch(() => ({}));
      console.error('[Scan API] Scanning service error:', errorData);
      
      return NextResponse.json(
        {
          error: 'Scanning service failed',
          message: errorData.message || 'The scanning service encountered an error',
          details: errorData,
        },
        { status: scanResponse.status }
      );
    }

    const scanResult = await scanResponse.json();
    console.log(`[Scan API] Scan completed: ${scanResult.totalFindings || 0} findings`);
    
    // TODO: Store scan results in database
    // await ScanModel.create({
    //   userId: session.user.email,
    //   scanData: scanResult,
    //   totalFindings: scanResult.totalFindings,
    //   criticalCount: scanResult.criticalCount,
    //   highCount: scanResult.highCount,
    //   mediumCount: scanResult.mediumCount,
    //   lowCount: scanResult.lowCount,
    //   infoCount: scanResult.infoCount,
    // });

    return NextResponse.json({
      success: true,
      scan: scanResult,
    });
  } catch (error) {
    console.error('[Scan API] Scan failed:', error);
    
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
  _request: Request,
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

import { NextRequest, NextResponse } from 'next/server'
import { uploadScanResult } from '@/lib/imagekit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (!body || !body.version || !body.scan || !body.findings) {
      return NextResponse.json({ error: 'Invalid scan result format' }, { status: 400 })
    }

    // Upload to ImageKit
    const url = await uploadScanResult(body)

    return NextResponse.json({
      success: true,
      url,
      message: 'Scan result uploaded successfully',
    })
  } catch (error: any) {
    console.error('Upload API error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to upload scan result' },
      { status: 500 }
    )
  }
}

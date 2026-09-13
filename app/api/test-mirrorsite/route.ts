import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getMirrorSiteProjects } from '@/lib/mirrorsite'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  console.log('[test-mirrorsite] Testing MirrorSite integration for:', session.user.email)

  const result = await getMirrorSiteProjects(session.user.email)

  return NextResponse.json({
    configured: result !== null,
    result: result,
    email: session.user.email,
    timestamp: new Date().toISOString(),
  })
}

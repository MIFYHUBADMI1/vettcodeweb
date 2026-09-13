import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  // Only allow authenticated users to check env status
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check environment variables (without exposing the actual values)
  const envStatus = {
    MIRRORSITE_API_URL: !!process.env.MIRRORSITE_API_URL,
    ATAI_INTERNAL_KEY: !!process.env.ATAI_INTERNAL_KEY,
    MONGODB_URI: !!process.env.MONGODB_URI,
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    OPENROUTER_API_KEY: !!process.env.OPENROUTER_API_KEY,
    GROQ_API_KEY: !!process.env.GROQ_API_KEY,
    GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
    
    // Show partial values for debugging (first few characters only)
    MIRRORSITE_API_URL_partial: process.env.MIRRORSITE_API_URL?.substring(0, 20) + '...',
    ATAI_INTERNAL_KEY_partial: process.env.ATAI_INTERNAL_KEY?.substring(0, 10) + '...',
  }

  return NextResponse.json({ 
    status: 'ok',
    env: envStatus,
    allConfigured: envStatus.MIRRORSITE_API_URL && envStatus.ATAI_INTERNAL_KEY
  })
}

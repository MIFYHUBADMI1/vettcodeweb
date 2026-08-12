/**
 * Debug Endpoint - Check Environment Variables
 * GET /api/debug/env - Check if required credentials are set
 */

import { NextResponse } from 'next/server'

export async function GET() {
  const envCheck = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    
    // ImageKit
    imagekit: {
      publicKey: {
        exists: !!process.env.IMAGEKIT_PUBLIC_KEY,
        length: process.env.IMAGEKIT_PUBLIC_KEY?.length || 0,
        preview: process.env.IMAGEKIT_PUBLIC_KEY?.substring(0, 15) + '...' || 'NOT SET'
      },
      privateKey: {
        exists: !!process.env.IMAGEKIT_PRIVATE_KEY,
        length: process.env.IMAGEKIT_PRIVATE_KEY?.length || 0,
        preview: process.env.IMAGEKIT_PRIVATE_KEY?.substring(0, 15) + '...' || 'NOT SET'
      },
      urlEndpoint: {
        exists: !!process.env.IMAGEKIT_URL_ENDPOINT,
        value: process.env.IMAGEKIT_URL_ENDPOINT || 'NOT SET'
      }
    },
    
    // MongoDB
    mongodb: {
      exists: !!process.env.MONGODB_URI,
      length: process.env.MONGODB_URI?.length || 0,
      preview: process.env.MONGODB_URI?.substring(0, 30) + '...' || 'NOT SET'
    },
    
    // NextAuth
    nextauth: {
      url: {
        exists: !!process.env.NEXTAUTH_URL,
        value: process.env.NEXTAUTH_URL || 'NOT SET'
      },
      secret: {
        exists: !!process.env.NEXTAUTH_SECRET,
        length: process.env.NEXTAUTH_SECRET?.length || 0
      }
    },
    
    // Google OAuth
    google: {
      clientId: {
        exists: !!process.env.GOOGLE_CLIENT_ID,
        length: process.env.GOOGLE_CLIENT_ID?.length || 0,
        preview: process.env.GOOGLE_CLIENT_ID?.substring(0, 20) + '...' || 'NOT SET'
      },
      clientSecret: {
        exists: !!process.env.GOOGLE_CLIENT_SECRET,
        length: process.env.GOOGLE_CLIENT_SECRET?.length || 0
      }
    },
    
    // AI Providers
    ai: {
      openrouter: {
        exists: !!process.env.OPENROUTER_API_KEY,
        length: process.env.OPENROUTER_API_KEY?.length || 0
      },
      groq: {
        exists: !!process.env.GROQ_API_KEY,
        length: process.env.GROQ_API_KEY?.length || 0
      }
    },
    
    // SMTP
    smtp: {
      host: {
        exists: !!process.env.SMTP_HOST,
        value: process.env.SMTP_HOST || 'NOT SET'
      },
      port: {
        exists: !!process.env.SMTP_PORT,
        value: process.env.SMTP_PORT || 'NOT SET'
      },
      user: {
        exists: !!process.env.SMTP_USER,
        length: process.env.SMTP_USER?.length || 0
      }
    },
    
    // Overall Status
    allConfigured: {
      imagekit: !!(process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT),
      mongodb: !!process.env.MONGODB_URI,
      nextauth: !!(process.env.NEXTAUTH_URL && process.env.NEXTAUTH_SECRET),
      google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
      smtp: !!(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASSWORD)
    }
  }
  
  return NextResponse.json(envCheck, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    }
  })
}

import { NextResponse } from 'next/server'

export async function GET() {
  const apiUrl = process.env.MIRRORSITE_API_URL
  const internalKey = process.env.ATAI_INTERNAL_KEY
  
  console.log('[test-fetch] Testing direct fetch to MirrorSite')
  console.log('[test-fetch] API URL:', apiUrl)
  console.log('[test-fetch] Key:', internalKey?.substring(0, 10) + '...')
  
  try {
    const baseUrl = apiUrl?.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
    const url = `${baseUrl}/api/internal/test-auth`
    
    console.log('[test-fetch] Fetching:', url)
    console.log('[test-fetch] Sending header X-Internal-Key:', internalKey?.substring(0, 10) + '...')
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Internal-Key': internalKey!,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })
    
    console.log('[test-fetch] Response status:', res.status)
    
    const json = await res.json()
    console.log('[test-fetch] Response:', JSON.stringify(json, null, 2))
    
    return NextResponse.json({
      test: 'fetch from WEB to MirrorSite',
      url,
      status: res.status,
      response: json,
    })
  } catch (err) {
    console.error('[test-fetch] Error:', err)
    return NextResponse.json({
      error: err instanceof Error ? err.message : String(err)
    }, { status: 500 })
  }
}

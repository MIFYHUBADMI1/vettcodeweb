/**
 * MirrorSite Credit Integration
 * 
 * Fetches credit balance from MirrorSite AI for the current user
 */

export interface MirrorSiteCredits {
  hasAccount: boolean
  credits: number
  subscriptionCredits: number
  permanentCredits: number
  userId?: string
}

/**
 * Get MirrorSite credit balance for a user
 */
export async function getMirrorSiteCredits(email: string): Promise<MirrorSiteCredits | null> {
  const apiUrl = process.env.MIRRORSITE_API_URL
  const internalKey = process.env.ATAI_INTERNAL_KEY

  if (!apiUrl || !internalKey) {
    console.error('[mirrorsite-credits] Configuration missing')
    return null
  }

  try {
    const baseUrl = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl
    const url = new URL('/api/internal/credits', baseUrl)
    url.searchParams.set('email', email)

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-Internal-Key': internalKey,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error('[mirrorsite-credits] API error:', res.status)
      return null
    }

    const json = await res.json()
    if (!json.ok || !json.data) return null

    return json.data as MirrorSiteCredits
  } catch (err) {
    console.error('[mirrorsite-credits] fetch failed:', err)
    return null
  }
}

/**
 * MirrorSite AI — server-side fetch helper
 *
 * Used exclusively in Server Components / Route Handlers. Never import this
 * into client components — it reads secrets from process.env.
 */

export interface MirrorSiteProject {
  id: string
  name: string
  mode: 'website' | 'scratch' | string
  state: string
  sourceUrl: string | null
  updatedAt: number
  /** Direct link to the project workspace on mirrorsite.atai.ink */
  url: string
}

export interface MirrorSiteProjectsResult {
  projects: MirrorSiteProject[]
  /** Link to the user's MirrorSite dashboard (or register page if no account) */
  mirrorSiteUrl: string
  /** Link to create a new project */
  newProjectUrl: string
}

/**
 * Fetch the MirrorSite AI projects for a given user email.
 * Returns null on configuration errors so callers can degrade gracefully.
 */
export async function getMirrorSiteProjects(
  email: string,
): Promise<MirrorSiteProjectsResult | null> {
  const apiUrl = process.env.MIRRORSITE_API_URL
  const internalKey = process.env.ATAI_INTERNAL_KEY

  console.log('[mirrorsite] Checking environment variables...')
  console.log('[mirrorsite] MIRRORSITE_API_URL:', apiUrl ? `${apiUrl.substring(0, 20)}...` : 'NOT SET')
  console.log('[mirrorsite] ATAI_INTERNAL_KEY:', internalKey ? `${internalKey.substring(0, 10)}...` : 'NOT SET')

  if (!apiUrl || !internalKey) {
    console.error('[mirrorsite] Configuration missing!')
    console.error('[mirrorsite] MIRRORSITE_API_URL:', !!apiUrl)
    console.error('[mirrorsite] ATAI_INTERNAL_KEY:', !!internalKey)
    // Integration not configured — fail silently so the dashboard still loads.
    return null
  }

  try {
    const url = new URL('/api/internal/projects', apiUrl)
    url.searchParams.set('email', email)

    console.log('[mirrorsite] Fetching projects from:', url.toString().replace(email, 'xxx@xxx.com'))

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-Internal-Key': internalKey,
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Don't cache internal API calls
    })

    console.log('[mirrorsite] Response status:', res.status)

    if (!res.ok) {
      const errorText = await res.text().catch(() => '')
      console.error('[mirrorsite] internal API error:', res.status, errorText)
      return null
    }

    const json = await res.json()
    console.log('[mirrorsite] Response data:', json.ok ? 'OK' : 'NOT OK', 'projects:', json.data?.projects?.length ?? 0)

    if (!json.ok || !json.data) return null

    return json.data as MirrorSiteProjectsResult
  } catch (err) {
    console.error('[mirrorsite] fetch failed:', err)
    return null
  }
}

/** Human-readable label for a MirrorSite project state */
export function mirrorSiteStateLabel(state: string): string {
  const labels: Record<string, string> = {
    created: 'Analysing',
    analysis_complete: 'Ready to build',
    specification_ready: 'Ready to build',
    building: 'Building…',
    deploying: 'Deploying…',
    ready: 'Live',
    build_complete: 'Built',
    build_failed: 'Build failed',
    deploy_failed: 'Deploy failed',
  }
  return labels[state] ?? state
}

/** Tailwind colour classes for each MirrorSite project state */
export function mirrorSiteStateColor(state: string): string {
  if (state === 'ready' || state === 'build_complete') return 'text-green-400'
  if (state === 'building' || state === 'deploying') return 'text-yellow-400'
  if (state === 'build_failed' || state === 'deploy_failed') return 'text-red-400'
  return 'text-gray-400'
}

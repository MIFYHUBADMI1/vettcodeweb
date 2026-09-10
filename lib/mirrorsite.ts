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

  if (!apiUrl || !internalKey) {
    // Integration not configured — fail silently so the dashboard still loads.
    return null
  }

  try {
    const url = new URL('/api/internal/projects', apiUrl)
    url.searchParams.set('email', email)

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-internal-key': internalKey,
        'Content-Type': 'application/json',
      },
      // Next.js: revalidate every 60 s so the dashboard stays reasonably fresh
      // without hammering MirrorSite on every page load.
      next: { revalidate: 60 },
    })

    if (!res.ok) {
      console.error('[mirrorsite] internal API error:', res.status, await res.text().catch(() => ''))
      return null
    }

    const json = await res.json()
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

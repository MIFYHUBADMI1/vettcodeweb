import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getMirrorSiteProjects } from '@/lib/mirrorsite'
import { getMirrorSiteCredits } from '@/lib/mirrorsite-credits'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardWelcome from '@/components/dashboard/DashboardWelcome'
import EmptyWorkspace from '@/components/dashboard/EmptyWorkspace'
import NextActionCard from '@/components/dashboard/NextActionCard'
import DashboardContent from '@/components/dashboard/DashboardContent'
import EcosystemQuickAccess from '@/components/dashboard/EcosystemQuickAccess'
import MirrorSiteProjectsCard from '@/components/dashboard/MirrorSiteProjectsCard'
import MirrorSiteCreditsCard from '@/components/dashboard/MirrorSiteCreditsCard'

export const metadata = {
  title: 'Dashboard - VettCode by ATAI',
  description: 'Your VettCode workspace',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/signin')
  }

  // Fetch MirrorSite AI projects for this user (server-side, cached 60s).
  // Falls back to null if the integration isn't configured or the request fails.
  const mirrorSiteData = await getMirrorSiteProjects(session.user.email!)
  const mirrorSiteCredits = await getMirrorSiteCredits(session.user.email!)

  const hasProjects = (mirrorSiteData?.projects.length ?? 0) > 0

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <DashboardWelcome name={session.user.name || 'Developer'} />

        {/* Ecosystem Quick Access - Always visible for easy navigation */}
        <EcosystemQuickAccess />

        {/* MirrorSite Credits Balance */}
        {mirrorSiteCredits !== null && <MirrorSiteCreditsCard credits={mirrorSiteCredits} />}

        {/* MirrorSite AI Projects — shown whenever the integration is live */}
        {mirrorSiteData !== null && (
          <MirrorSiteProjectsCard data={mirrorSiteData} />
        )}

        {/* Empty State or placeholder when no Mirror projects exist yet */}
        {!hasProjects && <EmptyWorkspace />}

        {/* VettCode Ecosystem Dashboard - Shows scans, AI usage, and actions */}
        <DashboardContent userId={session.user.id} />

        {/* Next Action */}
        <NextActionCard hasProjects={hasProjects} />
      </div>
    </DashboardLayout>
  )
}

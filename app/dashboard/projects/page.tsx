import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getMirrorSiteProjects } from '@/lib/mirrorsite'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import MirrorSiteProjectsPage from '@/components/dashboard/projects/MirrorSiteProjectsPage'

export const metadata = {
  title: 'Projects - VettCode by ATAI',
  description: 'Your MirrorSite AI projects',
}

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/signin')
  }

  const mirrorSiteData = await getMirrorSiteProjects(session.user.email!)

  return (
    <DashboardLayout>
      <MirrorSiteProjectsPage data={mirrorSiteData} />
    </DashboardLayout>
  )
}

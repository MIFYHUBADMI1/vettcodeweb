import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import ProjectsList from '@/components/dashboard/projects/ProjectsList'
import ProjectsHeader from '@/components/dashboard/projects/ProjectsHeader'

export const metadata = {
  title: 'Projects - VettCode by ATAI',
  description: 'Manage your projects',
}

export default async function ProjectsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/signin')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ProjectsHeader />
        <ProjectsList userId={session.user.id} />
      </div>
    </DashboardLayout>
  )
}
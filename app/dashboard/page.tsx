import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import DashboardWelcome from '@/components/dashboard/DashboardWelcome'
import EmptyWorkspace from '@/components/dashboard/EmptyWorkspace'
import WorkspaceStats from '@/components/dashboard/WorkspaceStats'
import NextActionCard from '@/components/dashboard/NextActionCard'

export const metadata = {
  title: 'Dashboard - VettCode',
  description: 'Your VettCode workspace',
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/signin')
  }

  // TODO: Fetch real project data when backend is ready
  const projects = []
  const hasProjects = projects.length > 0

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Header */}
        <DashboardWelcome name={session.user.name || 'Developer'} />

        {/* Empty State or Projects */}
        {!hasProjects ? (
          <EmptyWorkspace />
        ) : (
          <div className="space-y-6">
            {/* TODO: Recent Projects Section */}
            <div className="text-gray-400">
              <p>Your projects will appear here</p>
            </div>
          </div>
        )}

        {/* Workspace Overview */}
        <WorkspaceStats 
          projectCount={projects.length}
          securityStatus={projects.length === 0 ? 'none' : 'unknown'}
          deploymentCount={0}
        />

        {/* Next Action */}
        <NextActionCard 
          hasProjects={hasProjects}
        />
      </div>
    </DashboardLayout>
  )
}

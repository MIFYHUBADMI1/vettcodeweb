'use client'

import { ReactNode, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { 
  LayoutDashboard, 
  FolderKanban, 
  Sparkles, 
  Terminal, 
  Shield, 
  Rocket, 
  Cloud,
  CreditCard,
  Settings,
  Menu,
  X,
  ChevronDown,
  LogOut
} from 'lucide-react'
import clsx from 'clsx'

interface DashboardLayoutProps {
  children: ReactNode
}

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  section?: string
  comingSoon?: boolean
}

const navigation: NavItem[] = [
  // WORKSPACE
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/dashboard/projects', icon: FolderKanban, comingSoon: true },
  
  // BUILD
  { label: 'VettCode Vibe', href: '/dashboard/vibe', icon: Sparkles, section: 'BUILD', comingSoon: true },
  { label: 'Vibe CLI', href: '/dashboard/vibe-cli', icon: Terminal, comingSoon: true },
  
  // SECURE
  { label: 'Security', href: '/dashboard/security', icon: Shield, section: 'SECURE', comingSoon: true },
  
  // SHIP
  { label: 'Deployments', href: '/dashboard/deployments', icon: Rocket, section: 'SHIP', comingSoon: true },
  { label: 'Web Host', href: '/dashboard/host', icon: Cloud, comingSoon: true },
  
  // ACCOUNT
  { label: 'Usage & Plans', href: '/dashboard/usage', icon: CreditCard, section: 'ACCOUNT', comingSoon: true },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings, comingSoon: true },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-gray-900 border-r border-gray-800">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-800">
            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
              VettCode
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex flex-1 flex-col overflow-y-auto py-4">
            <nav className="flex-1 space-y-1 px-3">
              {navigation.map((item, index) => {
                const isActive = pathname === item.href
                const previousItem = navigation[index - 1]
                const showSectionLabel = item.section && item.section !== previousItem?.section

                return (
                  <div key={item.href}>
                    {showSectionLabel && (
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">
                        {item.section}
                      </div>
                    )}
                    {item.comingSoon ? (
                      <div className={clsx(
                        'flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-not-allowed opacity-50',
                        'text-gray-400'
                      )}>
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>
                        <span className="text-xs text-gray-600">Soon</span>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className={clsx(
                          'flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                          isActive
                            ? 'bg-purple-600/20 text-purple-400 font-medium'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>

          {/* User Profile */}
          {session && (
            <div className="border-t border-gray-800 p-4">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors relative"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center font-semibold">
                  {session.user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-white truncate">{session.user.name || 'User'}</div>
                  <div className="text-xs text-gray-400 truncate">{session.user.email}</div>
                </div>
                <ChevronDown className={clsx(
                  'w-4 h-4 text-gray-400 transition-transform',
                  userMenuOpen && 'rotate-180'
                )} />
              </button>

              {userMenuOpen && (
                <div className="mt-2 py-2 bg-gray-800 rounded-lg border border-gray-700">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
            VettCode
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-gray-950">
          <div className="pt-20 pb-4 px-4 h-full overflow-y-auto">
            <nav className="space-y-1">
              {navigation.map((item, index) => {
                const isActive = pathname === item.href
                const previousItem = navigation[index - 1]
                const showSectionLabel = item.section && item.section !== previousItem?.section

                return (
                  <div key={item.href}>
                    {showSectionLabel && (
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-4">
                        {item.section}
                      </div>
                    )}
                    {item.comingSoon ? (
                      <div className={clsx(
                        'flex items-center justify-between px-3 py-2 text-sm rounded-lg cursor-not-allowed opacity-50',
                        'text-gray-400'
                      )}>
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </div>
                        <span className="text-xs text-gray-600">Soon</span>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={clsx(
                          'flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                          isActive
                            ? 'bg-purple-600/20 text-purple-400 font-medium'
                            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                        )}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    )}
                  </div>
                )
              })}
            </nav>

            {/* Mobile User Profile */}
            {session && (
              <div className="mt-8 pt-4 border-t border-gray-800">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center font-semibold">
                    {session.user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-white">{session.user.name || 'User'}</div>
                    <div className="text-sm text-gray-400">{session.user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="py-8 lg:py-10 px-4 sm:px-6 lg:px-8 mt-16 lg:mt-0">
          {children}
        </div>
      </main>
    </div>
  )
}

'use client'

import { ReactNode, useState, useEffect, useRef } from 'react'
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
  Globe,
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
  { label: 'Web Host', href: '/dashboard/host', icon: Globe, comingSoon: true },
  
  // ACCOUNT
  { label: 'Usage & Plans', href: '/dashboard/usage', icon: CreditCard, section: 'ACCOUNT', comingSoon: true },
  { label: 'Settings', href: '/dashboard/settings', icon: Settings, comingSoon: true },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Check if a route is active (handles nested routes)
  const isRouteActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [userMenuOpen])

  // Handle Escape key for mobile menu and user menu
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (mobileMenuOpen) {
          setMobileMenuOpen(false)
          menuButtonRef.current?.focus()
        }
        if (userMenuOpen) {
          setUserMenuOpen(false)
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [mobileMenuOpen, userMenuOpen])

  const handleSignOut = async () => {
    setUserMenuOpen(false)
    await signOut({ callbackUrl: '/' })
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    // Return focus to menu button
    setTimeout(() => menuButtonRef.current?.focus(), 100)
  }

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-gray-900 border-r border-gray-800">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center px-6 border-b border-gray-800">
            <Link 
              href="/dashboard" 
              className="text-xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              VettCode
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-6 px-3" aria-label="Dashboard navigation">
            <div className="space-y-1">
              {/* WORKSPACE Section */}
              <div className="mb-6">
                <div className="px-3 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">
                  Workspace
                </div>
                {navigation.slice(0, 2).map((item) => {
                  const isActive = isRouteActive(item.href)
                  const Icon = item.icon

                  return (
                    <div key={item.href}>
                      {item.comingSoon ? (
                        <div 
                          className="flex items-center justify-between px-3 py-2.5 text-sm rounded-lg cursor-not-allowed opacity-50 text-gray-500"
                          title={`${item.label} coming soon`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="text-[10px] text-gray-600 font-medium px-1.5 py-0.5 bg-gray-800 rounded uppercase tracking-wider">
                            Soon
                          </span>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className={clsx(
                            'flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all group relative',
                            isActive
                              ? 'bg-purple-600/10 text-purple-400 font-medium border-l-2 border-purple-500 pl-[10px]'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white border-l-2 border-transparent pl-[10px]'
                          )}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <Icon className={clsx(
                            'w-5 h-5 flex-shrink-0 transition-transform',
                            isActive && 'text-purple-400',
                            !isActive && 'group-hover:scale-110'
                          )} aria-hidden="true" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* BUILD Section */}
              <div className="mb-6">
                <div className="px-3 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">
                  Build
                </div>
                {navigation.slice(2, 4).map((item) => {
                  const isActive = isRouteActive(item.href)
                  const Icon = item.icon

                  return (
                    <div key={item.href}>
                      {item.comingSoon ? (
                        <div 
                          className="flex items-center justify-between px-3 py-2.5 text-sm rounded-lg cursor-not-allowed opacity-50 text-gray-500"
                          title={`${item.label} coming soon`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="text-[10px] text-gray-600 font-medium px-1.5 py-0.5 bg-gray-800 rounded uppercase tracking-wider">
                            Soon
                          </span>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className={clsx(
                            'flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all group relative',
                            isActive
                              ? 'bg-purple-600/10 text-purple-400 font-medium border-l-2 border-purple-500 pl-[10px]'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white border-l-2 border-transparent pl-[10px]'
                          )}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <Icon className={clsx(
                            'w-5 h-5 flex-shrink-0 transition-transform',
                            isActive && 'text-purple-400',
                            !isActive && 'group-hover:scale-110'
                          )} aria-hidden="true" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* SECURE Section */}
              <div className="mb-6">
                <div className="px-3 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">
                  Secure
                </div>
                {navigation.slice(4, 5).map((item) => {
                  const isActive = isRouteActive(item.href)
                  const Icon = item.icon

                  return (
                    <div key={item.href}>
                      {item.comingSoon ? (
                        <div 
                          className="flex items-center justify-between px-3 py-2.5 text-sm rounded-lg cursor-not-allowed opacity-50 text-gray-500"
                          title={`${item.label} coming soon`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="text-[10px] text-gray-600 font-medium px-1.5 py-0.5 bg-gray-800 rounded uppercase tracking-wider">
                            Soon
                          </span>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className={clsx(
                            'flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all group relative',
                            isActive
                              ? 'bg-purple-600/10 text-purple-400 font-medium border-l-2 border-purple-500 pl-[10px]'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white border-l-2 border-transparent pl-[10px]'
                          )}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <Icon className={clsx(
                            'w-5 h-5 flex-shrink-0 transition-transform',
                            isActive && 'text-purple-400',
                            !isActive && 'group-hover:scale-110'
                          )} aria-hidden="true" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* SHIP Section */}
              <div className="mb-6">
                <div className="px-3 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">
                  Ship
                </div>
                {navigation.slice(5, 7).map((item) => {
                  const isActive = isRouteActive(item.href)
                  const Icon = item.icon

                  return (
                    <div key={item.href}>
                      {item.comingSoon ? (
                        <div 
                          className="flex items-center justify-between px-3 py-2.5 text-sm rounded-lg cursor-not-allowed opacity-50 text-gray-500"
                          title={`${item.label} coming soon`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="text-[10px] text-gray-600 font-medium px-1.5 py-0.5 bg-gray-800 rounded uppercase tracking-wider">
                            Soon
                          </span>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className={clsx(
                            'flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all group relative',
                            isActive
                              ? 'bg-purple-600/10 text-purple-400 font-medium border-l-2 border-purple-500 pl-[10px]'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white border-l-2 border-transparent pl-[10px]'
                          )}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <Icon className={clsx(
                            'w-5 h-5 flex-shrink-0 transition-transform',
                            isActive && 'text-purple-400',
                            !isActive && 'group-hover:scale-110'
                          )} aria-hidden="true" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* ACCOUNT Section */}
              <div>
                <div className="px-3 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">
                  Account
                </div>
                {navigation.slice(7).map((item) => {
                  const isActive = isRouteActive(item.href)
                  const Icon = item.icon

                  return (
                    <div key={item.href}>
                      {item.comingSoon ? (
                        <div 
                          className="flex items-center justify-between px-3 py-2.5 text-sm rounded-lg cursor-not-allowed opacity-50 text-gray-500"
                          title={`${item.label} coming soon`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                            <span className="truncate">{item.label}</span>
                          </div>
                          <span className="text-[10px] text-gray-600 font-medium px-1.5 py-0.5 bg-gray-800 rounded uppercase tracking-wider">
                            Soon
                          </span>
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          className={clsx(
                            'flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg transition-all group relative',
                            isActive
                              ? 'bg-purple-600/10 text-purple-400 font-medium border-l-2 border-purple-500 pl-[10px]'
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white border-l-2 border-transparent pl-[10px]'
                          )}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <Icon className={clsx(
                            'w-5 h-5 flex-shrink-0 transition-transform',
                            isActive && 'text-purple-400',
                            !isActive && 'group-hover:scale-110'
                          )} aria-hidden="true" />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </nav>

          {/* User Profile */}
          {session && (
            <div className="border-t border-gray-800 p-4" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-800 transition-colors relative focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {getUserInitials(session.user.name)}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-medium text-white truncate">
                    {session.user.name || 'User'}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {session.user.email}
                  </div>
                </div>
                <ChevronDown className={clsx(
                  'w-4 h-4 text-gray-400 transition-transform flex-shrink-0',
                  userMenuOpen && 'rotate-180'
                )} aria-hidden="true" />
              </button>

              {userMenuOpen && (
                <div className="mt-2 py-1 bg-gray-800 rounded-lg border border-gray-700 shadow-lg">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors focus:outline-none focus:bg-gray-700"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
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
          <Link 
            href="/dashboard" 
            className="text-xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent"
          >
            VettCode
          </Link>
          <button
            ref={menuButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          
          {/* Mobile Drawer */}
          <div 
            id="mobile-menu"
            ref={mobileMenuRef}
            className="lg:hidden fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-gray-900 shadow-2xl transform transition-transform duration-300 ease-in-out"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex flex-col h-full">
              {/* Mobile Header */}
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
                <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent">
                  VettCode
                </span>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 overflow-y-auto py-6 px-4" aria-label="Mobile navigation">
                <div className="space-y-1">
                  {/* WORKSPACE Section */}
                  <div className="mb-6">
                    <div className="px-3 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">
                      Workspace
                    </div>
                    {navigation.slice(0, 2).map((item) => {
                      const isActive = isRouteActive(item.href)
                      const Icon = item.icon

                      return (
                        <div key={item.href}>
                          {item.comingSoon ? (
                            <div 
                              className="flex items-center justify-between px-3 py-3 text-sm rounded-lg cursor-not-allowed opacity-50 text-gray-500"
                              title={`${item.label} coming soon`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                                <span className="truncate">{item.label}</span>
                              </div>
                              <span className="text-[10px] text-gray-600 font-medium px-1.5 py-0.5 bg-gray-800 rounded uppercase tracking-wider">
                                Soon
                              </span>
                            </div>
                          ) : (
                            <Link
                              href={item.href}
                              className={clsx(
                                'flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-all group relative',
                                isActive
                                  ? 'bg-purple-600/10 text-purple-400 font-medium border-l-2 border-purple-500 pl-[10px]'
                                  : 'text-gray-300 hover:bg-gray-800 hover:text-white border-l-2 border-transparent pl-[10px]'
                              )}
                              aria-current={isActive ? 'page' : undefined}
                            >
                              <Icon className={clsx(
                                'w-5 h-5 flex-shrink-0',
                                isActive && 'text-purple-400'
                              )} aria-hidden="true" />
                              <span className="truncate">{item.label}</span>
                            </Link>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* BUILD Section */}
                  <div className="mb-6">
                    <div className="px-3 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">
                      Build
                    </div>
                    {navigation.slice(2, 4).map((item) => {
                      const isActive = isRouteActive(item.href)
                      const Icon = item.icon

                      return (
                        <div key={item.href}>
                          {item.comingSoon ? (
                            <div 
                              className="flex items-center justify-between px-3 py-3 text-sm rounded-lg cursor-not-allowed opacity-50 text-gray-500"
                              title={`${item.label} coming soon`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                                <span className="truncate">{item.label}</span>
                              </div>
                              <span className="text-[10px] text-gray-600 font-medium px-1.5 py-0.5 bg-gray-800 rounded uppercase tracking-wider">
                                Soon
                              </span>
                            </div>
                          ) : (
                            <Link
                              href={item.href}
                              className={clsx(
                                'flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-all group relative',
                                isActive
                                  ? 'bg-purple-600/10 text-purple-400 font-medium border-l-2 border-purple-500 pl-[10px]'
                                  : 'text-gray-300 hover:bg-gray-800 hover:text-white border-l-2 border-transparent pl-[10px]'
                              )}
                              aria-current={isActive ? 'page' : undefined}
                            >
                              <Icon className={clsx(
                                'w-5 h-5 flex-shrink-0',
                                isActive && 'text-purple-400'
                              )} aria-hidden="true" />
                              <span className="truncate">{item.label}</span>
                            </Link>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* SECURE Section */}
                  <div className="mb-6">
                    <div className="px-3 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">
                      Secure
                    </div>
                    {navigation.slice(4, 5).map((item) => {
                      const isActive = isRouteActive(item.href)
                      const Icon = item.icon

                      return (
                        <div key={item.href}>
                          {item.comingSoon ? (
                            <div 
                              className="flex items-center justify-between px-3 py-3 text-sm rounded-lg cursor-not-allowed opacity-50 text-gray-500"
                              title={`${item.label} coming soon`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                                <span className="truncate">{item.label}</span>
                              </div>
                              <span className="text-[10px] text-gray-600 font-medium px-1.5 py-0.5 bg-gray-800 rounded uppercase tracking-wider">
                                Soon
                              </span>
                            </div>
                          ) : (
                            <Link
                              href={item.href}
                              className={clsx(
                                'flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-all group relative',
                                isActive
                                  ? 'bg-purple-600/10 text-purple-400 font-medium border-l-2 border-purple-500 pl-[10px]'
                                  : 'text-gray-300 hover:bg-gray-800 hover:text-white border-l-2 border-transparent pl-[10px]'
                              )}
                              aria-current={isActive ? 'page' : undefined}
                            >
                              <Icon className={clsx(
                                'w-5 h-5 flex-shrink-0',
                                isActive && 'text-purple-400'
                              )} aria-hidden="true" />
                              <span className="truncate">{item.label}</span>
                            </Link>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* SHIP Section */}
                  <div className="mb-6">
                    <div className="px-3 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">
                      Ship
                    </div>
                    {navigation.slice(5, 7).map((item) => {
                      const isActive = isRouteActive(item.href)
                      const Icon = item.icon

                      return (
                        <div key={item.href}>
                          {item.comingSoon ? (
                            <div 
                              className="flex items-center justify-between px-3 py-3 text-sm rounded-lg cursor-not-allowed opacity-50 text-gray-500"
                              title={`${item.label} coming soon`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                                <span className="truncate">{item.label}</span>
                              </div>
                              <span className="text-[10px] text-gray-600 font-medium px-1.5 py-0.5 bg-gray-800 rounded uppercase tracking-wider">
                                Soon
                              </span>
                            </div>
                          ) : (
                            <Link
                              href={item.href}
                              className={clsx(
                                'flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-all group relative',
                                isActive
                                  ? 'bg-purple-600/10 text-purple-400 font-medium border-l-2 border-purple-500 pl-[10px]'
                                  : 'text-gray-300 hover:bg-gray-800 hover:text-white border-l-2 border-transparent pl-[10px]'
                              )}
                              aria-current={isActive ? 'page' : undefined}
                            >
                              <Icon className={clsx(
                                'w-5 h-5 flex-shrink-0',
                                isActive && 'text-purple-400'
                              )} aria-hidden="true" />
                              <span className="truncate">{item.label}</span>
                            </Link>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {/* ACCOUNT Section */}
                  <div>
                    <div className="px-3 pb-2 text-[10px] font-bold text-gray-500 uppercase tracking-[0.1em]">
                      Account
                    </div>
                    {navigation.slice(7).map((item) => {
                      const isActive = isRouteActive(item.href)
                      const Icon = item.icon

                      return (
                        <div key={item.href}>
                          {item.comingSoon ? (
                            <div 
                              className="flex items-center justify-between px-3 py-3 text-sm rounded-lg cursor-not-allowed opacity-50 text-gray-500"
                              title={`${item.label} coming soon`}
                            >
                              <div className="flex items-center gap-3">
                                <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                                <span className="truncate">{item.label}</span>
                              </div>
                              <span className="text-[10px] text-gray-600 font-medium px-1.5 py-0.5 bg-gray-800 rounded uppercase tracking-wider">
                                Soon
                              </span>
                            </div>
                          ) : (
                            <Link
                              href={item.href}
                              className={clsx(
                                'flex items-center gap-3 px-3 py-3 text-sm rounded-lg transition-all group relative',
                                isActive
                                  ? 'bg-purple-600/10 text-purple-400 font-medium border-l-2 border-purple-500 pl-[10px]'
                                  : 'text-gray-300 hover:bg-gray-800 hover:text-white border-l-2 border-transparent pl-[10px]'
                              )}
                              aria-current={isActive ? 'page' : undefined}
                            >
                              <Icon className={clsx(
                                'w-5 h-5 flex-shrink-0',
                                isActive && 'text-purple-400'
                              )} aria-hidden="true" />
                              <span className="truncate">{item.label}</span>
                            </Link>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </nav>

              {/* Mobile User Profile */}
              {session && (
                <div className="border-t border-gray-800 p-4">
                  <div className="flex items-center gap-3 px-3 py-2 mb-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-500 to-green-500 flex items-center justify-center font-semibold flex-shrink-0">
                      {getUserInitials(session.user.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white truncate">
                        {session.user.name || 'User'}
                      </div>
                      <div className="text-sm text-gray-400 truncate">
                        {session.user.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <LogOut className="w-4 h-4" aria-hidden="true" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
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

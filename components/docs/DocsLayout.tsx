'use client'

import { ReactNode, useState, useEffect } from 'react'
import Link from 'next/link'
import { Book, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import DocsNavigation from './DocsNavigation'
import { DocNavItem } from '@/lib/docs/file-system'

interface DocsLayoutProps {
  children: ReactNode
  navigation: DocNavItem[]
}

const SIDEBAR_STORAGE_KEY = 'vettcode-docs-sidebar-collapsed'

export default function DocsLayout({ children, navigation }: DocsLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Load sidebar state from localStorage after mount
  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY)
    if (saved !== null) {
      setSidebarCollapsed(saved === 'true')
    }
  }, [])

  // Save sidebar state to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed))
    }
  }, [sidebarCollapsed, mounted])

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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link 
                href="/" 
                className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent"
              >
                VettCode
              </Link>
              <span className="text-gray-500">/</span>
              <Link 
                href="/docs" 
                className="flex items-center gap-2 text-gray-300 hover:text-white transition"
              >
                <Book className="w-5 h-5" />
                <span className="font-semibold">Documentation</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard" 
                className="hidden sm:block px-6 py-2 bg-gradient-to-r from-purple-600 to-green-600 hover:from-purple-700 hover:to-green-700 rounded-lg font-semibold transition"
              >
                Dashboard
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className={clsx(
        'hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:flex-col transition-all duration-200 pt-[73px]',
        sidebarCollapsed ? 'lg:w-0 lg:opacity-0' : 'lg:w-72'
      )}>
        <div className="flex min-h-0 flex-1 flex-col bg-gray-900 border-r border-gray-800 overflow-hidden">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
              Documentation
            </h2>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6 px-4">
            <DocsNavigation items={navigation} />
          </div>
        </div>
      </aside>

      {/* Sidebar Toggle Button (Desktop) */}
      <button
        onClick={toggleSidebar}
        className={clsx(
          'hidden lg:flex fixed z-50 items-center justify-center w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 transition-all',
          sidebarCollapsed ? 'left-4' : 'left-[276px]'
        )}
        style={{ top: '50%', transform: 'translateY(-50%)' }}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-5 h-5 text-gray-300" />
        ) : (
          <ChevronLeft className="w-5 h-5 text-gray-300" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          <div 
            className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          
          <div className="lg:hidden fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-gray-900 shadow-2xl pt-[73px]">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
                <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  Documentation
                </h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-6 px-4">
                <DocsNavigation items={navigation} />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <main className={clsx(
        'pt-[73px] transition-all duration-200',
        sidebarCollapsed ? 'lg:pl-0' : 'lg:pl-72'
      )}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {children}
        </div>
      </main>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, FileText, Folder } from 'lucide-react'
import clsx from 'clsx'
import { DocNavItem } from '@/lib/docs/file-system'
import { useState } from 'react'

interface DocsNavigationProps {
  items: DocNavItem[]
}

interface NavItemProps {
  item: DocNavItem
  depth?: number
}

function NavigationItem({ item, depth = 0 }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === item.href
  const hasChildren = item.children && item.children.length > 0
  const [isExpanded, setIsExpanded] = useState(
    hasChildren && (isActive || item.children?.some(child => pathname.startsWith(child.href)))
  )

  const handleToggle = (e: React.MouseEvent) => {
    if (hasChildren) {
      e.preventDefault()
      setIsExpanded(!isExpanded)
    }
  }

  return (
    <div>
      <Link
        href={item.href}
        onClick={handleToggle}
        className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all group',
          depth > 0 && 'ml-4',
          isActive
            ? 'bg-purple-600/10 text-purple-400 font-medium'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
        )}
      >
        {hasChildren ? (
          <ChevronRight
            className={clsx(
              'w-4 h-4 flex-shrink-0 transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        ) : (
          <FileText className="w-4 h-4 flex-shrink-0 opacity-50" />
        )}
        <span className="flex-1 truncate">{item.title}</span>
      </Link>

      {hasChildren && isExpanded && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child, index) => (
            <NavigationItem key={index} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function DocsNavigation({ items }: DocsNavigationProps) {
  return (
    <nav className="space-y-1" aria-label="Documentation navigation">
      {items.map((item, index) => (
        <NavigationItem key={index} item={item} />
      ))}
    </nav>
  )
}

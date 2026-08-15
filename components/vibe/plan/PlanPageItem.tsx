/**
 * Page/Screen Item Component
 * Displays individual pages with route and icon
 */

'use client';

import { FileText, Home, User, ShoppingCart, Settings, FileCode, Globe, Edit2, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface PlanPageItemProps {
  name: string;
  route: string;
  description?: string;
  requiresAuth?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PlanPageItem({
  name,
  route,
  description,
  requiresAuth,
  onEdit,
  onDelete,
}: PlanPageItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Auto-select icon based on page name
  const getIcon = () => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('home') || route === '/') return Home;
    if (nameLower.includes('product') || nameLower.includes('listing')) return ShoppingCart;
    if (nameLower.includes('user') || nameLower.includes('profile') || nameLower.includes('account')) return User;
    if (nameLower.includes('settings') || nameLower.includes('config')) return Settings;
    if (nameLower.includes('about') || nameLower.includes('contact')) return Globe;
    if (nameLower.includes('dashboard') || nameLower.includes('admin')) return FileCode;
    return FileText;
  };

  const Icon = getIcon();

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group flex items-start gap-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/50 hover:border-gray-700 transition-all"
    >
      {/* Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
        <Icon className="w-5 h-5 text-purple-400" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium text-white">{name}</h4>
              {requiresAuth && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-medium">
                  Auth
                </span>
              )}
            </div>
            <code className="text-xs text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
              {route}
            </code>
            {description && (
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Actions */}
          {(onEdit || onDelete) && (
            <div
              className={`flex items-center gap-1 transition-opacity ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-1.5 hover:bg-gray-700 rounded transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-1.5 hover:bg-red-500/20 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

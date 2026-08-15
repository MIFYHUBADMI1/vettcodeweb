/**
 * Toast Container Component
 * Displays toast notifications
 */

'use client';

import { useToast } from '@/lib/hooks/use-toast';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  success: 'bg-green-500/20 border-green-500/50 text-green-400',
  error: 'bg-red-500/20 border-red-500/50 text-red-400',
  warning: 'bg-yellow-500/20 border-yellow-500/50 text-yellow-400',
  info: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
};

export function Toaster() {
  const { toasts, dismiss } = useToast();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => {
        const Icon = iconMap[toast.type];
        const colorClass = colorMap[toast.type];
        
        return (
          <div
            key={toast.id}
            className={`
              ${colorClass}
              border rounded-lg p-4 shadow-lg
              backdrop-blur-sm
              animate-in slide-in-from-right
              flex items-start gap-3
              min-w-[320px]
            `}
          >
            <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-gray-300 mt-1">{toast.message}</p>
              )}
            </div>
            
            <button
              onClick={() => dismiss(toast.id)}
              className="text-gray-400 hover:text-white transition-colors flex-shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

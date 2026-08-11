'use client'

import { useState, forwardRef, InputHTMLAttributes } from 'react'
import { Eye, EyeOff } from 'lucide-react'

interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            className={`w-full px-4 py-3 pr-12 bg-gray-900 border ${
              error ? 'border-red-500' : 'border-gray-700'
            } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        {error && (
          <p className="text-sm text-red-400 flex items-start gap-1">
            <span className="text-red-500">•</span>
            {error}
          </p>
        )}
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'

export default PasswordInput

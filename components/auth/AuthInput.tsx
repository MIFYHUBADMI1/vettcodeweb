import { InputHTMLAttributes, forwardRef } from 'react'

interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          {label}
        </label>
        <input
          ref={ref}
          className={`w-full px-4 py-3 bg-gray-900 border ${
            error ? 'border-red-500' : 'border-gray-700'
          } rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition ${className}`}
          {...props}
        />
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

AuthInput.displayName = 'AuthInput'

export default AuthInput

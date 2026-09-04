'use client'

import { Check, X, Sparkles, Zap, Crown } from 'lucide-react'
import { PlanTier } from '@/lib/subscription'

interface PlanComparisonProps {
  currentPlan: string
}

export default function PlanComparison({ currentPlan }: PlanComparisonProps) {
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 'UGX 0',
      period: 'forever',
      icon: Sparkles,
      color: 'gray',
      tokens: '15,000',
      features: [
        'Tier 1 Models',
        'Basic AI Explanations',
        'Unlimited Scans',
        'Community Support',
      ],
      notIncluded: [
        'AI Chat',
        'Fix Suggestions',
        'Advanced Models',
        'Scan History',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'UGX 70,000',
      period: 'per month',
      icon: Zap,
      color: 'purple',
      tokens: '100,000',
      popular: true,
      features: [
        'Tier 1-3 Models',
        'AI Chat',
        'Fix Generation',
        'Code Analysis',
        'Scan History',
        'Advanced Reports',
        'Priority Support',
      ],
      notIncluded: [
        'Multi-File Analysis',
        'AI Security Mentor',
        'Priority AI',
      ],
    },
    {
      id: 'pro_plus',
      name: 'Pro+',
      price: 'UGX 180,000',
      period: 'per month',
      icon: Crown,
      color: 'green',
      tokens: '500,000',
      features: [
        'All Tier Models',
        'Everything in Pro',
        'Multi-File Analysis',
        'AI Security Mentor',
        'Priority AI Processing',
        'Custom Integrations',
        'Dedicated Support',
      ],
      notIncluded: [],
    },
  ]

  const getColorClasses = (color: string, isPopular?: boolean) => {
    const colors = {
      gray: {
        border: 'border-gray-700',
        bg: 'bg-gray-900/50',
        icon: 'bg-gray-500/20 text-gray-400',
        button: 'bg-gray-800 hover:bg-gray-700 text-white',
      },
      purple: {
        border: isPopular ? 'border-purple-500/50' : 'border-purple-700',
        bg: 'bg-purple-900/20',
        icon: 'bg-purple-500/20 text-purple-400',
        button: 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white',
      },
      green: {
        border: 'border-green-700',
        bg: 'bg-green-900/20',
        icon: 'bg-green-500/20 text-green-400',
        button: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white',
      },
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h2>
        <p className="text-gray-400">
          Upgrade anytime to unlock more tokens and advanced features
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon
          const colors = getColorClasses(plan.color, plan.popular)
          const isCurrent = currentPlan === plan.id

          return (
            <div
              key={plan.id}
              className={`
                relative bg-gray-900 border ${colors.border} rounded-xl p-6 
                ${plan.popular ? 'ring-2 ring-purple-500/50 shadow-xl shadow-purple-500/10' : ''}
                transition-all duration-200 hover:shadow-lg
              `}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-bold rounded-full">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Current Plan Badge */}
              {isCurrent && (
                <div className="absolute top-4 right-4">
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-semibold rounded-full border border-green-500/30">
                    Current
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={`w-12 h-12 ${colors.icon} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>

              {/* Name & Price */}
              <h3 className="text-2xl font-bold text-white mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold text-white">{plan.price}</span>
                <span className="text-sm text-gray-400">{plan.period}</span>
              </div>

              {/* Tokens */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span className="font-semibold text-white">{plan.tokens}</span>
                  <span className="text-gray-400">tokens/month</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-300">{feature}</span>
                  </li>
                ))}
                {plan.notIncluded.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 opacity-50">
                    <X className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-500">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                disabled={isCurrent}
                className={`
                  w-full py-3 rounded-lg font-semibold transition-all
                  ${isCurrent 
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                    : colors.button
                  }
                `}
              >
                {isCurrent ? 'Current Plan' : plan.id === 'free' ? 'Downgrade' : 'Upgrade'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Contact for Enterprise */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/20 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Need more?</h3>
            <p className="text-sm text-gray-300">
              Contact us for enterprise plans with custom token allocations and dedicated support
            </p>
          </div>
          <button className="px-6 py-2 bg-white hover:bg-gray-100 text-gray-900 font-semibold rounded-lg transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  )
}

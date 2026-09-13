'use client'

interface DashboardWelcomeProps {
  name: string
}

export default function DashboardWelcome({ name }: DashboardWelcomeProps) {
  const currentHour = new Date().getHours()
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="mb-8">
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
        {greeting}, {name}
      </h1>
      <p className="text-gray-400">
        Here's what's happening with your projects today.
      </p>
    </div>
  )
}

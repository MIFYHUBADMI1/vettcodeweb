/**
 * Circular Progress Indicator for Plan Readiness
 */

'use client';

interface PlanProgressCircleProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
}

export function PlanProgressCircle({ 
  progress, 
  size = 120, 
  strokeWidth = 8 
}: PlanProgressCircleProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  const getColor = () => {
    if (progress >= 90) return '#10b981'; // green
    if (progress >= 70) return '#f59e0b'; // yellow
    return '#8b5cf6'; // purple
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="text-gray-800"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={getColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
          style={{
            filter: `drop-shadow(0 0 8px ${getColor()}40)`,
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-3xl font-bold" style={{ color: getColor() }}>
          {Math.round(progress)}%
        </span>
        <span className="text-xs text-gray-400 mt-1">Complete</span>
      </div>
    </div>
  );
}

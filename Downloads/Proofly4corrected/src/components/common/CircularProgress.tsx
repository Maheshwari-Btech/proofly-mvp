import React from 'react';

interface CircularProgressProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showPercentage?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  score,
  size = 128,
  strokeWidth = 3.5,
  label = 'Readiness Score',
  showPercentage = true,
}) => {
  const clampedScore = Math.max(0, Math.min(100, score));

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          {/* Background Ring */}
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#F3E8FF"
            strokeWidth={strokeWidth}
          />
          {/* Active Purple Progress Ring */}
          <path
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="#7E22CE"
            strokeWidth={strokeWidth}
            strokeDasharray={`${clampedScore}, 100`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {showPercentage && (
            <span className="text-3xl font-bold text-purple-700 tracking-tight">{clampedScore}%</span>
          )}
        </div>
      </div>
      {label && <p className="mt-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</p>}
    </div>
  );
};

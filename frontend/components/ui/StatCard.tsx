'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple' | 'cyan';
  prefix?: string;
  suffix?: string;
  loading?: boolean;
}

const colorMap = {
  blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400', border: 'border-blue-500/20', glow: 'shadow-blue-500/10' },
  green: { bg: 'bg-green-500/10', icon: 'text-green-400', border: 'border-green-500/20', glow: 'shadow-green-500/10' },
  amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400', border: 'border-amber-500/20', glow: 'shadow-amber-500/10' },
  red: { bg: 'bg-red-500/10', icon: 'text-red-400', border: 'border-red-500/20', glow: 'shadow-red-500/10' },
  purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', border: 'border-purple-500/20', glow: 'shadow-purple-500/10' },
  cyan: { bg: 'bg-cyan-500/10', icon: 'text-cyan-400', border: 'border-cyan-500/20', glow: 'shadow-cyan-500/10' },
};

export default function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  color = 'blue',
  prefix = '',
  suffix = '',
  loading = false,
}: StatCardProps) {
  const colors = colorMap[color];

  if (loading) {
    return (
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="shimmer h-4 w-24 rounded" />
          <div className="shimmer w-10 h-10 rounded-xl" />
        </div>
        <div className="shimmer h-8 w-32 rounded mb-2" />
        <div className="shimmer h-3 w-20 rounded" />
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/50 border ${colors.border} rounded-2xl p-6 hover:border-opacity-50 transition-all duration-200 card-hover shadow-lg ${colors.glow}`}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <div className={`w-10 h-10 ${colors.bg} rounded-xl flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${colors.icon}`} />
        </div>
      </div>

      <div className="mb-2">
        <p className="text-2xl font-black text-white">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </p>
      </div>

      {trend !== undefined && (
        <div className="flex items-center gap-1.5">
          {trend > 0 ? (
            <div className="flex items-center gap-1 text-green-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold">+{trend}%</span>
            </div>
          ) : trend < 0 ? (
            <div className="flex items-center gap-1 text-red-400">
              <TrendingDown className="w-4 h-4" />
              <span className="text-xs font-semibold">{trend}%</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-gray-500">
              <Minus className="w-4 h-4" />
              <span className="text-xs font-semibold">0%</span>
            </div>
          )}
          {trendLabel && <span className="text-gray-600 text-xs">{trendLabel}</span>}
        </div>
      )}
    </div>
  );
}

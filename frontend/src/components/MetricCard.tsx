import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: string;
  status?: 'success' | 'warning' | 'danger' | 'info';
  progress?: number;
  badge?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  status = 'info',
  progress,
  badge,
  onClick,
}) => {
  const statusColors = {
    success: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    warning: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
    danger: 'text-rose-400 border-rose-500/30 bg-rose-500/10',
    info: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
  };

  const progressColors = {
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-500',
    info: 'bg-sky-400',
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg relative overflow-hidden transition-all duration-200 hover:border-slate-700 ${
        onClick ? 'cursor-pointer hover:bg-slate-900/90' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
          <div className="mt-1.5 flex items-baseline space-x-2">
            <span className="text-2xl font-bold tracking-tight text-white font-mono">{value}</span>
            {badge && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {badge}
              </span>
            )}
          </div>
        </div>

        <div className={`p-2.5 rounded-lg border ${statusColors[status]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {progress !== undefined && (
        <div className="mt-4">
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${progressColors[status]}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {(subtitle || trend) && (
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>{subtitle}</span>
          {trend && <span className="font-mono font-medium text-emerald-400">{trend}</span>}
        </div>
      )}
    </div>
  );
};


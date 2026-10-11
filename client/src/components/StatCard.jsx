import React from 'react';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', badge }) {
  const colorMap = {
    blue: {
      bg: 'from-blue-500/10 to-indigo-500/5',
      border: 'border-blue-500/20 hover:border-blue-500/40',
      iconBg: 'bg-blue-500/20 text-blue-400',
      valueColor: 'text-blue-400',
    },
    amber: {
      bg: 'from-amber-500/10 to-orange-500/5',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-500/20 text-amber-400',
      valueColor: 'text-amber-400',
    },
    emerald: {
      bg: 'from-emerald-500/10 to-teal-500/5',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
      valueColor: 'text-emerald-400',
    },
    purple: {
      bg: 'from-purple-500/10 to-pink-500/5',
      border: 'border-purple-500/20 hover:border-purple-500/40',
      iconBg: 'bg-purple-500/20 text-purple-400',
      valueColor: 'text-purple-400',
    },
    rose: {
      bg: 'from-rose-500/10 to-red-500/5',
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-500/20 text-rose-400',
      valueColor: 'text-rose-400',
    },
  };

  const scheme = colorMap[color] || colorMap.blue;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${scheme.bg} bg-slate-900/60 p-5 border ${scheme.border} transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 backdrop-blur-sm`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider uppercase text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <h3 className="text-3xl font-extrabold text-white tracking-tight">{value}</h3>
            {badge && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-400 font-medium">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.iconBg} ring-1 ring-white/10 shadow-inner`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}

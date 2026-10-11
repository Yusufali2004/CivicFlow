import { Ambulance, Shield, Flame, Compass, CheckCircle2, Clock, AlertTriangle } from './Icons';

export function UnitStatusBadge({ status }) {
  if (status === 'AVAILABLE') {
    return (
      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>AVAILABLE</span>
      </span>
    );
  }
  if (status === 'DISPATCHED') {
    return (
      <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
        <span>DISPATCHED</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
      <span>{status || 'BUSY'}</span>
    </span>
  );
}

export function IncidentStatusBadge({ status }) {
  const configs = {
    REPORTED: {
      bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
      dot: 'bg-rose-400 animate-pulse',
      label: 'REPORTED',
    },
    ASSIGNED: {
      bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
      dot: 'bg-amber-400',
      label: 'ASSIGNED',
    },
    IN_PROGRESS: {
      bg: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
      dot: 'bg-blue-400 animate-spin',
      label: 'IN PROGRESS',
    },
    RESOLVED: {
      bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      dot: 'bg-emerald-400',
      label: 'RESOLVED',
    },
  };

  const current = configs[status] || configs.REPORTED;

  return (
    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${current.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`}></span>
      <span>{current.label}</span>
    </span>
  );
}

export function SeverityBadge({ severity }) {
  const configs = {
    CRITICAL: 'bg-red-500/20 text-red-300 border-red-500/40',
    HIGH: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    MEDIUM: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    LOW: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
  };

  return (
    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider border ${configs[severity] || configs.MEDIUM}`}>
      {severity}
    </span>
  );
}

export function VehicleTypeIcon({ type, className = 'w-4 h-4' }) {
  switch (type) {
    case 'Ambulance':
      return <Ambulance className={`${className} text-rose-400`} />;
    case 'Police':
      return <Shield className={`${className} text-blue-400`} />;
    case 'Fire Truck':
      return <Flame className={`${className} text-orange-400`} />;
    case 'Traffic Unit':
      return <Compass className={`${className} text-emerald-400`} />;
    default:
      return <AlertTriangle className={`${className} text-slate-400`} />;
  }
}

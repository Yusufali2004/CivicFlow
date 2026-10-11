import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  Radio,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Zap,
} from '../components/Icons';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import StatCard from '../components/StatCard';
import {
  IncidentStatusBadge,
  SeverityBadge,
  UnitStatusBadge,
  VehicleTypeIcon,
} from '../components/UnitStatusBadge';
import { fetchIncidents, fetchUnits, fetchAnalytics } from '../api/api';

const SEVERITY_COLORS = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#3b82f6',
};

export default function Dashboard({ onOpenAssign, onOpenDetails, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [units, setUnits] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [incRes, unitRes, analRes] = await Promise.all([
        fetchIncidents(),
        fetchUnits(),
        fetchAnalytics(),
      ]);

      if (incRes.success) setIncidents(incRes.data);
      if (unitRes.success) setUnits(unitRes.data);
      if (analRes.success) setAnalytics(analRes.data);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const summary = analytics?.summary || {
    totalIncidents: incidents.length,
    activeIncidents: incidents.filter((i) => i.status !== 'RESOLVED').length,
    resolvedIncidents: incidents.filter((i) => i.status === 'RESOLVED').length,
    availableUnits: units.filter((u) => u.status === 'AVAILABLE').length,
    totalUnits: units.length,
    resolutionRate: 0,
    avgResolutionMinutes: 18.5,
  };

  const recentIncidents = incidents.slice(0, 6);

  const severityData = (analytics?.incidentsBySeverity || []).map((s) => ({
    name: s.severity,
    value: s.count,
    color: SEVERITY_COLORS[s.severity] || '#64748b',
  }));

  const unitStatusData = [
    {
      name: 'Available',
      count: units.filter((u) => u.status === 'AVAILABLE').length,
      fill: '#10b981',
    },
    {
      name: 'Dispatched',
      count: units.filter((u) => u.status === 'DISPATCHED').length,
      fill: '#f59e0b',
    },
    {
      name: 'Busy',
      count: units.filter((u) => u.status === 'BUSY').length,
      fill: '#ef4444',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Quick Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            City Command Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time incident response telemetry for Bengaluru Smart City Grid
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-mono">Grid: Online</span>
          </div>
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Refresh Dashboard"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Incidents"
          value={summary.totalIncidents}
          subtitle="Smart city logs captured"
          icon={AlertOctagon}
          color="blue"
        />
        <StatCard
          title="Active Emergencies"
          value={summary.activeIncidents}
          subtitle="Requiring response & dispatch"
          icon={ShieldAlert}
          color="amber"
          badge={summary.activeIncidents > 0 ? 'Action Required' : 'All Clear'}
        />
        <StatCard
          title="Resolved Incidents"
          value={summary.resolvedIncidents}
          subtitle={`${summary.resolutionRate}% resolution rate`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Available Response Units"
          value={`${summary.availableUnits} / ${summary.totalUnits || 8}`}
          subtitle="Ready for instant dispatch"
          icon={Radio}
          color="purple"
        />
      </div>

      {/* Two-Column Visual Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Incidents Table / List */}
        <div className="lg:col-span-2 rounded-2xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <h2 className="text-base font-bold text-white">Recent City Incidents</h2>
            </div>
            <button
              onClick={() => onNavigate('incidents')}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
            >
              <span>View All ({incidents.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentIncidents.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No incidents logged yet.</p>
            ) : (
              recentIncidents.map((incident) => (
                <div
                  key={incident._id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1.5 flex-1 cursor-pointer" onClick={() => onOpenDetails(incident._id)}>
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-blue-400">
                        {incident.incidentNumber}
                      </span>
                      <IncidentStatusBadge status={incident.status} />
                      <SeverityBadge severity={incident.severity} />
                      <span className="text-[11px] text-slate-400 font-medium">
                        📍 {incident.area}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                      {incident.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {incident.locationDetails || incident.description}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {incident.status === 'REPORTED' && (
                      <button
                        onClick={() => onOpenAssign(incident)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20 flex items-center space-x-1"
                      >
                        <Zap className="w-3 h-3 text-amber-300" />
                        <span>Assign Unit</span>
                      </button>
                    )}
                    <button
                      onClick={() => onOpenDetails(incident._id)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Charts Overview */}
        <div className="space-y-6">
          {/* Severity Breakdown Chart */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur-sm space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Incidents by Severity</span>
              <span className="text-[11px] font-normal text-slate-400">Current Distribution</span>
            </h3>

            <div className="h-44 w-full">
              {severityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={42}
                      outerRadius={68}
                      paddingAngle={4}
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-500">
                  No chart data available
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-xs">
              {severityData.map((s) => (
                <div key={s.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }}></span>
                    <span className="text-slate-400 font-medium">{s.name}</span>
                  </div>
                  <span className="font-bold text-white font-mono">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Unit Status Breakdown */}
          <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur-sm space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center justify-between">
              <span>Emergency Units Readiness</span>
              <span className="text-[11px] font-normal text-slate-400">Total: {units.length}</span>
            </h3>

            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={unitStatusData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    width={70}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {unitStatusData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Available Response Fleet Strip */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 backdrop-blur-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Emergency Response Fleet Quick Strip</h2>
          </div>
          <button
            onClick={() => onNavigate('units')}
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center space-x-1"
          >
            <span>Manage All Units</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {units.map((unit) => (
            <div
              key={unit._id}
              className={`p-3 rounded-xl border text-center transition-all ${
                unit.status === 'AVAILABLE'
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : unit.status === 'DISPATCHED'
                  ? 'bg-amber-950/20 border-amber-500/30 text-amber-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400'
              }`}
            >
              <div className="flex justify-center mb-1">
                <VehicleTypeIcon type={unit.type} className="w-5 h-5" />
              </div>
              <p className="font-bold text-xs font-mono">{unit.unitCode}</p>
              <p className="text-[10px] text-slate-400 truncate">{unit.stationArea}</p>
              <span className="mt-1 inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-slate-900/80">
                {unit.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  Search,
  Filter,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle2,
  Zap,
  RefreshCw,
  Loader2,
  Phone,
} from '../components/Icons';
import { fetchIncidents, resolveIncidentWithTransaction } from '../api/api';
import {
  IncidentStatusBadge,
  SeverityBadge,
  VehicleTypeIcon,
} from '../components/UnitStatusBadge';

const AREAS = [
  'ALL',
  'Whitefield',
  'Koramangala',
  'Indiranagar',
  'Hebbal',
  'Yelahanka',
  'HSR Layout',
  'BTM Layout',
  'Marathahalli',
];

const TYPES = [
  'ALL',
  'Accident',
  'Traffic Jam',
  'Road Blockage',
  'Signal Failure',
  'Fire',
  'Medical Emergency',
];

const STATUSES = ['ALL', 'REPORTED', 'ASSIGNED', 'RESOLVED'];

export default function Incidents({
  onOpenCreate,
  onOpenAssign,
  onOpenDetails,
  refreshTrigger,
}) {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedArea, setSelectedArea] = useState('ALL');
  const [resolvingId, setResolvingId] = useState(null);

  useEffect(() => {
    loadIncidents();
  }, [selectedStatus, selectedType, selectedArea, refreshTrigger]);

  const loadIncidents = async () => {
    try {
      setLoading(true);
      const res = await fetchIncidents({
        status: selectedStatus,
        type: selectedType,
        area: selectedArea,
        search,
      });
      if (res.success) {
        setIncidents(res.data);
      }
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadIncidents();
  };

  const handleQuickResolve = async (incidentId, e) => {
    e.stopPropagation();
    try {
      setResolvingId(incidentId);
      const res = await resolveIncidentWithTransaction(incidentId, {
        notes: 'Quick resolved from incidents console.',
        actor: 'Dispatcher Grid Operator',
      });
      if (res.success) {
        await loadIncidents();
      }
    } catch (err) {
      console.error('Quick resolve failed:', err);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Smart City Incident Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dispatch response units, track lifecycle, and verify MongoDB transaction commits
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={loadIncidents}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors"
            title="Refresh List"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          </button>
          <button
            onClick={onOpenCreate}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Incident</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by title, incident ID, area, or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1 mr-1">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filters:</span>
          </span>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                Status: {s}
              </option>
            ))}
          </select>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                Type: {t}
              </option>
            ))}
          </select>

          {/* Area filter */}
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
          >
            {AREAS.map((a) => (
              <option key={a} value={a}>
                Area: {a}
              </option>
            ))}
          </select>

          {(selectedStatus !== 'ALL' || selectedType !== 'ALL' || selectedArea !== 'ALL' || search) && (
            <button
              onClick={() => {
                setSelectedStatus('ALL');
                setSelectedType('ALL');
                setSelectedArea('ALL');
                setSearch('');
              }}
              className="text-xs text-blue-400 hover:text-blue-300 underline ml-2"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Incidents List Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Retrieving incidents from MongoDB...</span>
        </div>
      ) : incidents.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <AlertOctagon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No incidents found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search terms.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {incidents.map((inc) => (
            <div
              key={inc._id}
              onClick={() => onOpenDetails(inc._id)}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group shadow-sm hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Left meta info */}
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {inc.incidentNumber}
                    </span>
                    <IncidentStatusBadge status={inc.status} />
                    <SeverityBadge severity={inc.severity} />
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {inc.type}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>{inc.area}</span>
                    </span>
                    <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(inc.reportedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                    {inc.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2">
                    {inc.locationDetails ? `📍 ${inc.locationDetails} — ` : ''}
                    {inc.description}
                  </p>

                  {/* Assigned Unit details if available */}
                  {inc.assignedUnit && (
                    <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                      <VehicleTypeIcon type={inc.assignedUnit.type} className="w-3.5 h-3.5" />
                      <span className="text-slate-300 font-mono font-semibold">
                        Unit {inc.assignedUnit.unitCode}
                      </span>
                      <span className="text-amber-400 font-medium">({inc.assignedUnit.type})</span>
                      <span className="text-slate-500">Station: {inc.assignedUnit.stationArea}</span>
                    </div>
                  )}
                </div>

                {/* Right actions */}
                <div
                  className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {inc.status === 'REPORTED' && (
                    <button
                      onClick={() => onOpenAssign(inc)}
                      className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25 transition-all transform active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-300" />
                      <span>Assign Unit (Transaction)</span>
                    </button>
                  )}

                  {inc.status === 'ASSIGNED' && (
                    <button
                      onClick={(e) => handleQuickResolve(inc._id, e)}
                      disabled={resolvingId === inc._id}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all disabled:opacity-50"
                    >
                      {resolvingId === inc._id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Resolving...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Resolve Incident</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={() => onOpenDetails(inc._id)}
                    className="text-xs font-medium text-slate-400 hover:text-white px-2 py-1"
                  >
                    View Details & Ledger →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

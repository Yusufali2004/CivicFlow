import React, { useState, useEffect } from 'react';
import {
  Radio,
  Search,
  Filter,
  Phone,
  Shield,
  Clock,
  RefreshCw,
  Loader2,
  ExternalLink,
} from '../components/Icons';
import { fetchUnits } from '../api/api';
import { UnitStatusBadge, VehicleTypeIcon } from '../components/UnitStatusBadge';

const UNIT_TYPES = ['ALL', 'Ambulance', 'Police', 'Fire Truck', 'Traffic Unit'];
const STATUSES = ['ALL', 'AVAILABLE', 'DISPATCHED', 'BUSY'];

export default function ResponseUnits({ onOpenIncidentDetails }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    loadUnits();
  }, [selectedType, selectedStatus]);

  const loadUnits = async () => {
    try {
      setLoading(true);
      const res = await fetchUnits({
        type: selectedType,
        status: selectedStatus,
      });
      if (res.success) {
        setUnits(res.data);
      }
    } catch (err) {
      console.error('Failed to load response units:', err);
    } finally {
      setLoading(false);
    }
  };

  const availableCount = units.filter((u) => u.status === 'AVAILABLE').length;
  const dispatchedCount = units.filter((u) => u.status === 'DISPATCHED').length;
  const busyCount = units.filter((u) => u.status === 'BUSY').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Emergency Response Fleet
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time status tracking for ambulances, police patrol, fire engines, and traffic units
          </p>
        </div>

        <button
          onClick={loadUnits}
          className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors self-start sm:self-center"
          title="Refresh Units"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-blue-400' : ''}`} />
        </button>
      </div>

      {/* Fleet Status Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Total Fleet Units</p>
          <p className="text-2xl font-bold text-white mt-1 font-mono">{units.length}</p>
        </div>
        <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">AVAILABLE</p>
          <p className="text-2xl font-bold text-emerald-300 mt-1 font-mono">{availableCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-wider text-amber-400 font-semibold">DISPATCHED</p>
          <p className="text-2xl font-bold text-amber-300 mt-1 font-mono">{dispatchedCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold">BUSY / MAINTENANCE</p>
          <p className="text-2xl font-bold text-slate-300 mt-1 font-mono">{busyCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
        <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1 mr-1">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <span>Filter Fleet:</span>
        </span>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
        >
          {UNIT_TYPES.map((t) => (
            <option key={t} value={t}>
              Type: {t}
            </option>
          ))}
        </select>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-blue-500"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              Status: {s}
            </option>
          ))}
        </select>

        {(selectedType !== 'ALL' || selectedStatus !== 'ALL') && (
          <button
            onClick={() => {
              setSelectedType('ALL');
              setSelectedStatus('ALL');
            }}
            className="text-xs text-blue-400 hover:text-blue-300 underline ml-2"
          >
            Reset
          </button>
        )}
      </div>

      {/* Units Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-16 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Querying response unit registry...</span>
        </div>
      ) : units.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800">
          <p className="text-sm text-slate-400">No response units match the selected filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {units.map((unit) => {
            const isDispatched = unit.status === 'DISPATCHED';

            return (
              <div
                key={unit._id}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isDispatched
                    ? 'bg-amber-950/15 border-amber-500/30 shadow-md shadow-amber-500/5'
                    : unit.status === 'AVAILABLE'
                    ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                        <VehicleTypeIcon type={unit.type} className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-mono text-base font-bold text-white tracking-tight">
                          {unit.unitCode}
                        </h3>
                        <p className="text-xs text-slate-400">{unit.type}</p>
                      </div>
                    </div>
                    <UnitStatusBadge status={unit.status} />
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300 py-2 border-t border-slate-800/80">
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500">Base Station:</span>
                      <span className="font-semibold text-slate-200">{unit.stationArea}</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="text-slate-500">Vehicle No:</span>
                      <span className="font-mono text-slate-300">{unit.vehicleNumber}</span>
                    </p>
                    {unit.contactNumber && (
                      <p className="flex items-center justify-between">
                        <span className="text-slate-500">Hotline:</span>
                        <a
                          href={`tel:${unit.contactNumber}`}
                          className="text-blue-400 hover:underline flex items-center space-x-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{unit.contactNumber}</span>
                        </a>
                      </p>
                    )}
                  </div>
                </div>

                {/* If Dispatched: Show linked incident */}
                {isDispatched && unit.currentIncident && (
                  <div className="mt-4 pt-3 border-t border-amber-500/20 bg-amber-500/5 p-2.5 rounded-xl">
                    <p className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                      Currently Assigned:
                    </p>
                    <button
                      onClick={() => onOpenIncidentDetails(unit.currentIncident._id || unit.currentIncident)}
                      className="mt-1 text-xs font-bold text-slate-200 hover:text-white flex items-center space-x-1 group text-left"
                    >
                      <span className="line-clamp-1">
                        {unit.currentIncident.title || `Incident #${unit.currentIncident}`}
                      </span>
                      <ExternalLink className="w-3 h-3 text-amber-400 group-hover:scale-110 flex-shrink-0" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Phone,
  FileText,
} from './Icons';
import { fetchIncidentById, resolveIncidentWithTransaction } from '../api/api';
import {
  IncidentStatusBadge,
  SeverityBadge,
  VehicleTypeIcon,
  UnitStatusBadge,
} from './UnitStatusBadge';

export default function IncidentDetailModal({
  incidentId,
  isOpen,
  onClose,
  onOpenAssign,
  onUpdated,
}) {
  const [data, setData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('');
  const [showResolveForm, setShowResolveForm] = useState(false);

  useEffect(() => {
    if (isOpen && incidentId) {
      loadDetails();
      setShowResolveForm(false);
      setResolveNotes('');
    }
  }, [isOpen, incidentId]);

  const loadDetails = async () => {
    try {
      setLoading(true);
      const res = await fetchIncidentById(incidentId);
      if (res.success) {
        setData(res.data);
        setEvents(res.events || []);
      }
    } catch (err) {
      console.error('Failed to load incident details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    try {
      setResolving(true);
      const res = await resolveIncidentWithTransaction(incidentId, {
        notes: resolveNotes || 'Incident safely resolved by emergency crew.',
        actor: 'CivicFlow Dispatch Operator',
      });
      if (res.success) {
        await loadDetails();
        setShowResolveForm(false);
        if (onUpdated) onUpdated();
      }
    } catch (err) {
      console.error('Error resolving incident:', err);
    } finally {
      setResolving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <span className="font-mono text-sm font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
              {data?.incidentNumber || 'INC-DETAILS'}
            </span>
            {data && <IncidentStatusBadge status={data.status} />}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading || !data ? (
          <div className="flex items-center justify-center p-12 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading incident timeline & ledger...</span>
          </div>
        ) : (
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
            {/* Incident Header & Meta */}
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <SeverityBadge severity={data.severity} />
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {data.type}
                </span>
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{data.area}</span>
                </span>
              </div>
              <h3 className="text-xl font-bold text-white leading-snug">{data.title}</h3>
              <p className="text-xs text-slate-400 mt-1">
                {data.locationDetails || 'No precise landmark given'}
              </p>
              {data.description && (
                <p className="text-sm text-slate-300 mt-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                  {data.description}
                </p>
              )}
            </div>

            {/* Assigned Unit Card */}
            <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Assigned Emergency Response Unit
                </h4>
                {data.assignedUnit ? (
                  <UnitStatusBadge status={data.assignedUnit.status} />
                ) : (
                  <span className="text-xs text-amber-400 font-semibold">Unassigned</span>
                )}
              </div>

              {data.assignedUnit ? (
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center">
                      <VehicleTypeIcon type={data.assignedUnit.type} className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white font-mono">
                        {data.assignedUnit.unitCode}{' '}
                        <span className="text-xs font-sans text-slate-400 font-normal">
                          ({data.assignedUnit.type})
                        </span>
                      </p>
                      <p className="text-xs text-slate-400">
                        Station: {data.assignedUnit.stationArea} | Plate: {data.assignedUnit.vehicleNumber}
                      </p>
                    </div>
                  </div>
                  {data.assignedUnit.contactNumber && (
                    <a
                      href={`tel:${data.assignedUnit.contactNumber}`}
                      className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs font-medium text-slate-300 hover:text-white"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{data.assignedUnit.contactNumber}</span>
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-slate-400">
                    No emergency unit dispatched yet. Assign an ambulance, police, or fire truck.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAssign(data);
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/20"
                  >
                    Dispatch via Transaction →
                  </button>
                </div>
              )}
            </div>

            {/* Resolve Incident Form or Button */}
            {data.status !== 'RESOLVED' && (
              <div>
                {!showResolveForm ? (
                  <button
                    onClick={() => setShowResolveForm(true)}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 transition-all flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Resolve Incident & Release Response Unit</span>
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/40 space-y-3">
                    <h5 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Resolve Incident (Session Execution)
                    </h5>
                    <p className="text-xs text-slate-300">
                      Resolving this incident marks it as closed, frees the assigned unit back to{' '}
                      <span className="text-emerald-400 font-bold">AVAILABLE</span>, and logs the final audit event inside a MongoDB session.
                    </p>
                    <input
                      type="text"
                      placeholder="Resolution notes (e.g. Cleared by police, patient transferred)"
                      value={resolveNotes}
                      onChange={(e) => setResolveNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowResolveForm(false)}
                        className="px-3 py-1.5 text-xs rounded-lg text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleResolve}
                        disabled={resolving}
                        className="px-4 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        {resolving ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Committing Resolution...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Confirm & Commit Resolution</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Audit Trail Timeline */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Response Events Audit Ledger ({events.length})</span>
              </h4>

              <div className="space-y-3 border-l-2 border-slate-800 ml-3 pl-4">
                {events.length === 0 ? (
                  <p className="text-xs text-slate-500">No events logged yet.</p>
                ) : (
                  events.map((ev, index) => (
                    <div key={ev._id || index} className="relative group">
                      <span className="absolute -left-[23px] top-1.5 w-3 h-3 rounded-full bg-slate-800 border-2 border-blue-500"></span>
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-bold text-blue-400 font-mono">{ev.eventType}</span>
                          <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(ev.timestamp).toLocaleString()}</span>
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{ev.notes}</p>
                        <p className="text-[10px] text-slate-500 mt-1">Logged by: {ev.actor}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

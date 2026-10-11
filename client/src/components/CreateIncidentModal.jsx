import React, { useState } from 'react';
import { X, PlusCircle, AlertCircle, Zap, ShieldAlert, Loader2 } from './Icons';
import { createIncident } from '../api/api';

const AREAS = [
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
  'Accident',
  'Traffic Jam',
  'Road Blockage',
  'Signal Failure',
  'Fire',
  'Medical Emergency',
];

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

export default function CreateIncidentModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Accident',
    severity: 'HIGH',
    area: 'Koramangala',
    locationDetails: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.type || !formData.area) {
      setError('Please fill in title, type, and area');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await createIncident(formData);
      if (res.success) {
        if (onSuccess) onSuccess(res.data);
        onClose();
      } else {
        setError(res.error || 'Failed to create incident');
      }
    } catch (err) {
      setError(err.message || 'Error communicating with server');
    } finally {
      setLoading(false);
    }
  };

  // Quick-fill presets for rapid demo
  const handleQuickFill = (presetType) => {
    if (presetType === 'accident') {
      setFormData({
        title: 'Collision between BMTC bus and car at Silk Board junction',
        type: 'Accident',
        severity: 'HIGH',
        area: 'BTM Layout',
        locationDetails: 'Silk Board flyover descending ramp towards Hosur Road',
        description: 'Two lanes blocked. Ambulance and Traffic units requested urgently.',
      });
    } else if (presetType === 'medical') {
      setFormData({
        title: 'Emergency: Severe respiratory distress reported at Tech Park',
        type: 'Medical Emergency',
        severity: 'CRITICAL',
        area: 'Whitefield',
        locationDetails: 'ITPL Main Gate, Near Building 4 lobby',
        description: 'On-site employee requires immediate advanced life support ambulance.',
      });
    } else if (presetType === 'fire') {
      setFormData({
        title: 'Electrical short circuit with heavy smoke in commercial complex',
        type: 'Fire',
        severity: 'HIGH',
        area: 'Indiranagar',
        locationDetails: '100 Feet Road, 2nd Floor above retail store',
        description: 'Building evacuated, fire truck requested to prevent spread.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Report New Smart City Incident</h3>
              <p className="text-xs text-slate-400">Log an active emergency in Bengaluru grid</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Quick Fill helper chips */}
        <div className="px-6 pt-3 pb-1 flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-slate-400 flex items-center space-x-1 font-semibold flex-shrink-0">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Demo Autofill:</span>
          </span>
          <button
            type="button"
            onClick={() => handleQuickFill('accident')}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex-shrink-0"
          >
            🚨 Accident Demo
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('medical')}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex-shrink-0"
          >
            🚑 Medical Demo
          </button>
          <button
            type="button"
            onClick={() => handleQuickFill('fire')}
            className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all flex-shrink-0"
          >
            🔥 Fire Demo
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Incident Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Multi-vehicle collision near junction"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Incident Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Severity *
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Bengaluru Area *
              </label>
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-blue-500"
              >
                {AREAS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Exact Landmark / Location Details
            </label>
            <input
              type="text"
              placeholder="e.g. Sony World Signal, 80ft Road, 4th Block"
              value={formData.locationDetails}
              onChange={(e) => setFormData({ ...formData, locationDetails: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Description / Citizen Notes
            </label>
            <textarea
              rows={3}
              placeholder="Provide situational details, casualties, or road blocks..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/30 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging Incident...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Log Incident</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

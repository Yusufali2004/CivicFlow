import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Database,
  ArrowRight,
  Shield,
  Loader2,
  AlertTriangle,
  Code2,
  Check,
  RefreshCw,
  Cpu,
} from './Icons';
import { assignUnitWithTransaction, fetchUnits } from '../api/api';
import { VehicleTypeIcon, SeverityBadge } from './UnitStatusBadge';

export default function TransactionModal({ incident, isOpen, onClose, onSuccess }) {
  const [availableUnits, setAvailableUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [simulateFailure, setSimulateFailure] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [visibleStepIndex, setVisibleStepIndex] = useState(-1);
  const [activeTab, setActiveTab] = useState('execution'); // 'execution' | 'code'

  useEffect(() => {
    if (isOpen && incident) {
      loadUnits();
      setExecutionResult(null);
      setVisibleStepIndex(-1);
      setSimulateFailure(false);
    }
  }, [isOpen, incident]);

  const loadUnits = async () => {
    try {
      setLoadingUnits(true);
      const res = await fetchUnits({ status: 'AVAILABLE' });
      if (res.success) {
        setAvailableUnits(res.data);
        if (res.data.length > 0) {
          // Pre-select most suitable unit if possible (match type or area)
          const matched = res.data.find(
            (u) =>
              (incident.type === 'Accident' && u.type === 'Ambulance') ||
              (incident.type === 'Fire' && u.type === 'Fire Truck') ||
              (incident.type === 'Traffic Jam' && u.type === 'Traffic Unit') ||
              (incident.type === 'Medical Emergency' && u.type === 'Ambulance')
          );
          setSelectedUnitId(matched ? matched._id : res.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load units:', err);
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleExecuteTransaction = async () => {
    if (!selectedUnitId) return;

    setExecuting(true);
    setExecutionResult(null);
    setVisibleStepIndex(0);

    try {
      const res = await assignUnitWithTransaction(incident._id, {
        unitId: selectedUnitId,
        simulateFailure: simulateFailure,
        notes: `Emergency dispatch unit deployed to ${incident.area} via CIVICFLOW console.`,
        actor: 'Smart City Dispatcher Console',
      });

      // Step-by-step sequential reveal for theatrical educational presentation
      animateSteps(res);
    } catch (error) {
      console.error('Dispatch transaction error:', error);
      animateSteps({
        success: false,
        error: error.message || 'Transaction execution failed',
        steps: [
          { step: 1, title: 'Session Started', status: 'SUCCESS' },
          { step: 'ABORT', title: 'Transaction Aborted', status: 'FAILED', detail: error.message },
          { step: 'ROLLBACK', title: 'Changes Rolled Back', status: 'ROLLED_BACK' },
        ],
      });
    } finally {
      setExecuting(false);
    }
  };

  const animateSteps = (result) => {
    setExecutionResult(result);
    const steps = result.steps || [];
    let current = 0;
    const interval = setInterval(() => {
      if (current < steps.length) {
        setVisibleStepIndex(current);
        current++;
      } else {
        clearInterval(interval);
        if (result.success && onSuccess) {
          onSuccess(result);
        }
      }
    }, 350);
  };

  if (!isOpen || !incident) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">MongoDB Multi-Document Transaction</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  ACID Atomic
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Unit Dispatch & Incident Assignment Workflow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection for Viva / Code explanation */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800 bg-slate-900/40 text-xs">
          <button
            onClick={() => setActiveTab('execution')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all ${
              activeTab === 'execution'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Interactive Execution
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'code'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Mongoose Transaction Code</span>
          </button>
        </div>

        {activeTab === 'code' ? (
          <div className="p-6 bg-slate-950/60 font-mono text-xs overflow-x-auto max-h-[480px]">
            <div className="mb-3 text-slate-400 flex items-center justify-between">
              <span className="text-blue-400 font-bold">// server/controllers/incidentController.js</span>
              <span className="text-[11px] text-slate-500">Mongoose Session API</span>
            </div>
            <pre className="text-slate-300 leading-relaxed bg-slate-900/90 p-4 rounded-xl border border-slate-800">
{`// 1. START MONGODB SESSION & TRANSACTION
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 2. FIND AND VALIDATE INCIDENT
  const incident = await Incident.findById(incidentId).session(session);
  if (!incident || incident.status === 'RESOLVED') {
    throw new Error('Incident cannot be assigned');
  }

  // 3. FIND AND VALIDATE RESPONSE UNIT
  const unit = await ResponseUnit.findById(unitId).session(session);
  if (!unit || unit.status !== 'AVAILABLE') {
    throw new Error('Response unit is not AVAILABLE');
  }

  // 4. UPDATE INCIDENT STATUS TO ASSIGNED
  incident.status = 'ASSIGNED';
  incident.assignedUnit = unit._id;
  await incident.save({ session });

  // 5. UPDATE RESPONSE UNIT STATUS TO DISPATCHED
  unit.status = 'DISPATCHED';
  unit.currentIncident = incident._id;
  await unit.save({ session });

  // 6. CREATE RESPONSE EVENT AUDIT DOCUMENT
  await ResponseEvent.create([
    {
      incidentId: incident._id,
      unitId: unit._id,
      eventType: 'DISPATCHED',
      timestamp: new Date(),
    }
  ], { session });

  // 7. COMMIT TRANSACTION (Atomic write across 3 collections)
  await session.commitTransaction();
  session.endSession();
} catch (error) {
  // ATOMIC ROLLBACK ON ANY ERROR
  await session.abortTransaction();
  session.endSession();
  throw error;
}`}
            </pre>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Target Incident Overview Card */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-blue-400">
                  {incident.incidentNumber}
                </span>
                <div className="flex items-center space-x-2">
                  <SeverityBadge severity={incident.severity} />
                  <span className="text-xs font-medium text-slate-400">
                    Area: <span className="text-slate-200 font-semibold">{incident.area}</span>
                  </span>
                </div>
              </div>
              <h4 className="text-base font-bold text-white">{incident.title}</h4>
              <p className="text-xs text-slate-400 line-clamp-2">
                {incident.locationDetails || incident.description}
              </p>
            </div>

            {/* If NOT yet executed or before running: Show Unit Selection */}
            {!executionResult && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Select Available Response Unit to Dispatch:
                  </label>
                  {loadingUnits ? (
                    <div className="flex items-center justify-center p-6 text-slate-400">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span>Loading available units...</span>
                    </div>
                  ) : availableUnits.length === 0 ? (
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>No available response units at this time. All units are currently dispatched.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                      {availableUnits.map((u) => {
                        const isSelected = selectedUnitId === u._id;
                        return (
                          <div
                            key={u._id}
                            onClick={() => setSelectedUnitId(u._id)}
                            className={`cursor-pointer p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'bg-blue-600/20 border-blue-500 shadow-md ring-1 ring-blue-500'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <VehicleTypeIcon type={u.type} className="w-4 h-4" />
                                <span className="font-bold text-sm text-white font-mono">{u.unitCode}</span>
                              </div>
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                {u.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">Station: {u.stationArea}</p>
                            <p className="text-[11px] font-mono text-slate-500">{u.vehicleNumber}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Simulated Failure Toggle for viva demo */}
                <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="simulateFail"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-rose-500 focus:ring-rose-500 cursor-pointer"
                  />
                  <label htmlFor="simulateFail" className="text-xs cursor-pointer">
                    <span className="font-bold text-amber-300 block">
                      Simulate Transaction Failure (Viva / Rollback Demo)
                    </span>
                    <span className="text-slate-400 block mt-0.5">
                      Intentionally injects an abort error during execution to demonstrate{' '}
                      <code className="text-rose-400 font-mono">session.abortTransaction()</code> and complete rollback of incident, unit, and event changes.
                    </span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleExecuteTransaction}
                    disabled={executing || !selectedUnitId || availableUnits.length === 0}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-500 hover:to-teal-500 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-50 active:scale-[0.99]"
                  >
                    {executing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Starting MongoDB Transaction Session...</span>
                      </>
                    ) : (
                      <>
                        <Database className="w-4 h-4" />
                        <span>Execute MongoDB Transaction & Dispatch</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* LIVE TRANSACTION EXECUTION PANEL */}
            {executionResult && (
              <div className="space-y-4">
                <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 font-mono text-sm space-y-3 shadow-inner">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <span>MongoDB Transaction</span>
                    <span>Session Lifecycle</span>
                  </div>

                  {/* Standard 7 Steps + Abort Steps */}
                  <div className="space-y-2 py-1">
                    {executionResult.steps?.map((step, idx) => {
                      const isVisible = idx <= visibleStepIndex;
                      if (!isVisible) return null;

                      const isFailed = step.status === 'FAILED' || step.status === 'ROLLED_BACK';

                      return (
                        <div
                          key={idx}
                          className={`flex items-start space-x-3 text-xs sm:text-sm animate-fade-in transition-all ${
                            isFailed ? 'text-rose-400' : 'text-slate-200'
                          }`}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {isFailed ? (
                              <XCircle className="w-4 h-4 text-rose-500" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className={`font-bold ${isFailed ? 'text-rose-300' : 'text-emerald-300'}`}>
                                {isFailed ? '✗' : '✓'} {step.title}
                              </span>
                              {step.timestamp && (
                                <span className="text-[10px] text-slate-500">
                                  {new Date(step.timestamp).toLocaleTimeString()}
                                </span>
                              )}
                            </div>
                            {step.detail && (
                              <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                                {step.detail}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Final Transaction Verdict Banner */}
                  {visibleStepIndex >= (executionResult.steps?.length || 0) - 1 && (
                    <div className="pt-3 border-t border-slate-800">
                      {executionResult.success ? (
                        <div className="p-3.5 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-center animate-fade-in">
                          <p className="text-sm font-extrabold text-emerald-400 tracking-wider">
                            TRANSACTION SUCCESSFUL
                          </p>
                          <p className="text-xs text-slate-300 font-sans mt-1">
                            3 Documents Updated Atomically: Incident #
                            {executionResult.incident?.incidentNumber} → ASSIGNED | Unit → DISPATCHED | Audit Event Logged.
                          </p>
                        </div>
                      ) : (
                        <div className="p-3.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-center animate-fade-in">
                          <p className="text-sm font-extrabold text-rose-400 tracking-wider">
                            ✗ Transaction Aborted
                          </p>
                          <p className="text-xs font-bold text-rose-300 tracking-wide">
                            Changes Rolled Back
                          </p>
                          <p className="text-xs text-slate-400 font-sans mt-1">
                            {executionResult.error || 'All database operations aborted. Zero partial writes persisted.'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Close / Done Action */}
                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition-all"
                  >
                    Done & Return to Grid
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

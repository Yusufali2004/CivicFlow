import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Incidents from './pages/Incidents';
import ResponseUnits from './pages/ResponseUnits';
import Analytics from './pages/Analytics';
import TransactionModal from './components/TransactionModal';
import CreateIncidentModal from './components/CreateIncidentModal';
import IncidentDetailModal from './components/IncidentDetailModal';
import { fetchAnalytics, seedDatabaseApi } from './api/api';
import { CheckCircle2, AlertCircle } from './components/Icons';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [toast, setToast] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Modals state
  const [assignIncident, setAssignIncident] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [detailIncidentId, setDetailIncidentId] = useState(null);

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  const loadStats = async () => {
    try {
      const res = await fetchAnalytics();
      if (res.success) {
        setStats(res.data.summary);
      }
    } catch (err) {
      console.error('Failed to load global stats:', err);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleSeedData = async () => {
    try {
      setIsSeeding(true);
      const res = await seedDatabaseApi();
      if (res.success) {
        showToast('Database reset with 15 incidents, 8 units, & 30 response events!', 'success');
        setRefreshTrigger((prev) => prev + 1);
      } else {
        showToast('Seed failed: ' + res.error, 'error');
      }
    } catch (err) {
      showToast('Error seeding database: ' + err.message, 'error');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleTransactionSuccess = (result) => {
    showToast(`MongoDB Transaction Committed! Incident #${result.incident?.incidentNumber} assigned.`, 'success');
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-2xl border backdrop-blur-md text-xs sm:text-sm font-semibold ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCreateModal={() => setIsCreateOpen(true)}
        onSeedData={handleSeedData}
        isSeeding={isSeeding}
        stats={stats}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            onOpenAssign={(inc) => setAssignIncident(inc)}
            onOpenDetails={(id) => setDetailIncidentId(id)}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'incidents' && (
          <Incidents
            onOpenCreate={() => setIsCreateOpen(true)}
            onOpenAssign={(inc) => setAssignIncident(inc)}
            onOpenDetails={(id) => setDetailIncidentId(id)}
            refreshTrigger={refreshTrigger}
          />
        )}

        {activeTab === 'units' && (
          <ResponseUnits
            onOpenIncidentDetails={(id) => setDetailIncidentId(id)}
          />
        )}

        {activeTab === 'analytics' && <Analytics />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            <span className="font-bold text-slate-400">CIVICFLOW</span> — Smart City Incident & Emergency Response Analytics
          </p>
          <p className="font-mono text-[11px] text-slate-600">
            Node.js • Express • MongoDB Replica Set Transactions • React • Tailwind • Recharts
          </p>
        </div>
      </footer>

      {/* Modals */}
      <TransactionModal
        incident={assignIncident}
        isOpen={Boolean(assignIncident)}
        onClose={() => setAssignIncident(null)}
        onSuccess={handleTransactionSuccess}
      />

      <CreateIncidentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={(newInc) => {
          showToast(`Incident #${newInc.incidentNumber} logged successfully!`, 'success');
          setRefreshTrigger((prev) => prev + 1);
        }}
      />

      <IncidentDetailModal
        incidentId={detailIncidentId}
        isOpen={Boolean(detailIncidentId)}
        onClose={() => setDetailIncidentId(null)}
        onOpenAssign={(inc) => setAssignIncident(inc)}
        onUpdated={() => setRefreshTrigger((prev) => prev + 1)}
      />
    </div>
  );
}

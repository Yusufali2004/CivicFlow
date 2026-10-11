import {
  ShieldAlert,
  LayoutDashboard,
  AlertOctagon,
  Radio,
  BarChart3,
  PlusCircle,
  RotateCcw,
  CheckCircle2,
  Cpu,
} from './Icons';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  onSeedData,
  isSeeding,
  stats,
}) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & City Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white font-bold">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
                  CIVICFLOW
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60 font-semibold tracking-wider">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Smart City Emergency Dispatch Grid</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('incidents')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'incidents'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <AlertOctagon className="w-4 h-4" />
              <span>Incidents</span>
              {stats?.activeIncidents > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {stats.activeIncidents}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('units')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'units'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Response Units</span>
              {stats?.availableUnits !== undefined && (
                <span className="ml-1 px-1.5 py-0.2 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {stats.availableUnits}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onSeedData}
              disabled={isSeeding}
              title="Reset database to 15 incidents, 8 units, and 30 events for demo"
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-600 transition-all disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-blue-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">{isSeeding ? 'Seeding...' : 'Reset Seed Data'}</span>
            </button>

            <button
              onClick={onOpenCreateModal}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/25 transition-all transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Report Incident</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation row */}
      <div className="md:hidden flex items-center justify-around bg-slate-950 px-2 py-2 border-t border-slate-800 text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2.5 py-1 rounded-md font-medium ${
            activeTab === 'dashboard' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('incidents')}
          className={`px-2.5 py-1 rounded-md font-medium ${
            activeTab === 'incidents' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          Incidents
        </button>
        <button
          onClick={() => setActiveTab('units')}
          className={`px-2.5 py-1 rounded-md font-medium ${
            activeTab === 'units' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          Units
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-2.5 py-1 rounded-md font-medium ${
            activeTab === 'analytics' ? 'text-blue-400 font-bold' : 'text-slate-400'
          }`}
        >
          Analytics
        </button>
      </div>
    </header>
  );
}

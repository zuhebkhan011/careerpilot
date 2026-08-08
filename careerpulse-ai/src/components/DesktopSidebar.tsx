import React from 'react';
import {
  LayoutDashboard,
  Search,
  Briefcase,
  FileText,
  Bot,
  User,
  Sparkles,
  Smartphone
} from 'lucide-react';

interface DesktopSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openCapacitorInfo: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  activeTab,
  setActiveTab,
  openCapacitorInfo
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Find Jobs', icon: Search },
    { id: 'applications', label: 'Applications', icon: Briefcase },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'coach', label: 'AI Career Coach', icon: Bot, badge: 'AI' },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 bg-white h-screen sticky top-0 p-4 shrink-0 shadow-xs">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 tracking-tight text-lg leading-none">CareerPulse</h1>
            <span className="text-[11px] font-medium text-indigo-600 tracking-wider uppercase">AI Career App</span>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all min-h-[44px] ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Capacitor Mobile Native Architecture Banner */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <button
          onClick={openCapacitorInfo}
          className="w-full text-left p-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm group"
        >
          <div className="flex items-center gap-2 mb-1">
            <Smartphone className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold text-emerald-400">Capacitor Ready</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">
            Mobile-first architecture for Android & iOS conversion.
          </p>
        </button>
      </div>
    </aside>
  );
};

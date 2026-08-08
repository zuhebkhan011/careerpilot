import React from 'react';
import { Sparkles, Bot, Smartphone } from 'lucide-react';

interface MobileHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openCapacitorInfo: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  activeTab,
  setActiveTab,
  openCapacitorInfo
}) => {
  const titles: Record<string, string> = {
    dashboard: 'Dashboard',
    jobs: 'Find Jobs',
    applications: 'Applications',
    resume: 'Resume Builder',
    coach: 'AI Career Coach',
    profile: 'Profile Settings'
  };

  return (
    <header className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-2xs">
      <div className="flex items-center gap-2.5">
        <div
          onClick={() => setActiveTab('dashboard')}
          className="w-9 h-9 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-xs"
        >
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-base leading-tight">
            {titles[activeTab] || 'CareerPulse'}
          </h1>
          <p className="text-[10px] text-slate-500 font-medium">Mobile AI Career Platform</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick AI Coach Button */}
        <button
          onClick={() => setActiveTab('coach')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all min-h-[38px] ${
            activeTab === 'coach'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
          }`}
          aria-label="Open AI Career Coach"
        >
          <Bot className="w-3.5 h-3.5 text-indigo-500" />
          <span>AI Coach</span>
        </button>

        {/* Capacitor Info Button */}
        <button
          onClick={openCapacitorInfo}
          className="p-2 rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
          title="Mobile Application Architecture Info"
          aria-label="View Capacitor Mobile Architecture Details"
        >
          <Smartphone className="w-4 h-4 text-emerald-600" />
        </button>
      </div>
    </header>
  );
};

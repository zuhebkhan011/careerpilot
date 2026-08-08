import React from 'react';
import { Home, Search, Briefcase, FileText, User } from 'lucide-react';
import { capacitorService } from '../services/capacitorService';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab
}) => {
  const primaryNavItems = [
    { id: 'dashboard', label: 'Home', icon: Home },
    { id: 'jobs', label: 'Jobs', icon: Search },
    { id: 'applications', label: 'Apps', icon: Briefcase },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const handleTabClick = (tabId: string) => {
    capacitorService.triggerHaptic(10);
    setActiveTab(tabId);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-1.5 pb-safe shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {primaryNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center min-h-[48px] min-w-[56px] py-1 px-2 rounded-xl transition-all ${
                isActive
                  ? 'text-indigo-600 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-indigo-50' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 stroke-[2.5]' : 'text-slate-500'}`} />
              </div>
              <span className="text-[10px] tracking-tight leading-none mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

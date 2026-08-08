import React, { useState } from 'react';
import { ResumeProfile } from '../types';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { capacitorService } from '../services/capacitorService';
import {
  User,
  Smartphone,
  Shield,
  RotateCcw,
  Bell,
  HardDrive,
  CheckCircle2,
  Share2,
  Moon,
  ExternalLink
} from 'lucide-react';

interface ProfileViewProps {
  resume: ResumeProfile;
  onSaveResume: (updated: ResumeProfile) => void;
  openCapacitorInfo: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  resume,
  onSaveResume,
  openCapacitorInfo
}) => {
  const [targetRole, setTargetRole] = useState(resume.targetRole || 'Full Stack Developer');
  const [desiredSalary, setDesiredSalary] = useState('₹15 - ₹25 LPA');
  const [preferredLocation, setPreferredLocation] = useState('Ahmedabad / Remote');

  const info = capacitorService.getInfo();

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data back to default initial state?')) {
      storageService.resetAllData();
      window.location.reload();
    }
  };

  const handleShareApp = async () => {
    const shared = await capacitorService.shareContent(
      'CareerPulse AI',
      'Check out CareerPulse AI - Mobile-first job matching, resume builder, and AI career coach!',
      window.location.href
    );
    if (shared) {
      notificationService.success('Shared!', 'Application link shared.');
    } else {
      notificationService.info('Copied Link', 'App link copied to clipboard.');
    }
  };

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      {/* Profile Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
          {resume.fullName.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-slate-900 truncate">{resume.fullName}</h2>
          <p className="text-xs text-slate-500 truncate">{resume.email} • {resume.phone}</p>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            {resume.targetRole || 'Full Stack Developer'}
          </span>
        </div>
      </div>

      {/* Target Job Preferences */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
          Target Job Preferences
        </h3>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Desired Job Role
            </label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Desired CTC Range
            </label>
            <input
              type="text"
              value={desiredSalary}
              onChange={(e) => setDesiredSalary(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Preferred Work Location
            </label>
            <input
              type="text"
              value={preferredLocation}
              onChange={(e) => setPreferredLocation(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
            />
          </div>

          <button
            onClick={() => {
              const updated = { ...resume, targetRole };
              onSaveResume(updated);
              notificationService.success('Preferences Saved', 'Target job settings updated.');
            }}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs min-h-[44px] shadow-xs"
          >
            Update Preferences
          </button>
        </div>
      </div>

      {/* App Mobile Architecture Status */}
      <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Mobile & Capacitor Status</h3>
          </div>
          <button
            onClick={openCapacitorInfo}
            className="text-xs text-emerald-400 font-semibold underline flex items-center gap-1"
          >
            <span>View Details</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
            <span className="text-[10px] text-slate-400 block">Platform</span>
            <span className="font-bold text-white capitalize">{info.platform} (PWA Ready)</span>
          </div>
          <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
            <span className="text-[10px] text-slate-400 block">Capacitor Compatibility</span>
            <span className="font-bold text-emerald-400">100% Ready</span>
          </div>
        </div>
      </div>

      {/* Actions & Utilities */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Actions & Storage</h3>

        <button
          onClick={handleShareApp}
          className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-between min-h-[44px]"
        >
          <div className="flex items-center gap-2.5">
            <Share2 className="w-4 h-4 text-indigo-600" />
            <span>Share CareerPulse App</span>
          </div>
          <span className="text-[10px] text-slate-400">Native Share</span>
        </button>

        <button
          onClick={handleReset}
          className="w-full p-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 font-semibold text-xs transition-colors flex items-center justify-between min-h-[44px]"
        >
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Reset Demo Data</span>
          </div>
          <span className="text-[10px] text-rose-500">Restore Initial Data</span>
        </button>
      </div>
    </div>
  );
};

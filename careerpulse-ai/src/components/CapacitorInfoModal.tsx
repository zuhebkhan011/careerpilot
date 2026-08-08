import React from 'react';
import { X, Smartphone, CheckCircle2, ShieldCheck, Cpu, HardDrive, Bell, Zap, Share2, Layers } from 'lucide-react';
import { capacitorService } from '../services/capacitorService';

interface CapacitorInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CapacitorInfoModal: React.FC<CapacitorInfoModalProps> = ({
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const info = capacitorService.getInfo();

  const services = [
    {
      name: 'Storage Service Abstraction',
      status: 'Ready',
      icon: HardDrive,
      desc: 'Decoupled state persistence ready for Capacitor Preferences / SQLite bridge.'
    },
    {
      name: 'Resume File System Service',
      status: 'Ready',
      icon: Layers,
      desc: 'Mobile-first FileReader & base64 encoding ready for @capacitor/filesystem.'
    },
    {
      name: 'Notification Service',
      status: info.hasPushNotifications ? 'Supported' : 'Web Fallback',
      icon: Bell,
      desc: 'In-app toast system ready for @capacitor/local-notifications.'
    },
    {
      name: 'Haptic Feedback',
      status: info.hasHaptics ? 'Active' : 'Simulated',
      icon: Zap,
      desc: 'Vibration pattern triggers ready for @capacitor/haptics.'
    },
    {
      name: 'Native Share API',
      status: 'Supported',
      icon: Share2,
      desc: 'Native share sheet integration with clipboard fallback.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Mobile Application Architecture</h2>
              <p className="text-xs text-slate-300">Capacitor Android & iOS Ready Codebase</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">Capacitor Conversion Checklist</h3>
              <p className="text-xs text-emerald-900 mt-0.5 leading-relaxed">
                This app is designed with decoupled services, touch targets ≥44px, bottom navigation, and no hover-only dependencies. It can be wrapped into native Android (APK) or iOS (Xcode) using <code>npx cap add android</code> with zero UI rewrites.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-indigo-600" />
              Native Device Service Abstractions
            </h4>

            <div className="grid gap-2">
              {services.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-white border border-slate-200 text-indigo-600 shrink-0">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">{s.name}</h5>
                        <p className="text-[11px] text-slate-600">{s.desc}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                      {s.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Code snippet preview */}
          <div className="bg-slate-900 p-3.5 rounded-xl text-slate-200 font-mono text-[11px] space-y-1">
            <div className="text-emerald-400 font-bold"># Capacitor CLI Commands for Export:</div>
            <div>npm install @capacitor/core @capacitor/cli</div>
            <div>npx cap init CareerPulse com.careerpulse.app</div>
            <div>npx cap add android</div>
            <div>npx cap copy</div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors min-h-[44px]"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { X, Smartphone, CheckCircle, ArrowRight } from 'lucide-react';

interface CapacitorInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CapacitorInfoModal: React.FC<CapacitorInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Mobile App Architecture</h3>
              <p className="text-xs text-slate-400">Capacitor JS Native Integration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-sm text-slate-300">
          <p className="leading-relaxed">
            CareerPilot's frontend is architected to build natively for iOS and Android using Capacitor JS without modifying code.
          </p>

          <div className="space-y-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Mobile Commands</h4>
            <div className="font-mono text-xs text-slate-300 space-y-1">
              <div>npx cap add ios</div>
              <div>npx cap add android</div>
              <div>npx cap open android</div>
            </div>
          </div>

          <ul className="space-y-2 text-xs">
            <li className="flex items-center gap-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Platform-independent Express REST APIs (Port 5000)</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Native Camera/PDF picker support via Capacitor plugins</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Responsive touch navigation (Mobile Header & Bottom Nav)</span>
            </li>
          </ul>
        </div>

        <div className="flex justify-end pt-2">
          <button onClick={onClose} className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white">
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
};

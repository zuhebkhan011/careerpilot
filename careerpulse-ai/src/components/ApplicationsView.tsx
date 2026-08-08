import React, { useState } from 'react';
import { Application, ApplicationStatus, Job } from '../types';
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FileText,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Building2,
  MapPin,
  IndianRupee,
  Edit3,
  Check,
  X,
  Sparkles
} from 'lucide-react';
import { capacitorService } from '../services/capacitorService';
import { notificationService } from '../services/notificationService';

interface ApplicationsViewProps {
  applications: Application[];
  onUpdateApplication: (app: Application) => void;
  onDeleteApplication: (id: string) => void;
  onOpenCoverLetter: (job: Job) => void;
  jobs: Job[];
}

export const ApplicationsView: React.FC<ApplicationsViewProps> = ({
  applications,
  onUpdateApplication,
  onDeleteApplication,
  onOpenCoverLetter,
  jobs
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | 'All'>('All');
  const [expandedId, setExpandedId] = useState<string | null>(applications[0]?.id || null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState<string>('');

  const statuses: ApplicationStatus[] = ['Saved', 'Applied', 'Interviewing', 'Offered', 'Rejected'];

  const filteredApps = applications.filter(
    (app) => selectedStatus === 'All' || app.status === selectedStatus
  );

  const statusColors: Record<ApplicationStatus, { bg: string; text: string; border: string }> = {
    Saved: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
    Applied: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    Interviewing: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    Offered: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    Rejected: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' }
  };

  const handleStatusChange = (app: Application, newStatus: ApplicationStatus) => {
    capacitorService.triggerHaptic(15);
    const updated = {
      ...app,
      status: newStatus,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    onUpdateApplication(updated);
    notificationService.success('Status Updated', `Moved ${app.company} application to ${newStatus}`);
  };

  const saveNote = (app: Application) => {
    const updated = {
      ...app,
      notes: noteText,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    onUpdateApplication(updated);
    setEditingNoteId(null);
    notificationService.success('Notes Saved', 'Application notes updated.');
  };

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      {/* Header & Status Filter Pills */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Application Tracker</h2>
            <p className="text-xs text-slate-500">Manage your job search pipeline</p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
            {applications.length} Total
          </span>
        </div>

        {/* Filter Pills - Mobile Friendly Horizontal Scroll */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedStatus('All')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors min-h-[36px] ${
              selectedStatus === 'All'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({applications.length})
          </button>

          {statuses.map((st) => {
            const count = applications.filter((a) => a.status === st).length;
            const style = statusColors[st];
            const isSelected = selectedStatus === st;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border transition-colors min-h-[36px] ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                    : `${style.bg} ${style.text} ${style.border}`
                }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Vertical Status Timeline & Expandable Cards */}
      <div className="space-y-3">
        {filteredApps.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-2">
            <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No applications in this view</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Explore job openings and click "Quick Apply" to add positions to your tracker.
            </p>
          </div>
        ) : (
          filteredApps.map((app) => {
            const isExpanded = expandedId === app.id;
            const style = statusColors[app.status];
            const matchedJob = jobs.find((j) => j.id === app.jobId) || {
              id: app.jobId,
              company: app.company,
              role: app.role,
              location: app.location,
              salary: app.salary,
              workMode: app.workMode,
              matchScore: app.matchScore,
              description: 'Applied position',
              requirements: [],
              skillsRequired: [],
              postedDate: app.appliedDate,
              experienceLevel: 'Mid Level' as const,
              department: 'Engineering',
              benefits: []
            };

            return (
              <div
                key={app.id}
                className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden transition-all"
              >
                {/* Main Card Summary Bar - One-hand Friendly */}
                <div
                  onClick={() => {
                    capacitorService.triggerHaptic(10);
                    setExpandedId(isExpanded ? null : app.id);
                  }}
                  className="p-4 cursor-pointer hover:bg-slate-50/80 transition-colors flex items-start justify-between gap-3 min-h-[64px]"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {app.company.substring(0, 2)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">{app.role}</h3>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        {app.company} • {app.location}
                      </p>
                      <span className="text-[10px] text-slate-400">
                        Applied on {app.appliedDate}
                      </span>
                    </div>
                  </div>

                  {/* Status & Expand Trigger */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${style.bg} ${style.text} ${style.border}`}>
                      {app.status}
                    </span>
                    <button className="p-1 text-slate-400 hover:text-slate-600">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expandable Details Section */}
                {isExpanded && (
                  <div className="p-4 bg-slate-50/80 border-t border-slate-100 space-y-4 animate-fade-in">
                    
                    {/* Status Changer Selector - Touch Friendly Bar */}
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Update Application Stage
                      </label>
                      <div className="grid grid-cols-5 gap-1">
                        {statuses.map((st) => {
                          const isActive = app.status === st;
                          return (
                            <button
                              key={st}
                              onClick={() => handleStatusChange(app, st)}
                              className={`py-2 px-1 rounded-lg text-[10px] font-bold text-center border transition-all min-h-[38px] ${
                                isActive
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs scale-105'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Interview Date if applicable */}
                    {app.status === 'Interviewing' && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-amber-600" />
                            Interview Schedule
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-amber-950">
                          {app.interviewDate || 'Round 1 - Technical Interview (TBD)'}
                        </p>
                      </div>
                    )}

                    {/* Notes Section */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                          Personal Application Notes
                        </label>
                        {editingNoteId !== app.id && (
                          <button
                            onClick={() => {
                              setEditingNoteId(app.id);
                              setNoteText(app.notes || '');
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 min-h-[32px]"
                          >
                            <Edit3 className="w-3 h-3" />
                            Edit Notes
                          </button>
                        )}
                      </div>

                      {editingNoteId === app.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            rows={3}
                            className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Add interview feedback, contact details, or next steps..."
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingNoteId(null)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => saveNote(app)}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold shadow-2xs"
                            >
                              Save Notes
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-700 leading-relaxed font-sans">
                          {app.notes ? app.notes : <span className="text-slate-400 italic">No notes added yet. Click edit to add notes.</span>}
                        </div>
                      )}
                    </div>

                    {/* Action Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                      <button
                        onClick={() => onOpenCoverLetter(matchedJob)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 min-h-[36px]"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>AI Cover Letter</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Remove application for ${app.company}?`)) {
                            onDeleteApplication(app.id);
                            notificationService.info('Removed', 'Application removed from tracker.');
                          }
                        }}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 flex items-center gap-1 min-h-[36px]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

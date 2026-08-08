import React from 'react';
import { Job, Application, ResumeProfile } from '../types';
import {
  Sparkles,
  Search,
  Briefcase,
  FileText,
  Bot,
  TrendingUp,
  Clock,
  ArrowRight,
  CheckCircle2,
  Building2,
  MapPin,
  IndianRupee,
  Calendar,
  ChevronRight
} from 'lucide-react';

interface DashboardViewProps {
  jobs: Job[];
  applications: Application[];
  resume: ResumeProfile;
  setActiveTab: (tab: string) => void;
  onSelectJob: (job: Job) => void;
  onApplyJob: (job: Job) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  jobs,
  applications,
  resume,
  setActiveTab,
  onSelectJob,
  onApplyJob
}) => {
  const interviewingApps = applications.filter((a) => a.status === 'Interviewing');
  const appliedCount = applications.filter((a) => a.status === 'Applied').length;
  const offerCount = applications.filter((a) => a.status === 'Offered').length;

  const topJobMatches = [...jobs].sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);

  return (
    <div className="space-y-5 pb-24 md:pb-6">
      {/* Top Welcome & Match Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-400/20">
                AI Career Pulse Active
              </span>
              <span className="text-xs text-slate-400">• {resume.targetRole || 'Full Stack Developer'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-snug">
              Welcome back, {resume.fullName.split(' ')[0]}!
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your resume matches <strong className="text-indigo-300">{jobs.filter(j => j.matchScore >= 85).length} top positions</strong> with an average fit score of 89%.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('jobs')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 min-h-[44px] shadow-md shadow-indigo-600/30"
            >
              <Search className="w-4 h-4" />
              <span>Explore Jobs</span>
            </button>
            <button
              onClick={() => setActiveTab('coach')}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/15 transition-colors flex items-center justify-center gap-2 min-h-[44px]"
            >
              <Bot className="w-4 h-4 text-indigo-300" />
              <span>Ask AI Coach</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Applied</span>
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-slate-900">{appliedCount}</span>
            <span className="text-[10px] text-slate-500 block">Active Applications</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Interviewing</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-amber-600">{interviewingApps.length}</span>
            <span className="text-[10px] font-medium text-amber-700 block">Round 1 & 2</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Offers</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-600">{offerCount}</span>
            <span className="text-[10px] text-emerald-700 block font-medium">Ready to review</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Top Match</span>
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-indigo-600">95%</span>
            <span className="text-[10px] text-slate-500 block">Razorpay Role</span>
          </div>
        </div>
      </div>

      {/* Upcoming Interview Card if any */}
      {interviewingApps.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start justify-between gap-3 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider bg-amber-200/60 px-2 py-0.5 rounded-md">
                  Upcoming Interview
                </span>
                <span className="text-xs text-amber-900 font-semibold">{interviewingApps[0].company}</span>
              </div>
              <h4 className="text-sm font-bold text-amber-950 mt-1">{interviewingApps[0].role}</h4>
              <p className="text-xs text-amber-900 mt-0.5">
                📅 {interviewingApps[0].interviewDate || 'Scheduled Soon'} • {interviewingApps[0].contactPerson || 'Tech HR Team'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('applications')}
            className="p-2 rounded-xl bg-white hover:bg-amber-100 text-amber-900 text-xs font-semibold border border-amber-200 transition-colors shrink-0 min-h-[40px]"
          >
            Details
          </button>
        </div>
      )}

      {/* Top Recommended Jobs Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">Top AI Job Matches</h3>
            <p className="text-xs text-slate-500">Handpicked roles aligned with your resume skills</p>
          </div>
          <button
            onClick={() => setActiveTab('jobs')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 min-h-[36px]"
          >
            <span>View All ({jobs.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Vertical Job Cards for Mobile / Grid for Desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {topJobMatches.map((job) => {
            const isApplied = applications.some((a) => a.jobId === job.id);
            return (
              <div
                key={job.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-200 hover:shadow-md transition-all flex flex-col justify-between gap-3"
              >
                <div>
                  {/* Company & Match Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                        {job.company.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 leading-none">{job.company}</h4>
                        <span className="text-[10px] text-slate-500">{job.workMode}</span>
                      </div>
                    </div>
                    <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      {job.matchScore}% Match
                    </span>
                  </div>

                  {/* Role & Key Meta */}
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{job.role}</h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1 font-medium text-slate-900">
                      <IndianRupee className="w-3 h-3 text-slate-400" />
                      {job.salary}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onSelectJob(job)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors text-center min-h-[40px]"
                  >
                    View Match
                  </button>
                  <button
                    onClick={() => onApplyJob(job)}
                    disabled={isApplied}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold transition-colors text-center min-h-[40px] ${
                      isApplied
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    {isApplied ? 'Applied' : 'Apply'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Quick Shortcuts Section */}
      <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100/80 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          Quick AI Career Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => setActiveTab('resume')}
            className="p-3 rounded-xl bg-white border border-indigo-100 text-left hover:border-indigo-300 transition-colors flex items-center gap-3 group min-h-[48px]"
          >
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Optimize Resume</h4>
              <p className="text-[10px] text-slate-500">Upload PDF or edit skills</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('coach')}
            className="p-3 rounded-xl bg-white border border-indigo-100 text-left hover:border-indigo-300 transition-colors flex items-center gap-3 group min-h-[48px]"
          >
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Interview Practice</h4>
              <p className="text-[10px] text-slate-500">Ask Gemini technical prep</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('applications')}
            className="p-3 rounded-xl bg-white border border-indigo-100 text-left hover:border-indigo-300 transition-colors flex items-center gap-3 group min-h-[48px]"
          >
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Tracker Timeline</h4>
              <p className="text-[10px] text-slate-500">Manage status & offers</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

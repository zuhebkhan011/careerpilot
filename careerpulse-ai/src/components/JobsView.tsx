import React, { useState, useMemo } from 'react';
import { Job, Application, WorkMode, FilterState } from '../types';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  IndianRupee,
  Building2,
  Sparkles,
  Check,
  X,
  Briefcase,
  Layers,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';
import { capacitorService } from '../services/capacitorService';

interface JobsViewProps {
  jobs: Job[];
  applications: Application[];
  onSelectJob: (job: Job) => void;
  onApplyJob: (job: Job) => void;
}

export const JobsView: React.FC<JobsViewProps> = ({
  jobs,
  applications,
  onSelectJob,
  onApplyJob
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    location: '',
    workMode: 'All',
    experienceLevel: 'All',
    minMatchScore: 0
  });

  const [showFilterSheet, setShowFilterSheet] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'match' | 'salary' | 'recent'>('match');

  // Filter & Sort Logic
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        const matchesSearch =
          !filters.search ||
          job.role.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.company.toLowerCase().includes(filters.search.toLowerCase()) ||
          job.skillsRequired.some((s) => s.toLowerCase().includes(filters.search.toLowerCase()));

        const matchesLocation =
          !filters.location ||
          job.location.toLowerCase().includes(filters.location.toLowerCase());

        const matchesWorkMode =
          filters.workMode === 'All' || job.workMode === filters.workMode;

        const matchesExp =
          filters.experienceLevel === 'All' || job.experienceLevel === filters.experienceLevel;

        const matchesScore = job.matchScore >= filters.minMatchScore;

        return matchesSearch && matchesLocation && matchesWorkMode && matchesExp && matchesScore;
      })
      .sort((a, b) => {
        if (sortBy === 'match') return b.matchScore - a.matchScore;
        if (sortBy === 'recent') return b.postedDate.localeCompare(a.postedDate);
        return b.matchScore - a.matchScore;
      });
  }, [jobs, filters, sortBy]);

  const activeFilterCount =
    (filters.workMode !== 'All' ? 1 : 0) +
    (filters.experienceLevel !== 'All' ? 1 : 0) +
    (filters.minMatchScore > 0 ? 1 : 0) +
    (filters.location ? 1 : 0);

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      {/* Top Search & Filter Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3 sticky top-14 md:top-0 z-20">
        <div className="flex items-center gap-2">
          {/* Main Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              placeholder="Search TCS, Backend, React, Ahmedabad..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all min-h-[44px]"
            />
            {filters.search && (
              <button
                onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Filter Sheet Button */}
          <button
            onClick={() => {
              capacitorService.triggerHaptic(10);
              setShowFilterSheet(true);
            }}
            className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-1.5 min-h-[44px] shrink-0"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Quick Work Mode Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {(['All', 'Remote', 'Hybrid', 'Onsite'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilters((prev) => ({ ...prev, workMode: mode }))}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all min-h-[36px] ${
                filters.workMode === mode
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 mx-1 shrink-0" />

          {/* Quick Min Match Score Chips */}
          {[0, 80, 90].map((score) => (
            <button
              key={score}
              onClick={() => setFilters((prev) => ({ ...prev, minMatchScore: score }))}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all min-h-[36px] ${
                filters.minMatchScore === score
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
              }`}
            >
              {score === 0 ? 'All Scores' : `${score}%+ Match`}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-semibold text-slate-600">
          Showing <span className="text-slate-900 font-bold">{filteredJobs.length}</span> positions
        </p>

        <div className="flex items-center gap-1.5 text-xs text-slate-600">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'match' | 'salary' | 'recent')}
            className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer min-h-[32px]"
          >
            <option value="match">Highest Match Score</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>
      </div>

      {/* Mobile Job Vertical Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredJobs.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
            <Search className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No jobs match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">Try resetting filters or searching for broader terms like "Developer" or "Remote".</p>
            <button
              onClick={() => setFilters({ search: '', location: '', workMode: 'All', experienceLevel: 'All', minMatchScore: 0 })}
              className="mt-2 px-4 py-2 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const isApplied = applications.some((a) => a.jobId === job.id);

            return (
              <div
                key={job.id}
                className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between gap-3.5"
              >
                {/* Header: Company & Match Badge */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                        {job.company.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 leading-tight">{job.company}</h4>
                        <span className="text-[10px] font-medium text-slate-500">{job.postedDate}</span>
                      </div>
                    </div>

                    {/* Prominent Match Score Pill as in user requirement */}
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 shadow-2xs">
                        {job.matchScore}% Match
                      </span>
                    </div>
                  </div>

                  {/* Role Title */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{job.role}</h3>

                  {/* Location, Salary, Work Mode Pill Row */}
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 pt-1">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-medium text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" />
                      {job.location}
                    </span>

                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 font-bold text-emerald-900 border border-emerald-100 flex items-center gap-0.5">
                      <IndianRupee className="w-3 h-3 text-emerald-600" />
                      {job.salary}
                    </span>

                    <span className="px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">
                      {job.workMode}
                    </span>
                  </div>

                  {/* Skills tags preview */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {job.skillsRequired.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {skill}
                      </span>
                    ))}
                    {job.skillsRequired.length > 4 && (
                      <span className="text-[10px] text-slate-400 font-medium px-1.5 py-0.5">
                        +{job.skillsRequired.length - 4}
                      </span>
                    )}
                  </div>
                </div>

                {/* Mobile Touch-Friendly Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => {
                      capacitorService.triggerHaptic(10);
                      onSelectJob(job);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200/80 transition-colors text-center min-h-[44px] flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>View Match</span>
                  </button>

                  <button
                    onClick={() => {
                      capacitorService.triggerHaptic(15);
                      onApplyJob(job);
                    }}
                    disabled={isApplied}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-colors text-center min-h-[44px] flex items-center justify-center gap-1.5 ${
                      isApplied
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>{isApplied ? 'Applied' : 'Quick Apply'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Mobile Filter Sheet Modal */}
      {showFilterSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-xs p-0 animate-fade-in">
          <div className="w-full bg-white rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto border-t border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Filter Job Search</h3>
              <button
                onClick={() => setShowFilterSheet(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Location filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Location</label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="e.g. Ahmedabad, Bangalore, Remote..."
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
              />
            </div>

            {/* Experience level */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Experience Level</label>
              <div className="grid grid-cols-2 gap-2">
                {['All', 'Internship', 'Entry Level', 'Mid Level', 'Senior'].map((exp) => (
                  <button
                    key={exp}
                    onClick={() => setFilters((prev) => ({ ...prev, experienceLevel: exp }))}
                    className={`p-2.5 rounded-xl text-xs font-semibold border text-center transition-colors min-h-[40px] ${
                      filters.experienceLevel === exp
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {exp}
                  </button>
                ))}
              </div>
            </div>

            {/* Minimum match score slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
                <span>Minimum Match Score</span>
                <span className="text-indigo-600">{filters.minMatchScore}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="95"
                step="5"
                value={filters.minMatchScore}
                onChange={(e) => setFilters((prev) => ({ ...prev, minMatchScore: Number(e.target.value) }))}
                className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Done button */}
            <button
              onClick={() => setShowFilterSheet(false)}
              className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm min-h-[48px] shadow-md"
            >
              Apply Filters ({filteredJobs.length} Results)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

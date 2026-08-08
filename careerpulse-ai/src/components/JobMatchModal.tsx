import React, { useState } from 'react';
import { Job, ResumeProfile, MatchAnalysis } from '../types';
import { X, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Lightbulb, FileText, Briefcase, RefreshCw, Layers } from 'lucide-react';
import { notificationService } from '../services/notificationService';

interface JobMatchModalProps {
  job: Job;
  resume: ResumeProfile;
  isOpen: boolean;
  onClose: () => void;
  onOpenCoverLetter: (job: Job) => void;
  onApply: (job: Job) => void;
  isApplied: boolean;
}

export const JobMatchModal: React.FC<JobMatchModalProps> = ({
  job,
  resume,
  isOpen,
  onClose,
  onOpenCoverLetter,
  onApply,
  isApplied
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [analysis, setAnalysis] = useState<MatchAnalysis | null>(null);

  // Trigger analysis call
  const runMatchAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job, resume })
      });
      const data = await response.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      } else {
        throw new Error(data.error || 'Failed to generate match analysis');
      }
    } catch (err: unknown) {
      console.error(err);
      notificationService.error('Analysis Failed', 'Could not fetch live AI match metrics. Using estimate.');
      // Fallback fallback estimation
      setAnalysis({
        matchScore: job.matchScore,
        fitRating: job.matchScore >= 90 ? 'Strong Match' : job.matchScore >= 80 ? 'Moderate Match' : 'Growth Opportunity',
        summary: `Your candidate profile aligns well with ${job.company}'s requirements for ${job.role}. Your expertise in ${resume.skills.slice(0, 3).join(', ')} directly applies to their key responsibilities.`,
        strengths: resume.skills.filter(s => job.skillsRequired.includes(s)),
        missingSkills: job.skillsRequired.filter(s => !resume.skills.includes(s)),
        partialMatches: ['REST APIs', 'Database Optimization'],
        recommendations: [
          `Emphasize your hands-on experience with ${job.skillsRequired[0] || 'core technologies'} in your interview responses.`,
          `Highlight metrics from your previous project at ${resume.experiences[0]?.company || 'Tech Solutions'}.`,
          `Generate a tailored cover letter explaining your passion for ${job.company}.`
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !analysis) {
      runMatchAnalysis();
    }
  }, [isOpen, job]);

  if (!isOpen) return null;

  const displayScore = analysis ? analysis.matchScore : job.matchScore;

  const scoreColor = displayScore >= 88
    ? 'text-emerald-600 bg-emerald-50 border-emerald-200'
    : displayScore >= 75
    ? 'text-indigo-600 bg-indigo-50 border-indigo-200'
    : 'text-amber-600 bg-amber-50 border-amber-200';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      {/* Container - Bottom sheet on Mobile, Modal on Desktop */}
      <div className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">AI Match Insights</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/20">Live Analysis</span>
              </div>
              <h2 className="text-lg font-bold text-white leading-tight">{job.role}</h2>
              <p className="text-xs text-slate-300">{job.company} • {job.location} ({job.salary})</p>
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

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {loading ? (
            <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">Calculating AI Match Metrics...</p>
              <p className="text-xs text-slate-500 max-w-xs">Comparing your resume against {job.company}'s requirements.</p>
            </div>
          ) : (
            <>
              {/* Score Header Card */}
              <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${scoreColor}`}>
                <div className="flex items-center gap-4 text-center sm:text-left">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-xs border flex flex-col items-center justify-center shrink-0">
                    <span className="text-2xl font-black leading-none">{displayScore}%</span>
                    <span className="text-[9px] font-bold tracking-wider uppercase text-slate-500 mt-0.5">Match</span>
                  </div>
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/80 shadow-2xs mb-1">
                      {analysis?.fitRating || 'Strong Match'}
                    </span>
                    <h3 className="text-sm font-semibold text-slate-900">
                      High Alignment for {resume.targetRole || 'your profile'}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={runMatchAnalysis}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 min-h-[40px]"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                  <span>Re-analyze</span>
                </button>
              </div>

              {/* 1. Why You Match Section */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Why You Match
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed font-normal">
                  {analysis?.summary}
                </p>
              </div>

              {/* 2. Key Strengths Card */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-2.5">
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Top Matching Strengths ({analysis?.strengths?.length || 0})
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {analysis?.strengths && analysis.strengths.length > 0 ? (
                    analysis.strengths.map((str, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-medium border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        {str}
                      </span>
                    ))
                  ) : (
                    <p className="text-xs text-emerald-700">Matches key job criteria.</p>
                  )}
                </div>
              </div>

              {/* 3. Partial Matches & Adjacent Skills */}
              {analysis?.partialMatches && analysis.partialMatches.length > 0 && (
                <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-100 space-y-2">
                  <h4 className="text-xs font-bold text-sky-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-sky-600" />
                    Adjacent / Partial Skill Matches
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.partialMatches.map((part, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-900 text-xs font-medium border border-sky-200">
                        ~ {part}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Missing Skills & Gaps */}
              {analysis?.missingSkills && analysis.missingSkills.length > 0 && (
                <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-100 space-y-2">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Skills to Highlight or Learn ({analysis.missingSkills.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.missingSkills.map((sk, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-100/90 text-amber-900 text-xs font-medium border border-amber-200">
                        ! {sk}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. AI Recommendations */}
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 space-y-2">
                <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  AI Recommendations
                </h4>
                <ul className="space-y-1.5">
                  {analysis?.recommendations?.map((rec, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenCoverLetter(job);
            }}
            className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold text-sm transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>AI Cover Letter</span>
          </button>

          <button
            onClick={() => {
              onApply(job);
              onClose();
            }}
            disabled={isApplied}
            className={`w-full sm:w-auto flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 min-h-[44px] ${
              isApplied
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>{isApplied ? 'Application Submitted' : 'Quick Apply Now'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

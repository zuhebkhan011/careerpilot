import React, { useState } from 'react';
import { Job, ResumeProfile } from '../types';
import { X, Sparkles, Copy, Download, RefreshCw, Check, FileText } from 'lucide-react';
import { notificationService } from '../services/notificationService';

interface CoverLetterModalProps {
  job: Job;
  resume: ResumeProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const CoverLetterModal: React.FC<CoverLetterModalProps> = ({
  job,
  resume,
  isOpen,
  onClose
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [tone, setTone] = useState<string>('Professional & Enthusiastic');
  const [copied, setCopied] = useState<boolean>(false);

  const generateLetter = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job, resume, tone })
      });
      const data = await response.json();
      if (data.success && data.coverLetter) {
        setCoverLetter(data.coverLetter);
      } else {
        throw new Error(data.error || 'Failed to generate cover letter');
      }
    } catch (err: unknown) {
      console.error(err);
      notificationService.error('Generation Error', 'Using fallback cover letter template.');
      setCoverLetter(`Dear Hiring Manager at ${job.company},

I am writing to express my enthusiastic interest in the ${job.role} position at ${job.company}. With my background as a ${resume.targetRole || 'Developer'} and hands-on experience in ${resume.skills.slice(0, 4).join(', ')}, I am confident in my ability to make an immediate impact on your team.

At my recent role at ${resume.experiences[0]?.company || 'Tech Solutions'}, I engineered responsive applications and robust backend logic. My skill set closely mirrors your requirements for ${job.skillsRequired.slice(0, 3).join(', ')}.

I would welcome the opportunity to discuss how my qualifications align with ${job.company}'s goals. Thank you for your time and consideration.

Sincerely,
${resume.fullName}
${resume.email} | ${resume.phone}`);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && !coverLetter) {
      generateLetter();
    }
  }, [isOpen, job, tone]);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    notificationService.success('Copied!', 'Cover letter copied to clipboard.');
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadTxt = () => {
    const element = document.createElement('a');
    const file = new Blob([coverLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Cover_Letter_${job.company}_${job.role.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    notificationService.success('Downloaded!', 'Cover letter file downloaded.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-indigo-200">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">AI Cover Letter</h2>
              <p className="text-xs text-indigo-200">{job.role} at {job.company}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close cover letter modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tone Selector bar */}
        <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto shrink-0">
          <span className="text-xs font-semibold text-slate-600 shrink-0">Tone:</span>
          {['Professional & Enthusiastic', 'Confident & Direct', 'Creative & Passionate'].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTone(t);
                setCoverLetter('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors min-h-[36px] ${
                tone === t
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 animate-spin">
                <RefreshCw className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">Writing tailored cover letter...</p>
              <p className="text-xs text-slate-500">Aligning {resume.fullName}'s experience with {job.company}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={12}
                className="w-full p-4 rounded-xl border border-slate-300 text-sm text-slate-800 leading-relaxed font-sans focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none bg-slate-50/50"
                placeholder="Cover letter text will appear here..."
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2.5 shrink-0">
          <button
            onClick={generateLetter}
            disabled={loading}
            className="px-3 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors flex items-center gap-1.5 min-h-[44px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Regenerate</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-sm transition-colors flex items-center gap-2 min-h-[44px]"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={downloadTxt}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors flex items-center gap-2 min-h-[44px] shadow-sm"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

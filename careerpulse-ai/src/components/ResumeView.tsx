import React, { useState } from 'react';
import { ResumeProfile, WorkExperience, Education } from '../types';
import { resumeUploadService } from '../services/resumeUploadService';
import { notificationService } from '../services/notificationService';
import {
  FileText,
  Upload,
  Plus,
  Trash2,
  Sparkles,
  RefreshCw,
  Check,
  Edit2,
  Briefcase,
  GraduationCap,
  User,
  Phone,
  Mail,
  MapPin,
  Tag
} from 'lucide-react';

interface ResumeViewProps {
  resume: ResumeProfile;
  onSaveResume: (updated: ResumeProfile) => void;
}

export const ResumeView: React.FC<ResumeViewProps> = ({
  resume,
  onSaveResume
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'skills' | 'edit'>('upload');
  const [parsing, setParsing] = useState<boolean>(false);
  const [newSkill, setNewSkill] = useState<string>('');

  // Editable Profile fields state
  const [profileData, setProfileData] = useState<ResumeProfile>(resume);

  // File Upload Handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setParsing(true);
      const processed = await resumeUploadService.processUploadedFile(file);

      notificationService.info('File Loaded', `Processing ${processed.fileName} with AI...`);

      // Call AI Resume Parser Server Route
      const response = await fetch('/api/ai/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: processed.rawText,
          base64Data: processed.base64Data,
          mimeType: processed.mimeType
        })
      });

      const data = await response.json();

      if (data.success && data.parsedProfile) {
        const parsed = data.parsedProfile;
        const updatedResume: ResumeProfile = {
          ...profileData,
          fullName: parsed.fullName || profileData.fullName,
          email: parsed.email || profileData.email,
          phone: parsed.phone || profileData.phone,
          location: parsed.location || profileData.location,
          targetRole: parsed.targetRole || profileData.targetRole,
          summary: parsed.summary || profileData.summary,
          skills: parsed.skills && parsed.skills.length > 0 ? parsed.skills : profileData.skills,
          experiences: parsed.experiences && parsed.experiences.length > 0 ? parsed.experiences : profileData.experiences,
          education: parsed.education && parsed.education.length > 0 ? parsed.education : profileData.education,
          fileName: processed.fileName,
          fileSize: processed.fileSize,
          updatedAt: new Date().toISOString().split('T')[0]
        };

        setProfileData(updatedResume);
        onSaveResume(updatedResume);
        notificationService.success('Resume Parsed!', 'Successfully updated your career profile.');
      } else {
        throw new Error(data.error || 'Parsing failed');
      }
    } catch (err) {
      console.error(err);
      notificationService.warning('Manual Update Ready', 'File loaded. You can refine skills and details below.');
      const fallbackResume: ResumeProfile = {
        ...profileData,
        fileName: file.name,
        fileSize: resumeUploadService.formatSize(file.size),
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setProfileData(fallbackResume);
      onSaveResume(fallbackResume);
    } finally {
      setParsing(false);
    }
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    if (profileData.skills.includes(newSkill.trim())) {
      notificationService.warning('Duplicate Skill', 'Skill already in your list.');
      return;
    }
    const updatedSkills = [...profileData.skills, newSkill.trim()];
    const updated = { ...profileData, skills: updatedSkills };
    setProfileData(updated);
    onSaveResume(updated);
    setNewSkill('');
    notificationService.success('Skill Added', `Added ${newSkill.trim()} to your profile.`);
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = profileData.skills.filter((s) => s !== skillToRemove);
    const updated = { ...profileData, skills: updatedSkills };
    setProfileData(updated);
    onSaveResume(updated);
  };

  const handleSaveProfileForm = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveResume(profileData);
    notificationService.success('Profile Saved', 'Resume profile updated successfully.');
  };

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      {/* Top Segmented Tabs for Mobile */}
      <div className="p-1.5 bg-slate-200/80 rounded-2xl flex items-center gap-1">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all min-h-[40px] flex items-center justify-center gap-1.5 ${
            activeTab === 'upload'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-indigo-600" />
          <span>Upload PDF</span>
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all min-h-[40px] flex items-center justify-center gap-1.5 ${
            activeTab === 'skills'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Tag className="w-3.5 h-3.5 text-emerald-600" />
          <span>Skills ({profileData.skills.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('edit')}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all min-h-[40px] flex items-center justify-center gap-1.5 ${
            activeTab === 'edit'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Edit2 className="w-3.5 h-3.5 text-sky-600" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Tab 1: Upload PDF & Resume File Picker */}
      {activeTab === 'upload' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto">
              <Upload className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900">Upload Resume from Phone or PC</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Supports PDF, DOCX, TXT. Our AI automatically extracts your contact details, skills, and work experience.
              </p>
            </div>

            {/* Native Mobile File Picker Button */}
            <div className="max-w-xs mx-auto">
              <label className="cursor-pointer block">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc,.txt,.md"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 min-h-[48px] shadow-md shadow-indigo-200">
                  {parsing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Parsing Resume with AI...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>Select Resume File</span>
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* Active Loaded File Card */}
            {profileData.fileName && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-left text-xs max-w-md mx-auto">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-100 text-indigo-700 font-bold">
                    PDF
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{profileData.fileName}</h4>
                    <span className="text-[10px] text-slate-500">
                      {profileData.fileSize || '420 KB'} • Updated {profileData.updatedAt}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Parsed
                </span>
              </div>
            )}
          </div>

          {/* Current Profile Summary Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-sm font-bold text-slate-900">Extracted Profile Summary</h3>
              <button
                onClick={() => setActiveTab('edit')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="font-semibold text-slate-900">{profileData.fullName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{profileData.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{profileData.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{profileData.location}</span>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                Professional Bio Summary
              </label>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                {profileData.summary}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Skills Tag Manager */}
      {activeTab === 'skills' && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">Skill Portfolio ({profileData.skills.length})</h3>
            <p className="text-xs text-slate-500">
              Add key technologies to boost your AI Job Match percentage score.
            </p>
          </div>

          {/* Add Skill Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              placeholder="Add skill (e.g., Docker, GraphQL, Python)..."
              className="flex-1 p-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
            />
            <button
              onClick={handleAddSkill}
              className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 min-h-[44px] shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>

          {/* Skills List */}
          <div className="flex flex-wrap gap-2 pt-2">
            {profileData.skills.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-900 text-xs font-semibold border border-indigo-200/80 flex items-center gap-2"
              >
                <span>{skill}</span>
                <button
                  onClick={() => handleRemoveSkill(skill)}
                  className="p-0.5 rounded-md hover:bg-indigo-200 text-indigo-500 hover:text-indigo-800 transition-colors"
                  aria-label={`Remove ${skill}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Detailed Profile Form Editor */}
      {activeTab === 'edit' && (
        <form onSubmit={handleSaveProfileForm} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
            Edit Candidate Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number</label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Location</label>
              <input
                type="text"
                value={profileData.location}
                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Job Role</label>
            <input
              type="text"
              value={profileData.targetRole}
              onChange={(e) => setProfileData({ ...profileData, targetRole: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 min-h-[44px]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Executive Summary</label>
            <textarea
              value={profileData.summary}
              onChange={(e) => setProfileData({ ...profileData, summary: e.target.value })}
              rows={4}
              className="w-full p-3 rounded-xl border border-slate-200 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors min-h-[48px] shadow-md"
          >
            Save All Changes
          </button>
        </form>
      )}
    </div>
  );
};

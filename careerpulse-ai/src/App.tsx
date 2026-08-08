import React, { useState, useEffect } from 'react';
import { Job, Application, ResumeProfile } from './types';
import { storageService } from './services/storageService';
import { notificationService } from './services/notificationService';
import { DesktopSidebar } from './components/DesktopSidebar';
import { MobileHeader } from './components/MobileHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DashboardView } from './components/DashboardView';
import { JobsView } from './components/JobsView';
import { ApplicationsView } from './components/ApplicationsView';
import { ResumeView } from './components/ResumeView';
import { AICareerCoachView } from './components/AICareerCoachView';
import { ProfileView } from './components/ProfileView';
import { JobMatchModal } from './components/JobMatchModal';
import { CoverLetterModal } from './components/CoverLetterModal';
import { CapacitorInfoModal } from './components/CapacitorInfoModal';
import { ToastContainer } from './components/ToastContainer';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core Persistent State
  const [jobs, setJobs] = useState<Job[]>(() => storageService.getJobs());
  const [applications, setApplications] = useState<Application[]>(() =>
    storageService.getApplications()
  );
  const [resume, setResume] = useState<ResumeProfile>(() => storageService.getResume());

  // Modal States
  const [matchJob, setMatchJob] = useState<Job | null>(null);
  const [coverLetterJob, setCoverLetterJob] = useState<Job | null>(null);
  const [isCapacitorModalOpen, setIsCapacitorModalOpen] = useState<boolean>(false);

  // Sync back to storage when state changes
  useEffect(() => {
    storageService.saveJobs(jobs);
  }, [jobs]);

  useEffect(() => {
    storageService.saveApplications(applications);
  }, [applications]);

  useEffect(() => {
    storageService.saveResume(resume);
  }, [resume]);

  // Apply to a job action
  const handleApplyJob = (job: Job) => {
    if (applications.some((a) => a.jobId === job.id)) {
      notificationService.info('Already Applied', `You have already applied for ${job.role} at ${job.company}.`);
      return;
    }

    const newApp: Application = {
      id: 'app-' + Math.random().toString(36).substring(2, 9),
      jobId: job.id,
      company: job.company,
      role: job.role,
      location: job.location,
      salary: job.salary,
      workMode: job.workMode,
      status: 'Applied',
      appliedDate: new Date().toISOString().split('T')[0],
      lastUpdated: new Date().toISOString().split('T')[0],
      notes: `Applied via CareerPulse AI Quick Apply. Match score: ${job.matchScore}%.`,
      matchScore: job.matchScore
    };

    const updated = [newApp, ...applications];
    setApplications(updated);
    notificationService.success('Application Submitted!', `Applied for ${job.role} at ${job.company}.`);
  };

  // Update application
  const handleUpdateApplication = (updatedApp: Application) => {
    setApplications((prev) => prev.map((a) => (a.id === updatedApp.id ? updatedApp : a)));
  };

  // Delete application
  const handleDeleteApplication = (appId: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== appId));
  };

  // Update resume
  const handleSaveResume = (updatedResume: ResumeProfile) => {
    setResume(updatedResume);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans flex flex-col md:flex-row antialiased selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification Overlay */}
      <ToastContainer />

      {/* Desktop Sidebar Navigation */}
      <DesktopSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openCapacitorInfo={() => setIsCapacitorModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Mobile Header */}
        <MobileHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          openCapacitorInfo={() => setIsCapacitorModalOpen(true)}
        />

        {/* View Page Container */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-3.5 sm:p-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              jobs={jobs}
              applications={applications}
              resume={resume}
              setActiveTab={setActiveTab}
              onSelectJob={(j) => setMatchJob(j)}
              onApplyJob={handleApplyJob}
            />
          )}

          {activeTab === 'jobs' && (
            <JobsView
              jobs={jobs}
              applications={applications}
              onSelectJob={(j) => setMatchJob(j)}
              onApplyJob={handleApplyJob}
            />
          )}

          {activeTab === 'applications' && (
            <ApplicationsView
              applications={applications}
              onUpdateApplication={handleUpdateApplication}
              onDeleteApplication={handleDeleteApplication}
              onOpenCoverLetter={(j) => setCoverLetterJob(j)}
              jobs={jobs}
            />
          )}

          {activeTab === 'resume' && (
            <ResumeView resume={resume} onSaveResume={handleSaveResume} />
          )}

          {activeTab === 'coach' && <AICareerCoachView resume={resume} />}

          {activeTab === 'profile' && (
            <ProfileView
              resume={resume}
              onSaveResume={handleSaveResume}
              openCapacitorInfo={() => setIsCapacitorModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals */}
      {matchJob && (
        <JobMatchModal
          job={matchJob}
          resume={resume}
          isOpen={!!matchJob}
          onClose={() => setMatchJob(null)}
          onOpenCoverLetter={(j) => setCoverLetterJob(j)}
          onApply={handleApplyJob}
          isApplied={applications.some((a) => a.jobId === matchJob.id)}
        />
      )}

      {coverLetterJob && (
        <CoverLetterModal
          job={coverLetterJob}
          resume={resume}
          isOpen={!!coverLetterJob}
          onClose={() => setCoverLetterJob(null)}
        />
      )}

      <CapacitorInfoModal
        isOpen={isCapacitorModalOpen}
        onClose={() => setIsCapacitorModalOpen(false)}
      />
    </div>
  );
}

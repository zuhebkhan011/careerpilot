import React, { useState, useEffect } from 'react';
import { Job, Application, ResumeProfile } from './types';
import { apiService } from './services/apiService';
import { DesktopSidebar, Tab } from './components/DesktopSidebar';
import { MobileHeader } from './components/MobileHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { DashboardView } from './components/DashboardView';
import { JobsView } from './components/JobsView';
import { ApplicationsView } from './components/ApplicationsView';
import { ResumeView } from './components/ResumeView';
import { AICareerCoachView } from './components/AICareerCoachView';
import { ProfileView } from './components/ProfileView';
import { LoginView } from './components/LoginView';
import { JobMatchModal } from './components/JobMatchModal';
import { CoverLetterModal } from './components/CoverLetterModal';
import { ProUpgradeModal } from './components/ProUpgradeModal';
import { NewApplicationModal } from './components/NewApplicationModal';

const DEFAULT_PROFILE: ResumeProfile = {
  id: 'demo-profile-1',
  fullName: 'Rahul Sharma',
  email: 'rahul.sharma@example.com',
  phone: '+91 9876543210',
  location: 'Bengaluru, India',
  targetRole: 'Software Engineer',
  yearsOfExperience: 1,
  summary: 'Computer Science Graduate with hands-on Node.js & Express REST API experience.',
  skills: ['JavaScript', 'TypeScript', 'Node.js', 'Express.js', 'React', 'PostgreSQL', 'Git'],
  experiences: [
    {
      id: 'exp-1',
      title: 'Software Developer Intern',
      company: 'Tech Solutions India',
      period: 'Jan 2024 - Jun 2024',
      description: 'Developed microservices REST backend using Express and PostgreSQL.',
    },
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'B.Tech in Computer Science',
      institution: 'Vellore Institute of Technology (VIT)',
      year: '2024',
    },
  ],
  updatedAt: new Date().toISOString(),
};

interface Toast { id: string; type: 'success' | 'error' | 'info'; title: string; message?: string }
let toastTimeout: Record<string, ReturnType<typeof setTimeout>> = {};

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!sessionStorage.getItem('cp_profile_id');
  });

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [resume, setResume] = useState<ResumeProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  // Modals
  const [matchJob, setMatchJob] = useState<Job | null>(null);
  const [coverLetterJob, setCoverLetterJob] = useState<Job | null>(null);
  const [isProModalOpen, setIsProModalOpen] = useState(false);
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast['type'], title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    toastTimeout[id] = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      delete toastTimeout[id];
    }, 4000);
  };

  const removeToast = (id: string) => {
    clearTimeout(toastTimeout[id]);
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const loadData = async () => {
    setLoading(true);
    const profileId = sessionStorage.getItem('cp_profile_id') || 'demo-profile-1';
    try {
      const [prof, jobList, appList] = await Promise.all([
        apiService.getProfile(profileId).catch(() => null),
        apiService.getJobs().catch(() => []),
        apiService.getApplications(profileId).catch(() => []),
      ]);
      if (prof) setResume(prof);
      if (jobList.length > 0) setJobs(jobList);
      setApplications(appList);
    } catch {
      addToast('error', 'Connection Error', 'Could not connect to backend. Ensure server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = (profileId: string) => {
    setIsAuthenticated(true);
    setActiveTab('dashboard');
    addToast('success', 'Welcome back!', 'Successfully signed in to CareerPilot.');
  };

  const handleApplyJob = async (job: Job) => {
    try {
      await apiService.saveApplication({
        profileId: resume.id,
        jobId: job.id,
        status: 'Applied',
        notes: `Applied from UI. Role: ${job.role} at ${job.company}`,
      });
      const updatedApps = await apiService.getApplications(resume.id);
      setApplications(updatedApps);
      addToast('success', 'Application Saved!', `${job.role} at ${job.company} added to tracker.`);
    } catch (e: any) {
      if (e.message?.includes('already exists')) {
        addToast('info', 'Already Tracked', `Application for ${job.role} already exists.`);
      } else {
        addToast('error', 'Save Failed', e.message);
      }
    }
  };

  const handleUpdateApplication = async (updatedApp: Application) => {
    try {
      await apiService.updateApplicationStatus(updatedApp.id, updatedApp.status, updatedApp.notes);
      const updatedApps = await apiService.getApplications(resume.id);
      setApplications(updatedApps);
      addToast('success', 'Status Updated', `Changed to '${updatedApp.status}'`);
    } catch (e: any) {
      addToast('error', 'Update Failed', e.message);
    }
  };

  const handleDeleteApplication = async (appId: string) => {
    try {
      await apiService.deleteApplication(appId);
      const updatedApps = await apiService.getApplications(resume.id);
      setApplications(updatedApps);
      addToast('info', 'Removed', 'Application deleted.');
    } catch (e: any) {
      addToast('error', 'Delete Failed', e.message);
    }
  };

  const handleSaveResume = (updatedResume: ResumeProfile) => {
    setResume(updatedResume);
    addToast('success', 'Profile Saved', 'Your changes have been saved to Supabase.');
    loadData();
  };

  // Render Login view if not authenticated
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const appsFullHeight = activeTab === 'applications';

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        backgroundColor: 'var(--color-background)',
        fontFamily: 'Manrope, sans-serif',
        color: 'var(--color-on-background)',
      }}
    >
      {/* Desktop Sidebar (fixed 260px) */}
      <DesktopSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProModal={() => setIsProModalOpen(true)}
        applications={applications}
        jobs={jobs}
      />

      {/* Main content area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          overflowY: appsFullHeight ? 'hidden' : 'auto',
          overflowX: 'hidden',
          paddingBottom: 80, // mobile bottom nav clearance
        }}
        className="md-main-area"
      >
        {/* Mobile Header */}
        <MobileHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          applications={applications}
          jobs={jobs}
        />

        {/* View area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: appsFullHeight ? 'calc(100vh - 64px)' : undefined,
            overflow: appsFullHeight ? 'hidden' : undefined,
          }}
        >
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  jobs={jobs}
                  applications={applications}
                  resume={resume}
                  setActiveTab={setActiveTab}
                  onSelectJob={(j) => setMatchJob(j)}
                  onApplyJob={handleApplyJob}
                  onOpenProModal={() => setIsProModalOpen(true)}
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
                  onOpenNewAppModal={() => setIsNewAppModalOpen(true)}
                />
              )}
              {activeTab === 'resume' && (
                <ResumeView resume={resume} onSaveResume={handleSaveResume} />
              )}
              {activeTab === 'coach' && (
                <AICareerCoachView resume={resume} />
              )}
              {activeTab === 'profile' && (
                <ProfileView resume={resume} onSaveResume={handleSaveResume} />
              )}
            </>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Modals */}
      <JobMatchModal
        job={matchJob}
        onClose={() => setMatchJob(null)}
        onApply={handleApplyJob}
      />
      <CoverLetterModal
        job={coverLetterJob}
        onClose={() => setCoverLetterJob(null)}
      />
      <ProUpgradeModal
        isOpen={isProModalOpen}
        onClose={() => setIsProModalOpen(false)}
      />
      <NewApplicationModal
        isOpen={isNewAppModalOpen}
        onClose={() => setIsNewAppModalOpen(false)}
        jobs={jobs}
        profileId={resume.id}
        onApplicationCreated={loadData}
      />

      {/* Toast Notifications */}
      <div
        style={{
          position: 'fixed',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 300,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          pointerEvents: 'none',
          minWidth: 280,
          maxWidth: 400,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-slideUp"
            style={{
              backgroundColor: 'var(--color-surface-container-lowest)',
              border: '1px solid var(--color-outline-variant)',
              borderLeft: `4px solid ${t.type === 'success' ? '#2e7d32' : t.type === 'error' ? 'var(--color-error)' : 'var(--color-secondary)'}`,
              borderRadius: 8,
              padding: '12px 16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              pointerEvents: 'all',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
            onClick={() => removeToast(t.id)}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontSize: 20,
                color:
                  t.type === 'success' ? '#2e7d32'
                  : t.type === 'error' ? 'var(--color-error)'
                  : 'var(--color-secondary)',
                flexShrink: 0,
                marginTop: 2,
              }}
            >
              {t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info'}
            </span>
            <div>
              <p className="text-title-md" style={{ color: 'var(--color-primary)' }}>{t.title}</p>
              {t.message && (
                <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: 2 }}>{t.message}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @media (min-width: 768px) {
          .md-main-area {
            margin-left: 260px !important;
            padding-bottom: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ padding: '32px var(--space-margin-mobile)', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <div className="animate-pulse" style={{ height: 40, width: 300, backgroundColor: 'var(--color-surface-container)', borderRadius: 8, marginBottom: 12 }} />
          <div className="animate-pulse" style={{ height: 20, width: 480, backgroundColor: 'var(--color-surface-container)', borderRadius: 6 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                height: 120,
                backgroundColor: 'var(--color-surface-container)',
                borderRadius: 12,
                border: '1px solid var(--color-outline-variant)',
              }}
            />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(1, 1fr)', gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse"
              style={{
                height: 200,
                backgroundColor: 'var(--color-surface-container)',
                borderRadius: 12,
                border: '1px solid var(--color-outline-variant)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

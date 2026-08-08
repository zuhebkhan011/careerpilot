import React, { useState, useEffect } from 'react';
import { ResumeProfile } from '../types';
import { apiService } from '../services/apiService';

interface Props {
  resume: ResumeProfile;
  onSaveResume: (updated: ResumeProfile) => void;
}

type EditMode = 'basic' | 'skills' | 'experience' | 'education' | null;

export function ProfileView({ resume, onSaveResume }: Props) {
  const [editMode, setEditMode] = useState<EditMode>(null);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [error, setError] = useState('');

  // Local editable copies
  const [basic, setBasic] = useState({
    fullName: resume.fullName || '',
    email: resume.email || '',
    phone: resume.phone || '',
    location: resume.location || '',
    targetRole: resume.targetRole || '',
    summary: resume.summary || '',
  });
  const [skillsText, setSkillsText] = useState((resume.skills || []).join(', '));
  const [experiences, setExperiences] = useState(resume.experiences || []);
  const [education, setEducation] = useState(resume.education || []);

  // Sync when resume prop changes
  useEffect(() => {
    setBasic({
      fullName: resume.fullName || '',
      email: resume.email || '',
      phone: resume.phone || '',
      location: resume.location || '',
      targetRole: resume.targetRole || '',
      summary: resume.summary || '',
    });
    setSkillsText((resume.skills || []).join(', '));
    setExperiences(resume.experiences || []);
    setEducation(resume.education || []);
  }, [resume.id]);

  const showSuccess = (msg: string) => {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(''), 3500);
  };

  const saveBasic = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/profiles/${resume.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: basic.fullName,
          email: basic.email,
          phone: basic.phone,
          location: basic.location,
          degree: basic.targetRole,
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.error?.message || 'Save failed');
      onSaveResume({ ...resume, ...basic });
      setEditMode(null);
      showSuccess('Basic info updated successfully.');
    } catch (e: any) {
      setError(e.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const saveSkills = async () => {
    const skills = skillsText.split(',').map((s) => s.trim()).filter(Boolean);
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/profiles/${resume.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.error?.message || 'Save failed');
      onSaveResume({ ...resume, skills });
      setEditMode(null);
      showSuccess('Skills updated successfully.');
    } catch (e: any) {
      setError(e.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const saveExperience = async () => {
    setSaving(true);
    setError('');
    try {
      const expPayload = experiences.map((e) => ({
        title: e.title,
        company: e.company,
        duration: e.period,
        description: e.description,
      }));
      const res = await fetch(`/api/profiles/${resume.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experience: expPayload }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.error?.message || 'Save failed');
      onSaveResume({ ...resume, experiences });
      setEditMode(null);
      showSuccess('Experience updated successfully.');
    } catch (e: any) {
      setError(e.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const saveEducation = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/profiles/${resume.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          college: education[0]?.institution || '',
          degree: education[0]?.degree || '',
          graduation_year: education[0]?.year || '',
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body.error?.message || 'Save failed');
      onSaveResume({ ...resume, education });
      setEditMode(null);
      showSuccess('Education updated successfully.');
    } catch (e: any) {
      setError(e.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const initials = (basic.fullName || 'U').split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

  return (
    <div
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '32px var(--space-margin-mobile)',
        paddingBottom: 100,
        fontFamily: 'Manrope, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        gap: 24,
      }}
      className="md-profile-pad animate-fadeIn"
    >
      {/* Page title */}
      <div>
        <h1 className="text-headline-lg" style={{ color: 'var(--color-primary)' }}>My Profile</h1>
        <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)', marginTop: 4 }}>
          Your career profile synced with Supabase. Changes persist across sessions.
        </p>
      </div>

      {/* Success banner */}
      {savedMsg && (
        <div
          className="animate-slideUp"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            backgroundColor: '#e8f5e9',
            border: '1px solid #a5d6a7',
            borderRadius: 8,
            color: '#2e7d32',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20, fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <span className="text-body-sm" style={{ color: '#1b5e20', fontWeight: 600 }}>{savedMsg}</span>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            backgroundColor: 'var(--color-error-container)',
            border: '1px solid rgba(186,26,26,0.2)',
            borderRadius: 8,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-error)' }}>error</span>
          <span className="text-body-sm" style={{ color: 'var(--color-on-error-container)' }}>{error}</span>
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
          </button>
        </div>
      )}

      {/* Avatar + Basic Info */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-outline-variant)',
          borderRadius: 12,
          padding: 24,
        }}
        className="card-hover"
      >
        {editMode === 'basic' ? (
          <>
            <h2 className="text-title-lg" style={{ color: 'var(--color-primary)', marginBottom: 20 }}>Edit Basic Info</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="profile-form-grid">
              {[
                { label: 'Full Name', key: 'fullName', icon: 'person', type: 'text' },
                { label: 'Email', key: 'email', icon: 'mail', type: 'email' },
                { label: 'Phone', key: 'phone', icon: 'call', type: 'tel' },
                { label: 'Location', key: 'location', icon: 'location_on', type: 'text' },
                { label: 'Target Role', key: 'targetRole', icon: 'work', type: 'text' },
              ].map((f) => (
                <div key={f.key} style={{ gridColumn: f.key === 'summary' ? '1 / -1' : undefined }}>
                  <label className="text-label-md" style={{ display: 'block', color: 'var(--color-on-surface-variant)', marginBottom: 6, textTransform: 'uppercase' }}>
                    {f.label}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span className="material-symbols-outlined" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--color-outline)', pointerEvents: 'none' }}>
                      {f.icon}
                    </span>
                    <input
                      type={f.type}
                      value={(basic as any)[f.key]}
                      onChange={(e) => setBasic((b) => ({ ...b, [f.key]: e.target.value }))}
                      style={{
                        width: '100%',
                        paddingLeft: 32,
                        paddingRight: 12,
                        paddingTop: 10,
                        paddingBottom: 10,
                        backgroundColor: 'var(--color-surface-container-low)',
                        border: '1px solid var(--color-outline-variant)',
                        borderRadius: 8,
                        fontSize: 15,
                        fontFamily: 'Manrope, sans-serif',
                        color: 'var(--color-on-surface)',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="text-label-md" style={{ display: 'block', color: 'var(--color-on-surface-variant)', marginBottom: 6, textTransform: 'uppercase' }}>
                  Professional Summary
                </label>
                <textarea
                  value={basic.summary}
                  onChange={(e) => setBasic((b) => ({ ...b, summary: e.target.value }))}
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--color-surface-container-low)',
                    border: '1px solid var(--color-outline-variant)',
                    borderRadius: 8,
                    fontSize: 15,
                    fontFamily: 'Manrope, sans-serif',
                    color: 'var(--color-on-surface)',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn-primary" disabled={saving} onClick={saveBasic}
                style={{ padding: '10px 20px', borderRadius: 8, fontSize: 15, fontWeight: 600, opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                {saving ? 'Saving...' : <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span> Save Changes</>}
              </button>
              <button onClick={() => { setEditMode(null); setError(''); }}
                style={{ padding: '10px 20px', borderRadius: 8, fontSize: 15, fontWeight: 600, background: 'none', border: '1px solid var(--color-outline-variant)', cursor: 'pointer', color: 'var(--color-on-surface)' }}>
                Cancel
              </button>
            </div>
            <style>{`.profile-form-grid { grid-template-columns: 1fr; } @media (min-width: 600px) { .profile-form-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
          </>
        ) : (
          <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--color-primary) 0%, #002f66 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', fontSize: 24, fontWeight: 700, flexShrink: 0,
            }}>
              {initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <h2 className="text-headline-md" style={{ color: 'var(--color-primary)', marginBottom: 4 }}>
                    {basic.fullName || 'Your Name'}
                  </h2>
                  <p className="text-body-md" style={{ color: 'var(--color-on-surface-variant)' }}>{basic.targetRole}</p>
                </div>
                <button
                  onClick={() => setEditMode('basic')}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--color-outline-variant)', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--color-on-surface)', fontFamily: 'Manrope, sans-serif' }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>edit</span>
                  Edit
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px 24px', marginTop: 16 }} className="info-grid">
                {[
                  { icon: 'mail', value: basic.email },
                  { icon: 'call', value: basic.phone },
                  { icon: 'location_on', value: basic.location },
                ].map((item) => (
                  <div key={item.icon} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--color-on-surface-variant)', flexShrink: 0 }}>{item.icon}</span>
                    <span className="text-body-sm" style={{ color: 'var(--color-on-surface)' }}>{item.value || '—'}</span>
                  </div>
                ))}
              </div>
              {basic.summary && (
                <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginTop: 12, lineHeight: 1.6 }}>
                  {basic.summary}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Skills */}
      <ProfileSection
        title="Skills"
        icon="code"
        onEdit={() => setEditMode('skills')}
        editing={editMode === 'skills'}
        onCancel={() => { setEditMode(null); setError(''); }}
        onSave={saveSkills}
        saving={saving}
      >
        {editMode === 'skills' ? (
          <div>
            <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 8 }}>
              Enter skills separated by commas
            </p>
            <textarea
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              placeholder="JavaScript, TypeScript, React, Node.js..."
              rows={4}
              style={{
                width: '100%',
                padding: 12,
                borderRadius: 8,
                border: '1px solid var(--color-outline-variant)',
                backgroundColor: 'var(--color-surface-container-low)',
                fontSize: 15,
                fontFamily: 'Manrope, sans-serif',
                color: 'var(--color-on-surface)',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box',
              }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {(resume.skills || []).length === 0 ? (
              <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>No skills listed. Click Edit to add.</p>
            ) : (
              resume.skills.map((s) => (
                <span key={s} style={{ padding: '4px 12px', borderRadius: 9999, border: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-low)', fontSize: 13, fontWeight: 600, color: 'var(--color-primary)' }}>
                  {s}
                </span>
              ))
            )}
          </div>
        )}
      </ProfileSection>

      {/* Experience */}
      <ProfileSection
        title="Work Experience"
        icon="work"
        onEdit={() => setEditMode('experience')}
        editing={editMode === 'experience'}
        onCancel={() => { setEditMode(null); setError(''); }}
        onSave={saveExperience}
        saving={saving}
      >
        {editMode === 'experience' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {experiences.map((exp, idx) => (
              <div key={exp.id} style={{ padding: 16, borderRadius: 8, border: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-low)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="exp-form-grid">
                  {[
                    { label: 'Job Title', field: 'title' as const },
                    { label: 'Company', field: 'company' as const },
                    { label: 'Period', field: 'period' as const },
                  ].map((f) => (
                    <div key={f.field}>
                      <label className="text-label-md" style={{ display: 'block', color: 'var(--color-on-surface-variant)', marginBottom: 4, textTransform: 'uppercase', fontSize: 10 }}>{f.label}</label>
                      <input
                        value={(exp as any)[f.field]}
                        onChange={(e) => {
                          const upd = [...experiences];
                          (upd[idx] as any)[f.field] = e.target.value;
                          setExperiences(upd);
                        }}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-lowest)', fontSize: 14, fontFamily: 'Manrope, sans-serif', color: 'var(--color-on-surface)', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label className="text-label-md" style={{ display: 'block', color: 'var(--color-on-surface-variant)', marginBottom: 4, textTransform: 'uppercase', fontSize: 10 }}>Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => {
                        const upd = [...experiences];
                        upd[idx].description = e.target.value;
                        setExperiences(upd);
                      }}
                      rows={2}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-lowest)', fontSize: 14, fontFamily: 'Manrope, sans-serif', color: 'var(--color-on-surface)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => setExperiences(experiences.filter((_, i) => i !== idx))}
                  style={{ alignSelf: 'flex-end', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', fontSize: 12, fontFamily: 'Manrope, sans-serif', display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>delete</span>Remove
                </button>
              </div>
            ))}
            <button
              onClick={() => setExperiences([...experiences, { id: `exp-${Date.now()}`, title: '', company: '', period: '', description: '' }])}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 8, border: '1px dashed var(--color-outline-variant)', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--color-on-surface-variant)', fontFamily: 'Manrope, sans-serif' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>Add Experience
            </button>
            <style>{`.exp-form-grid { grid-template-columns: 1fr; } @media (min-width: 500px) { .exp-form-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {(resume.experiences || []).length === 0 ? (
              <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>No experience listed. Click Edit to add.</p>
            ) : (
              resume.experiences.map((exp) => (
                <div key={exp.id} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'var(--color-surface-container)', border: '1px solid var(--color-outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-on-surface-variant)' }}>business</span>
                  </div>
                  <div>
                    <p className="text-title-md" style={{ color: 'var(--color-primary)', marginBottom: 2 }}>{exp.title}</p>
                    <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 4 }}>{exp.company} · {exp.period}</p>
                    {exp.description && <p className="text-body-sm" style={{ color: 'var(--color-on-surface)' }}>{exp.description}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </ProfileSection>

      {/* Education */}
      <ProfileSection
        title="Education"
        icon="school"
        onEdit={() => setEditMode('education')}
        editing={editMode === 'education'}
        onCancel={() => { setEditMode(null); setError(''); }}
        onSave={saveEducation}
        saving={saving}
      >
        {editMode === 'education' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {education.map((edu, idx) => (
              <div key={edu.id} style={{ padding: 16, borderRadius: 8, border: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-low)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }} className="edu-form-grid">
                {[
                  { label: 'Degree', field: 'degree' as const },
                  { label: 'Institution', field: 'institution' as const },
                  { label: 'Graduation Year', field: 'year' as const },
                ].map((f) => (
                  <div key={f.field}>
                    <label className="text-label-md" style={{ display: 'block', color: 'var(--color-on-surface-variant)', marginBottom: 4, textTransform: 'uppercase', fontSize: 10 }}>{f.label}</label>
                    <input
                      value={(edu as any)[f.field]}
                      onChange={(e) => {
                        const upd = [...education];
                        (upd[idx] as any)[f.field] = e.target.value;
                        setEducation(upd);
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container-lowest)', fontSize: 14, fontFamily: 'Manrope, sans-serif', color: 'var(--color-on-surface)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>
                ))}
                <style>{`.edu-form-grid { grid-template-columns: 1fr; } @media (min-width: 500px) { .edu-form-grid { grid-template-columns: 1fr 1fr !important; } }`}</style>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(resume.education || []).length === 0 ? (
              <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>No education listed.</p>
            ) : (
              resume.education.map((edu) => (
                <div key={edu.id} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: 'var(--color-surface-container)', border: '1px solid var(--color-outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-on-surface-variant)' }}>school</span>
                  </div>
                  <div>
                    <p className="text-title-md" style={{ color: 'var(--color-primary)', marginBottom: 2 }}>{edu.degree}</p>
                    <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)' }}>{edu.institution} · {edu.year}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </ProfileSection>

      {/* Certifications, Projects (read-only from profile) */}
      {((resume.certifications && resume.certifications.length > 0) || (resume.projects && resume.projects.length > 0)) && (
        <div style={{ backgroundColor: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: 12, padding: 24 }} className="card-hover">
          {resume.certifications && resume.certifications.length > 0 && (
            <div style={{ marginBottom: resume.projects && resume.projects.length > 0 ? 20 : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-on-surface-variant)' }}>verified</span>
                <h3 className="text-title-md" style={{ color: 'var(--color-primary)' }}>Certifications</h3>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {resume.certifications.map((c, i) => (
                  <span key={i} style={{ padding: '4px 12px', borderRadius: 9999, border: '1px solid var(--color-outline-variant)', backgroundColor: 'var(--color-surface-container)', fontSize: 13, fontWeight: 500, color: 'var(--color-on-surface)' }}>{c}</span>
                ))}
              </div>
            </div>
          )}
          {resume.projects && resume.projects.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-on-surface-variant)' }}>folder_open</span>
                <h3 className="text-title-md" style={{ color: 'var(--color-primary)' }}>Projects</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {resume.projects.map((p, i) => (
                  <div key={i} style={{ padding: 12, borderRadius: 8, backgroundColor: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)' }}>
                    <p className="text-title-md" style={{ color: 'var(--color-primary)', marginBottom: 4 }}>{p.title}</p>
                    {p.description && <p className="text-body-sm" style={{ color: 'var(--color-on-surface-variant)', marginBottom: 6 }}>{p.description}</p>}
                    {p.tech_stack && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {p.tech_stack.map((t) => (
                          <span key={t} style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-secondary)', backgroundColor: 'var(--color-secondary-fixed)', padding: '2px 8px', borderRadius: 4 }}>{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .md-profile-pad { padding: 32px 40px 100px !important; }
          .info-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}

// Reusable section wrapper
function ProfileSection({
  title, icon, onEdit, editing, onCancel, onSave, saving, children,
}: {
  title: string; icon: string; onEdit: () => void; editing: boolean;
  onCancel: () => void; onSave: () => void; saving: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-surface-container-lowest)',
        border: '1px solid var(--color-outline-variant)',
        borderRadius: 12,
        padding: 24,
      }}
      className="card-hover"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'var(--color-on-surface-variant)' }}>{icon}</span>
          <h2 className="text-title-lg" style={{ color: 'var(--color-primary)' }}>{title}</h2>
        </div>
        {!editing && (
          <button
            onClick={onEdit}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid var(--color-outline-variant)', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: 'var(--color-on-surface)', fontFamily: 'Manrope, sans-serif' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>edit</span>Edit
          </button>
        )}
      </div>

      {children}

      {editing && (
        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button
            className="btn-primary"
            disabled={saving}
            onClick={onSave}
            style={{ padding: '10px 20px', borderRadius: 8, fontSize: 15, fontWeight: 600, opacity: saving ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {saving ? 'Saving...' : <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>save</span>Save Changes</>}
          </button>
          <button
            onClick={onCancel}
            style={{ padding: '10px 20px', borderRadius: 8, fontSize: 15, fontWeight: 600, background: 'none', border: '1px solid var(--color-outline-variant)', cursor: 'pointer', color: 'var(--color-on-surface)', fontFamily: 'Manrope, sans-serif' }}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

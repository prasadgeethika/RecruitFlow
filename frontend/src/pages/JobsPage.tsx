import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';

interface Job {
  id: number;
  title: string;
  description: string;
  skills: string; // Change to string if your backend returns a single string
  location: string;
  experienceRequired: number;
  recruiterId: number;
  status: string;
}

const SkillIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
);
const LocationIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" />
    </svg>
);
const ExperienceIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [skill, setSkill] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');

  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [busyJobId, setBusyJobId] = useState<number | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);
  const [openApplyJobId, setOpenApplyJobId] = useState<number | null>(null);
  const [coverLetterDraft, setCoverLetterDraft] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { userId, role } = useAuth();

  const search = async (
      searchSkill = skill,
      searchLocation = location,
      searchExperience = experience
  ) => {
    setLoading(true);
    setError('');
    setMessage('');

    const params: Record<string, string> = {};
    if (searchSkill) params.skill = searchSkill;
    if (searchLocation) params.location = searchLocation;
    if (searchExperience) params.experience = searchExperience;

    try {
      const response = await api.get<Job[]>('/jobs/search', { params });
      setJobs(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void search();
    void loadAppliedJobs();
  }, []);

  const loadAppliedJobs = async () => {
    if (!userId || role !== 'CANDIDATE') return;

    try {
      const response = await api.get<{ jobId: number }[]>(`/applications/candidate/${userId}`);
      setAppliedJobIds(response.data.map((application) => application.jobId));
    } catch {
      setAppliedJobIds([]);
    }
  };

  const apply = async (job: Job, coverLetter: string) => {
    if (userId === null) {
      setError('Please login again.');
      return;
    }

    if (appliedJobIds.includes(job.id)) {
      setError(`You already applied for "${job.title}".`);
      return;
    }

    setApplyingId(job.id);
    setError('');
    setMessage('');

    try {
      await api.post('/applications', {
        candidateId: userId,
        jobId: job.id,
        coverLetter,
      });

      setAppliedJobIds((current) => [...current, job.id]);
      setMessage(`Successfully applied for "${job.title}".`);
      setOpenApplyJobId(null);
      setCoverLetterDraft('');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      if (errorMessage.toLowerCase().includes('already')) {
        setError(`You already applied for "${job.title}".`);
      } else {
        setError(errorMessage);
      }
    } finally {
      setApplyingId(null);
    }
  };

  const hasActiveFilters = Boolean(skill || location || experience);

  const clearFilters = async () => {
    setSkill('');
    setLocation('');
    setExperience('');

    await search('', '', '');
  };

  const toggleJobStatus = async (job: Job) => {
    setBusyJobId(job.id);
    setError('');
    setMessage('');

    const action = job.status === 'OPEN' ? 'close' : 'open';

    try {
      await api.put(`/jobs/${job.id}/${action}`);
      setMessage(
          action === 'open'
              ? `"${job.title}" is now open to candidates.`
              : `"${job.title}" has been closed.`
      );
      await search();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusyJobId(null);
    }
  };

  return (
      <div className="page">
        <div className="card">

          <div className="page-header">
            <div>
              <h3>Search Jobs</h3>
              <p className="job-subtitle" style={{ margin: 0 }}>
                {loading ? 'Searching…' : `${jobs.length} job${jobs.length === 1 ? '' : 's'} found`}
              </p>
            </div>
          </div>

          <div className="job-search-bar">
            <div className="job-search-field">
              <SkillIcon />
              <input
                  placeholder="Skill, e.g. Java, React"
                  value={skill}
                  onChange={(e) => setSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void search()}
              />
            </div>

            <span className="job-search-divider" />

            <div className="job-search-field">
              <LocationIcon />
              <input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void search()}
              />
            </div>

            <span className="job-search-divider" />

            <div className="job-search-field">
              <ExperienceIcon />
              <input
                  placeholder="Min. experience (years)"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void search()}
              />
            </div>

            <button
                className="job-search-submit"
                disabled={loading}
                onClick={() => void search()}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {hasActiveFilters && (
              <button type="button" className="link-clear" onClick={() => void clearFilters()}>
                Clear filters
              </button>
          )}

          {error && (
              <p className="error">
                {error}
              </p>
          )}

          {message && (
              <p className="success">
                {message}
              </p>
          )}

          {!loading && jobs.length === 0 && (
              <div className="empty-state">
                No jobs found matching your search.
              </div>
          )}

          <div className="job-list">

            {jobs.map((job) => {
              const alreadyApplied = appliedJobIds.includes(job.id);
              const statusKey = job.status?.toLowerCase() === 'open'
                  ? 'open'
                  : job.status?.toLowerCase() === 'closed'
                      ? 'closed'
                      : 'draft';

              return (
                  <div key={job.id} className="job-card" data-status={statusKey}>
                    <div className="job-card-header">
                      <div>
                        <h3>{job.title}</h3>
                        <div className="job-meta-row">
                          <span>{job.location} • {job.experienceRequired}+ Years</span>
                          <span className="job-type">Full-time</span>
                        </div>
                      </div>
                      <span className={`status-pill status-pill--${statusKey}`}>
                      <span className="status-dot" />
                        {job.status}
                    </span>
                    </div>

                    <p className="job-description">{job.description}</p>

                    <div className="skill-row">
                      {job.skills.split(',').map((skillItem) => (
                          <span key={skillItem.trim()} className="skill-chip">{skillItem.trim()}</span>
                      ))}
                    </div>

                    {openApplyJobId === job.id && (
                        <div className="field apply-form">
                          <label className="field-label-text" htmlFor={`cover-letter-${job.id}`}>
                            Cover letter (optional)
                          </label>
                          <textarea
                              id={`cover-letter-${job.id}`}
                              placeholder="Tell the recruiter why you're a good fit for this role"
                              value={coverLetterDraft}
                              onChange={(e) => setCoverLetterDraft(e.target.value)}
                          />
                          <div className="apply-form-actions">
                            <button
                                type="button"
                                disabled={applyingId === job.id}
                                onClick={() => void apply(job, coverLetterDraft)}
                            >
                              {applyingId === job.id ? 'Submitting...' : 'Submit Application'}
                            </button>
                            <button
                                type="button"
                                className="secondary"
                                disabled={applyingId === job.id}
                                onClick={() => {
                                  setOpenApplyJobId(null);
                                  setCoverLetterDraft('');
                                }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                    )}

                    <div className="job-card-footer">
                      <span className="job-posted">Posted recently</span>
                      <div className="action-group">
                        {role === 'CANDIDATE' && openApplyJobId !== job.id && (
                            <button
                                disabled={alreadyApplied || applyingId === job.id}
                                onClick={() => {
                                  setOpenApplyJobId(job.id);
                                  setCoverLetterDraft('');
                                }}
                            >
                              {alreadyApplied ? 'Applied' : 'Apply'}
                            </button>
                        )}
                        {role === 'RECRUITER' && job.recruiterId === userId && (
                            <button
                                type="button"
                                disabled={busyJobId === job.id}
                                onClick={() => void toggleJobStatus(job)}
                            >
                              {busyJobId === job.id
                                  ? 'Updating...'
                                  : job.status === 'OPEN'
                                      ? 'Close'
                                      : 'Publish'}
                            </button>
                        )}
                      </div>
                    </div>
                  </div>
              );
            })}

          </div>

        </div>
      </div>
  );
}

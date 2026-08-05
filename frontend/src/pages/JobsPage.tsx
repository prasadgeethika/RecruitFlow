import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [skill, setSkill] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');

  const [loading, setLoading] = useState(false);
  const [applyingId, setApplyingId] = useState<number | null>(null);
  const [busyJobId, setBusyJobId] = useState<number | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<number[]>([]);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { userId, role } = useAuth();
  const navigate = useNavigate();

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

  const apply = async (job: Job) => {
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
        coverLetter: '',
      });

      setAppliedJobIds((current) => [...current, job.id]);
      setMessage(`Successfully applied for "${job.title}".`);
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

          <h3>Search Jobs</h3>

          <div className="filters">
            <input
                placeholder="Skill"
                value={skill}
                onChange={(e) => setSkill(e.target.value)}
            />

            <input
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
            />

            <input
                placeholder="Experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
            />

            <button
                disabled={loading}
                onClick={() => void search()}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>

            <button
                disabled={loading}
                onClick={() => void clearFilters()}
            >
              Clear
            </button>
          </div>

          {loading && <p>Loading jobs...</p>}

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
              <p style={{ textAlign: 'center' }}>
                No jobs found matching your search.
              </p>
          )}

          <div className="job-list">

            {jobs.map((job) => {
              const alreadyApplied = appliedJobIds.includes(job.id);
              const statusClass = job.status?.toLowerCase() === 'open'
                ? 'status-open'
                : job.status?.toLowerCase() === 'closed'
                  ? 'status-closed'
                  : 'status-draft';

              return (
                <div key={job.id} className="job-card">
                  <div className="job-card-header">
                    <div>
                      <h3>{job.title}</h3>
                      <div className="job-meta-row">
                        <span>{job.location} • {job.experienceRequired}+ Years</span>
                        <span className="job-type">Full-time</span>
                      </div>
                    </div>
                    <span className={`status ${statusClass}`}>{job.status}</span>
                  </div>

                  <p className="job-description">{job.description}</p>

                  <div className="skill-row">
                    {job.skills.split(',').map((skillItem) => (
                      <span key={skillItem.trim()} className="skill-chip">{skillItem.trim()}</span>
                    ))}
                  </div>

                  <div className="job-card-footer">
                    <span className="job-posted">Posted recently</span>
                    <div className="action-group">
                      {role === 'CANDIDATE' && (
                        <button
                          disabled={alreadyApplied || applyingId === job.id}
                          onClick={() => void apply(job)}
                        >
                          {alreadyApplied
                            ? 'Applied'
                            : applyingId === job.id
                              ? 'Applying...'
                              : 'Apply'}
                        </button>
                      )}
                      {role === 'RECRUITER' && job.recruiterId === userId && (
                        <>
                          <button
                            type="button"
                            className="secondary"
                            onClick={() => navigate(`/edit-job/${job.id}`, { state: job })}
                          >
                            Edit
                          </button>
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
                        </>
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
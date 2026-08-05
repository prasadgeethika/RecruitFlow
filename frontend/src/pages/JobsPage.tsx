import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

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
  }, []);

  const apply = async (job: Job) => {
    if (userId === null) {
      setError('Please login again.');
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

      setMessage(`Successfully applied for "${job.title}".`);
    } catch (err) {
      setError(getErrorMessage(err));
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

  return (
      <div className="page">
        <div className="card">

          <Navbar />

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

            {jobs.map((job) => (
                <div key={job.id} className="job-card">

                  <h3>{job.title}</h3>

                  <p>{job.description}</p>

                  <p>
                    <strong>Skills:</strong> {job.skills}
                  </p>

                  <p>
                    <strong>Location:</strong> {job.location}
                  </p>

                  <p>
                    <strong>Experience:</strong> {job.experienceRequired}+ years
                  </p>

                  <p>
                    <strong>Status:</strong> {job.status}
                  </p>

                  {role === 'CANDIDATE' && (
                      <button
                          disabled={applyingId === job.id}
                          onClick={() => void apply(job)}
                      >
                        {applyingId === job.id ? 'Applying...' : 'Apply'}
                      </button>
                  )}

                </div>
            ))}

          </div>

        </div>
      </div>
  );
}
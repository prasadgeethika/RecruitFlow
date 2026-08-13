import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import AuthNavbar from '../components/AuthNavbar';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CANDIDATE' | 'RECRUITER'>('CANDIDATE');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Enter an email and password to create your account.');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      return;
    }

    setSubmitting(true);

    try {
      await api.post('/auth/register', { email, password, role });
      navigate('/login');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <>
        <AuthNavbar current="register" />
        <div className="page auth-page">
          <div className="card">
            <h2>Create your account</h2>
            <p className="auth-subtitle">Join as a candidate to apply for jobs, or a recruiter to post them.</p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label className="field-label-text" htmlFor="register-email">Email</label>
                <input
                    id="register-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="field">
                <label className="field-label-text" htmlFor="register-password">Password</label>
                <input
                    id="register-password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <p className="field-hint">Use at least 6 characters.</p>
              </div>

              <div className="field">
                <label className="field-label-text" htmlFor="register-role">I am a</label>
                <select
                    id="register-role"
                    value={role}
                    onChange={(event) => setRole(event.target.value as 'CANDIDATE' | 'RECRUITER')}
                >
                  <option value="CANDIDATE">Candidate — looking for a job</option>
                  <option value="RECRUITER">Recruiter — hiring for a company</option>
                </select>
              </div>

              <button type="submit" disabled={submitting}>
                {submitting ? 'Creating account...' : 'Register'}
              </button>
            </form>

            {error ? <p className="error">{error}</p> : null}

            <p className="link-row">
              <Link to="/login">Already have an account? Login</Link>
            </p>
          </div>
        </div>
      </>
  );
}

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AuthNavbar from '../components/AuthNavbar';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Enter your email and password to continue.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data?.token;

      if (!token) {
        throw new Error('No token returned by the server');
      }

      login(token);
      navigate('/dashboard/jobs');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <>
        <AuthNavbar current="login" />
        <div className="page auth-page">
          <div className="card">
            <h2>Welcome back</h2>
            <p className="auth-subtitle">Log in to manage your jobs, applications, and interviews.</p>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="field">
                <label className="field-label-text" htmlFor="login-email">Email</label>
                <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="field">
                <label className="field-label-text" htmlFor="login-password">Password</label>
                <input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <button type="submit" disabled={submitting}>
                {submitting ? 'Logging in...' : 'Login'}
              </button>
            </form>

            {error ? <p className="error">{error}</p> : null}

            <p className="link-row">
              <Link to="/register">Need an account? Register</Link>
            </p>
          </div>
        </div>
      </>
  );
}

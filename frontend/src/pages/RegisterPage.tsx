import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CANDIDATE' | 'RECRUITER'>('CANDIDATE');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      await api.post('/auth/register', { email, password, role });
      navigate('/login');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="page auth-page">
      <div className="card">
        <h2>Register</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" />
          <select value={role} onChange={(event) => setRole(event.target.value as 'CANDIDATE' | 'RECRUITER')}>
            <option value="CANDIDATE">Candidate</option>
            <option value="RECRUITER">Recruiter</option>
          </select>
          <button type="submit">Register</button>
        </form>
        {error ? <p className="error">{error}</p> : null}
        <p className="link-row">
          <Link to="/login">Already have an account? Login</Link>
        </p>
      </div>
    </div>
  );
}
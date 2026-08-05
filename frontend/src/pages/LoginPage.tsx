import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    try {
      const response = await api.post('/auth/login', { email, password });
      const token = response.data?.token;

      if (!token) {
        throw new Error('No token returned by the server');
      }

      login(token);
      navigate('/jobs');
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="page auth-page">
      <div className="card">
        <h2>Login</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email" />
          <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Password" />
          <button type="submit">Login</button>
        </form>
        {error ? <p className="error">{error}</p> : null}
        <p className="link-row">
          <Link to="/register">Need an account? Register</Link>
        </p>
      </div>
    </div>
  );
}
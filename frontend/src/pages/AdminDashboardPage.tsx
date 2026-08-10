import { useEffect, useState } from 'react';
import api, { getErrorMessage } from '../api/axios';

interface AdminUser {
    id: number;
    email: string;
    role: string;
    enabled: boolean;
}

interface AdminJob {
    id: number;
    title: string;
    recruiterId: number;
    location: string;
    status: 'DRAFT' | 'OPEN' | 'CLOSED';
}

type Tab = 'users' | 'jobs';

export default function AdminDashboardPage() {
    const [tab, setTab] = useState<Tab>('users');

    const [users, setUsers] = useState<AdminUser[]>([]);
    const [jobs, setJobs] = useState<AdminJob[]>([]);
    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);

    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const loadUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get<AdminUser[]>('/auth/admin/users');
            setUsers(res.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const loadJobs = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get<AdminJob[]>('/jobs/admin/all');
            setJobs(res.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (tab === 'users') void loadUsers();
        if (tab === 'jobs') void loadJobs();
    }, [tab]);

    const toggleUser = async (user: AdminUser) => {
        setBusyId(user.id);
        setError('');
        setMessage('');
        const action = user.enabled ? 'suspend' : 'reactivate';
        try {
            await api.put(`/auth/admin/users/${user.id}/${action}`);
            setMessage(`${user.email} ${action === 'suspend' ? 'suspended' : 'reactivated'}.`);
            await loadUsers();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setBusyId(null);
        }
    };

    const forceCloseJob = async (job: AdminJob) => {
        setBusyId(job.id);
        setError('');
        setMessage('');
        try {
            await api.put(`/jobs/admin/${job.id}/force-close`);
            setMessage(`"${job.title}" was force-closed.`);
            await loadJobs();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setBusyId(null);
        }
    };

    const userCounts = users.reduce(
        (acc, u) => {
            acc.total += 1;
            if (!u.enabled) acc.suspended += 1;
            return acc;
        },
        { total: 0, suspended: 0 }
    );

    const jobCounts = jobs.reduce(
        (acc, j) => {
            acc.total += 1;
            if (j.status === 'OPEN') acc.open += 1;
            return acc;
        },
        { total: 0, open: 0 }
    );

    return (
        <div className="page">
            <div className="card">
                <div className="page-header">
                    <div>
                        <h3>Admin Dashboard</h3>
                        <p className="job-subtitle" style={{ margin: 0 }}>
                            Platform-wide user and job oversight.
                        </p>
                    </div>
                </div>

                <div className="admin-stat-row">
                    <div className="admin-stat">
                        <span className="admin-stat-value">{userCounts.total}</span>
                        <span className="admin-stat-label">Total users</span>
                    </div>
                    <div className="admin-stat">
                        <span className="admin-stat-value">{userCounts.suspended}</span>
                        <span className="admin-stat-label">Suspended</span>
                    </div>
                    <div className="admin-stat">
                        <span className="admin-stat-value">{jobCounts.total}</span>
                        <span className="admin-stat-label">Total jobs</span>
                    </div>
                    <div className="admin-stat">
                        <span className="admin-stat-value">{jobCounts.open}</span>
                        <span className="admin-stat-label">Open jobs</span>
                    </div>
                </div>

                <div className="admin-tabs">
                    <button
                        className={tab === 'users' ? 'admin-tab active' : 'admin-tab'}
                        onClick={() => setTab('users')}
                    >
                        Users
                    </button>
                    <button
                        className={tab === 'jobs' ? 'admin-tab active' : 'admin-tab'}
                        onClick={() => setTab('jobs')}
                    >
                        Jobs
                    </button>
                </div>

                {error && <p className="error">{error}</p>}
                {message && <p className="success">{message}</p>}
                {loading && <p className="job-subtitle">Loading…</p>}

                {!loading && tab === 'users' && (
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th />
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>
                    <span className={`status-pill status-pill--${user.enabled ? 'open' : 'closed'}`}>
                      <span className="status-dot" />
                        {user.enabled ? 'Active' : 'Suspended'}
                    </span>
                                </td>
                                <td>
                                    <button
                                        className="secondary"
                                        disabled={busyId === user.id}
                                        onClick={() => void toggleUser(user)}
                                    >
                                        {busyId === user.id ? 'Updating...' : user.enabled ? 'Suspend' : 'Reactivate'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}

                {!loading && tab === 'jobs' && (
                    <table className="admin-table">
                        <thead>
                        <tr>
                            <th>Title</th>
                            <th>Location</th>
                            <th>Recruiter ID</th>
                            <th>Status</th>
                            <th />
                        </tr>
                        </thead>
                        <tbody>
                        {jobs.map((job) => (
                            <tr key={job.id}>
                                <td>{job.title}</td>
                                <td>{job.location}</td>
                                <td>{job.recruiterId}</td>
                                <td>
                    <span className={`status-pill status-pill--${job.status === 'OPEN' ? 'open' : job.status === 'CLOSED' ? 'closed' : 'draft'}`}>
                      <span className="status-dot" />
                        {job.status}
                    </span>
                                </td>
                                <td>
                                    <button
                                        className="secondary"
                                        disabled={busyId === job.id || job.status === 'CLOSED'}
                                        onClick={() => void forceCloseJob(job)}
                                    >
                                        {busyId === job.id ? 'Updating...' : 'Force close'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

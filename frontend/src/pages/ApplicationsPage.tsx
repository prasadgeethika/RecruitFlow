import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { statusLabel, statusPillClass } from "../utils/status";

interface Application {
    id: number;
    candidateId: number;
    jobId: number;
    status: string;
    coverLetter: string;
    appliedAt: string;
}

interface JobInfo {
    title: string;
    location: string;
    skills: string;
    experienceRequired: number;
}

export default function ApplicationsPage() {
    const { userId } = useAuth();

    const [applications, setApplications] = useState<Application[]>([]);
    const [jobs, setJobs] = useState<Record<number, JobInfo>>({});
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadApplications = async () => {
        if (userId == null) return;

        setLoading(true);

        try {
            const response = await api.get<Application[]>(
                `/applications/candidate/${userId}`
            );

            setApplications(response.data);
            await loadJobInfo(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    // One fetch per unique job, not one per application — a candidate can
    // only apply to the same job once, but this still avoids re-fetching a
    // job that's already known from a previous load.
    const loadJobInfo = async (apps: Application[]) => {
        const idsToFetch = [...new Set(apps.map((a) => a.jobId))]
            .filter((id) => !(id in jobs));

        if (idsToFetch.length === 0) return;

        const results = await Promise.all(
            idsToFetch.map(async (jobId) => {
                try {
                    const res = await api.get<JobInfo>(`/jobs/${jobId}`);
                    return [jobId, res.data] as const;
                } catch {
                    // Job may have been removed — fall back to showing the ID.
                    return null;
                }
            })
        );

        setJobs((prev) => {
            const next = { ...prev };
            for (const entry of results) {
                if (entry) next[entry[0]] = entry[1];
            }
            return next;
        });
    };

    useEffect(() => {
        void loadApplications();
    }, [userId]);

    const withdraw = async (applicationId: number) => {
        setError("");
        setMessage("");
        setBusyId(applicationId);

        try {
            await api.put(`/applications/${applicationId}/withdraw`);

            setMessage("Application withdrawn successfully.");

            await loadApplications();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="page">
            <div className="card">

                <h2>My Applications</h2>

                {loading && <p>Loading applications...</p>}

                {error && <p className="error">{error}</p>}

                {message && <p className="success">{message}</p>}

                {!loading && applications.length === 0 && (
                    <div className="empty-state">
                        <p className="empty-state-title">No applications yet</p>
                        <p className="empty-state-hint">
                            Apply to an open position to see your applications here. <Link to="/dashboard/jobs">Browse jobs</Link>.
                        </p>
                    </div>
                )}

                <div className="job-list">

                    {applications.map((application) => {
                        const job = jobs[application.jobId];

                        return (
                            <div className="job-card" key={application.id}>

                                <div className="job-card-header">
                                    <h3>{job?.title ?? `Job #${application.jobId}`}</h3>
                                    <span className={statusPillClass(application.status)}>
                                    <span className="status-dot" />
                                        {statusLabel(application.status)}
                                </span>
                                </div>

                                {job && (
                                    <div className="job-meta-row">
                                        <span>{job.location} • {job.experienceRequired}+ Years</span>
                                    </div>
                                )}

                                {job?.skills && (
                                    <div className="skill-row">
                                        {job.skills.split(',').map((skillItem) => (
                                            <span key={skillItem.trim()} className="skill-chip">{skillItem.trim()}</span>
                                        ))}
                                    </div>
                                )}

                                {application.coverLetter && (
                                    <p><strong>Cover letter:</strong> {application.coverLetter}</p>
                                )}

                                <p>
                                    <strong>Applied:</strong>{" "}
                                    {new Date(application.appliedAt).toLocaleString()}
                                </p>

                                {application.status === "APPLIED" && (

                                    <button
                                        disabled={busyId === application.id}
                                        onClick={() => void withdraw(application.id)}
                                    >
                                        {busyId === application.id ? "Withdrawing..." : "Withdraw"}
                                    </button>

                                )}

                            </div>
                        );
                    })}

                </div>

            </div>
        </div>
    );
}

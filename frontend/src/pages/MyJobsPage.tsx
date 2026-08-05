import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface Job {
    id: number;
    title: string;
    description: string;
    skills: string;
    location: string;
    experienceRequired: number;
    status: "DRAFT" | "OPEN" | "CLOSED";
}

export default function MyJobsPage() {
    const { userId } = useAuth();
    const navigate = useNavigate();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadJobs = async () => {
        if (userId == null) return;
        setLoading(true);
        try {
            const response = await api.get<Job[]>(`/jobs/recruiter/${userId}`);
            setJobs(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadJobs();
    }, [userId]);

    const toggleStatus = async (job: Job) => {
        setBusyId(job.id);
        setError("");
        setMessage("");

        const action = job.status === "OPEN" ? "close" : "open";

        try {
            await api.put(`/jobs/${job.id}/${action}`);
            setMessage(
                action === "open"
                    ? `"${job.title}" is now live for candidates.`
                    : `"${job.title}" has been closed to new applicants.`
            );
            await loadJobs();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setBusyId(null);
        }
    };

    const statusClass = (status: Job["status"]) =>
        status === "OPEN" ? "badge badge-open" :
            status === "CLOSED" ? "badge badge-closed" : "badge badge-draft";

    return (
        <div className="page">
            <div className="card">
                <div className="page-header">
                    <h2>My Job Postings</h2>
                    <button onClick={() => navigate("/create-job")}>+ New Job</button>
                </div>

                {loading && <p>Loading your jobs...</p>}
                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}

                {!loading && jobs.length === 0 && (
                    <p className="empty-state">
                        You haven't posted any jobs yet. Click "+ New Job" to get started.
                    </p>
                )}

                <div className="job-list">
                    {jobs.map((job) => (
                        <div key={job.id} className="job-card">
                            <div className="job-card-header">
                                <h3>{job.title}</h3>
                                <span className={statusClass(job.status)}>{job.status}</span>
                            </div>

                            <p>{job.description}</p>
                            <p><strong>Skills:</strong> {job.skills}</p>
                            <p><strong>Location:</strong> {job.location}</p>
                            <p><strong>Experience:</strong> {job.experienceRequired}+ years</p>

                            <div className="actions">
                                {job.status !== "CLOSED" && (
                                    <button
                                        disabled={busyId === job.id}
                                        onClick={() => void toggleStatus(job)}
                                    >
                                        {busyId === job.id
                                            ? "Updating..."
                                            : job.status === "OPEN"
                                                ? "Close Job"
                                                : "Publish Job"}
                                    </button>
                                )}

                                {job.status === "DRAFT" && (
                                    <button
                                        className="secondary"
                                        onClick={() => navigate(`/edit-job/${job.id}`, { state: job })}
                                    >
                                        Edit
                                    </button>
                                )}

                                {job.status !== "DRAFT" && (
                                    <span className="locked-note">
                                        Locked — only draft jobs can be edited
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

interface Job {
    id: number;
    title: string;
}

interface Application {
    id: number;
    candidateId: number;
    jobId: number;
    status: string;
    coverLetter: string;
    appliedAt: string;
}

export default function RecruiterReviewPage() {
    const { userId } = useAuth();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState<number | null>(null);

    const [applications, setApplications] = useState<Application[]>([]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        loadJobs();
    }, []);

    const loadJobs = async () => {
        if (userId == null) return;

        try {
            const response = await api.get<Job[]>(`/jobs/recruiter/${userId}`);
            setJobs(response.data);

            if (response.data.length > 0) {
                setSelectedJob(response.data[0].id);
            }
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    useEffect(() => {
        if (selectedJob != null) {
            void loadApplications(selectedJob);
        }
    }, [selectedJob]);

    const loadApplications = async (jobId: number) => {
        setLoading(true);

        try {
            const response = await api.get<Application[]>(
                `/applications/job/${jobId}`
            );

            setApplications(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (
        applicationId: number,
        action: string,
        successMessage: string
    ) => {
        setError("");
        setMessage("");

        try {
            await api.put(`/applications/${applicationId}/${action}`);

            setMessage(successMessage);

            if (selectedJob) {
                await loadApplications(selectedJob);
            }
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    return (
        <div className="page">
            <div className="card">

                <Navbar />

                <h2>Review Applications</h2>

                <select
                    value={selectedJob ?? ""}
                    onChange={(e) => setSelectedJob(Number(e.target.value))}
                >
                    {jobs.map(job => (
                        <option key={job.id} value={job.id}>
                            {job.title}
                        </option>
                    ))}
                </select>

                {loading && <p>Loading applications...</p>}

                {message && <p className="success">{message}</p>}

                {error && <p className="error">{error}</p>}

                <div className="job-list">

                    {applications.map(app => (

                        <div key={app.id} className="job-card">

                            <h3>Application #{app.id}</h3>

                            <p>
                                <strong>Candidate:</strong> {app.candidateId}
                            </p>

                            <p>
                                <strong>Status:</strong> {app.status}
                            </p>

                            <p>
                                <strong>Applied:</strong>{" "}
                                {new Date(app.appliedAt).toLocaleString()}
                            </p>

                            <div className="actions">

                                {app.status === "APPLIED" && (
                                    <button
                                        onClick={() =>
                                            updateStatus(
                                                app.id,
                                                "under-review",
                                                "Moved to Under Review"
                                            )
                                        }
                                    >
                                        Under Review
                                    </button>
                                )}

                                {app.status === "UNDER_REVIEW" && (
                                    <>
                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    app.id,
                                                    "shortlist",
                                                    "Candidate shortlisted"
                                                )
                                            }
                                        >
                                            Shortlist
                                        </button>

                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    app.id,
                                                    "reject",
                                                    "Candidate rejected"
                                                )
                                            }
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}

                                {app.status === "SHORTLISTED" && (
                                    <button
                                        onClick={() =>
                                            updateStatus(
                                                app.id,
                                                "interview-scheduled",
                                                "Interview scheduled"
                                            )
                                        }
                                    >
                                        Schedule Interview
                                    </button>
                                )}

                                {app.status === "INTERVIEW_SCHEDULED" && (
                                    <button
                                        onClick={() =>
                                            updateStatus(
                                                app.id,
                                                "select",
                                                "Candidate selected"
                                            )
                                        }
                                    >
                                        Select
                                    </button>
                                )}

                                {app.status === "SELECTED" && (
                                    <button
                                        onClick={() =>
                                            updateStatus(
                                                app.id,
                                                "hire",
                                                "Candidate hired"
                                            )
                                        }
                                    >
                                        Hire
                                    </button>
                                )}

                            </div>

                        </div>

                    ))}

                </div>

            </div>
        </div>
    );
}
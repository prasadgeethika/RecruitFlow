import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { statusLabel, statusPillClass } from "../utils/status";

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

interface CandidateInfo {
    email: string;
    skills?: string;
    location?: string;
    contactNumber?: string;
    resumeUrl?: string;
}

interface Interview {
    technicalScore?: number;
    communicationScore?: number;
    comments?: string;
    scheduledAt?: string;
}

export default function RecruiterReviewPage() {
    const { userId } = useAuth();

    const navigate = useNavigate();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJob, setSelectedJob] = useState<number | null>(null);

    const [applications, setApplications] = useState<Application[]>([]);
    const [candidates, setCandidates] = useState<Record<number, CandidateInfo>>({});

    const [interviews, setInterviews] = useState<Record<number, Interview>>({});

    const [loading, setLoading] = useState(false);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        void loadJobs();
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
            await loadCandidateInfo(response.data);
            await loadInterviewInfo(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    // One fetch per unique candidate on this job, not one per application —
    // several applications can't share a candidate for the same job (duplicates
    // are blocked server-side), but this still avoids re-fetching anyone already
    // known from a previous job selection.
    const loadCandidateInfo = async (apps: Application[]) => {
        const idsToFetch = [...new Set(apps.map((a) => a.candidateId))]
            .filter((id) => !(id in candidates));

        if (idsToFetch.length === 0) return;

        const results = await Promise.all(
            idsToFetch.map(async (candidateId) => {
                try {
                    const userRes = await api.get<{ email: string }>(`/auth/users/${candidateId}`);
                    let profile: Partial<CandidateInfo> = {};
                    try {
                        const profileRes = await api.get(`/profiles/candidates/${candidateId}`);
                        profile = profileRes.data;
                    } catch {
                        // Profile is optional — a candidate may not have filled
                        // theirs out yet. Email alone is still useful to show.
                    }
                    return [candidateId, { email: userRes.data.email, ...profile }] as const;
                } catch {
                    return [candidateId, { email: `Candidate #${candidateId}` }] as const;
                }
            })
        );

        setCandidates((prev) => {
            const next = { ...prev };
            for (const [id, info] of results) {
                next[id] = info;
            }
            return next;
        });
    };

    // Only applications that have moved past scheduling actually have interview
    // data to show — no point calling the endpoint for APPLIED/UNDER_REVIEW/SHORTLISTED.
    const FEEDBACK_RELEVANT_STATUSES = ["INTERVIEW_SCHEDULED", "SELECTED", "REJECTED", "HIRED"];

    const loadInterviewInfo = async (apps: Application[]) => {
        const idsToFetch = apps
            .filter((a) => FEEDBACK_RELEVANT_STATUSES.includes(a.status))
            .map((a) => a.id)
            .filter((id) => !(id in interviews));

        if (idsToFetch.length === 0) return;

        const results = await Promise.all(
            idsToFetch.map(async (applicationId) => {
                try {
                    const res = await api.get<Interview>(`/interviews/${applicationId}`);
                    return [applicationId, res.data] as const;
                } catch {
                    // No interview record yet, or feedback not submitted — skip silently.
                    return null;
                }
            })
        );

        setInterviews((prev) => {
            const next = { ...prev };
            for (const entry of results) {
                if (entry) next[entry[0]] = entry[1];
            }
            return next;
        });
    };

    const updateStatus = async (
        applicationId: number,
        action: string,
        successMessage: string
    ) => {
        setError("");
        setMessage("");
        setBusyId(applicationId);

        try {
            await api.put(`/applications/${applicationId}/${action}`);

            setMessage(successMessage);

            if (selectedJob) {
                await loadApplications(selectedJob);
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setBusyId(null);
        }
    };

    return (
        <div className="page">
            <div className="card">

                <h2>Review Applications</h2>

                {jobs.length === 0 ? (
                    <div className="empty-state">
                        <p className="empty-state-title">No jobs yet</p>
                        <p className="empty-state-hint">
                            Create a job first and applications will appear here.
                        </p>
                    </div>
                ) : (
                    <select
                        className="job-select"
                        value={selectedJob ?? ""}
                        onChange={(e) => setSelectedJob(Number(e.target.value))}
                    >
                        {jobs.map(job => (
                            <option key={job.id} value={job.id}>
                                {job.title}
                            </option>
                        ))}
                    </select>
                )}

                {loading && <p>Loading applications...</p>}

                {message && <p className="success">{message}</p>}

                {error && <p className="error">{error}</p>}

                {jobs.length > 0 && applications.length === 0 && !loading && (
                    <div className="empty-state">
                        <p className="empty-state-title">No applications yet</p>
                        <p className="empty-state-hint">
                            Once candidates apply to this job, they'll show up here for review.
                        </p>
                    </div>
                )}

                <div className="job-list">

                    {applications.map(app => {
                        const interview = interviews[app.id];
                        const hasFeedback = interview?.technicalScore != null;
                        const isAwaitingFeedback = app.status === "INTERVIEW_SCHEDULED" && interview && !hasFeedback;

                        return (
                            <div key={app.id} className="job-card">

                                <div className="job-card-header">
                                    <h3>{candidates[app.candidateId]?.email ?? `Candidate #${app.candidateId}`}</h3>
                                    <span className={statusPillClass(app.status)}>
                                    <span className="status-dot" />
                                        {statusLabel(app.status)}
                                </span>
                                </div>

                                {candidates[app.candidateId]?.skills && (
                                    <p><strong>Skills:</strong> {candidates[app.candidateId].skills}</p>
                                )}

                                {candidates[app.candidateId]?.location && (
                                    <p><strong>Location:</strong> {candidates[app.candidateId].location}</p>
                                )}

                                {candidates[app.candidateId]?.contactNumber && (
                                    <p><strong>Contact:</strong> {candidates[app.candidateId].contactNumber}</p>
                                )}

                                {candidates[app.candidateId]?.resumeUrl && (
                                    <p>
                                        <strong>Resume:</strong>{" "}
                                        <a href={candidates[app.candidateId].resumeUrl} target="_blank" rel="noreferrer">
                                            View resume
                                        </a>
                                    </p>
                                )}

                                {app.coverLetter && (
                                    <p><strong>Cover letter:</strong> {app.coverLetter}</p>
                                )}

                                {hasFeedback && (
                                    <div className="feedback-block">
                                        <p className="feedback-block-title">Interview Feedback</p>
                                        <div className="feedback-scores">
                                            <div className="feedback-score">
                                                <span className="feedback-score-value">{interview.technicalScore}/10</span>
                                                <span className="feedback-score-label">Technical</span>
                                            </div>
                                            <div className="feedback-score">
                                                <span className="feedback-score-value">{interview.communicationScore}/10</span>
                                                <span className="feedback-score-label">Communication</span>
                                            </div>
                                        </div>
                                        {interview.comments && (
                                            <p className="feedback-comments">"{interview.comments}"</p>
                                        )}
                                    </div>
                                )}

                                {isAwaitingFeedback && (
                                    <p className="feedback-pending">
                                        Interview scheduled — feedback hasn't been submitted yet.
                                    </p>
                                )}

                                <p>
                                    <strong>Applied:</strong>{" "}
                                    {new Date(app.appliedAt).toLocaleString()}
                                </p>

                                <div className="actions">

                                    {app.status === "APPLIED" && (
                                        <button
                                            disabled={busyId === app.id}
                                            onClick={() =>
                                                void updateStatus(
                                                    app.id,
                                                    "under-review",
                                                    "Moved to Under Review"
                                                )
                                            }
                                        >
                                            {busyId === app.id ? "Updating..." : "Under Review"}
                                        </button>
                                    )}

                                    {app.status === "UNDER_REVIEW" && (
                                        <>
                                            <button
                                                disabled={busyId === app.id}
                                                onClick={() =>
                                                    void updateStatus(
                                                        app.id,
                                                        "shortlist",
                                                        "Candidate shortlisted"
                                                    )
                                                }
                                            >
                                                {busyId === app.id ? "Updating..." : "Shortlist"}
                                            </button>

                                            <button
                                                className="secondary"
                                                disabled={busyId === app.id}
                                                onClick={() =>
                                                    void updateStatus(
                                                        app.id,
                                                        "reject",
                                                        "Candidate rejected"
                                                    )
                                                }
                                            >
                                                {busyId === app.id ? "Updating..." : "Reject"}
                                            </button>
                                        </>
                                    )}

                                    {app.status === "SHORTLISTED" && (
                                        <button
                                            onClick={() =>
                                                navigate("/dashboard/schedule-interview", {
                                                    state: {
                                                        applicationId: app.id,
                                                        candidateEmail:
                                                            candidates[app.candidateId]?.email ?? `Candidate #${app.candidateId}`,
                                                        jobTitle: jobs.find((j) => j.id === app.jobId)?.title ?? "",
                                                    },
                                                })
                                            }
                                        >
                                            Schedule Interview
                                        </button>
                                    )}

                                    {app.status === "INTERVIEW_SCHEDULED" && (
                                        <button
                                            disabled={busyId === app.id}
                                            onClick={() =>
                                                void updateStatus(
                                                    app.id,
                                                    "select",
                                                    "Candidate selected"
                                                )
                                            }
                                        >
                                            {busyId === app.id ? "Updating..." : "Select"}
                                        </button>
                                    )}

                                    {app.status === "SELECTED" && (
                                        <button
                                            disabled={busyId === app.id}
                                            onClick={() =>
                                                void updateStatus(
                                                    app.id,
                                                    "hire",
                                                    "Candidate hired"
                                                )
                                            }
                                        >
                                            {busyId === app.id ? "Updating..." : "Hire"}
                                        </button>
                                    )}

                                </div>

                            </div>
                        );
                    })}

                </div>

            </div>
        </div>
    );
}

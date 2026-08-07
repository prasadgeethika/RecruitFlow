import { useEffect, useState, type FormEvent } from "react";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface Job {
    id: number;
    title: string;
}

interface Application {
    id: number;
    candidateId: number;
    jobId: number;
    status: string;
}

interface FeedbackOption {
    applicationId: number;
    label: string;
}

export default function FeedbackPage() {
    const { userId } = useAuth();

    const [applicationId, setApplicationId] = useState<number | null>(null);
    const [options, setOptions] = useState<FeedbackOption[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);

    const [technicalScore, setTechnicalScore] = useState(0);
    const [communicationScore, setCommunicationScore] = useState(0);
    const [comments, setComments] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (userId == null) return;
        void loadInterviewOptions();
    }, [userId]);

    const loadInterviewOptions = async () => {
        setLoadingOptions(true);
        setError("");

        try {
            const jobsRes = await api.get<Job[]>(`/jobs/recruiter/${userId}`);

            const perJob = await Promise.all(
                jobsRes.data.map(async (job) => {
                    const appsRes = await api.get<Application[]>(`/applications/job/${job.id}`);
                    return appsRes.data
                        .filter((a) => a.status === "INTERVIEW_SCHEDULED")
                        .map((a) => ({ ...a, jobTitle: job.title }));
                })
            );

            const scheduled = perJob.flat();

            const withNames = await Promise.all(
                scheduled.map(async (app) => {
                    let candidateLabel = `Candidate #${app.candidateId}`;
                    try {
                        const userRes = await api.get<{ email: string }>(
                            `/auth/users/${app.candidateId}`
                        );
                        candidateLabel = userRes.data.email;
                    } catch {
                        // fall back to the placeholder above
                    }
                    return {
                        applicationId: app.id,
                        label: `${candidateLabel} — ${app.jobTitle}`,
                    };
                })
            );

            setOptions(withNames);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoadingOptions(false);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (applicationId == null) {
            setError("Select which interview you're submitting feedback for.");
            return;
        }

        try {
            await api.put(`/interviews/${applicationId}/feedback`, {
                technicalScore,
                communicationScore,
                comments,
            });

            setMessage("Feedback submitted successfully.");
            setApplicationId(null);
            setTechnicalScore(0);
            setCommunicationScore(0);
            setComments("");

            // The application this was for is no longer "awaiting feedback",
            // so refresh the list rather than leaving a stale option selectable.
            void loadInterviewOptions();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    return (
        <div className="page">
            <div className="card">
                <h2>Interview Feedback</h2>

                <p className="job-subtitle">
                    Pick an interview below to submit scores and comments for it.
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {loadingOptions ? (
                        <p>Loading interviews...</p>
                    ) : options.length === 0 ? (
                        <p className="empty-state">
                            No interviews are waiting on feedback right now.
                        </p>
                    ) : (
                        <select
                            className="job-select"
                            value={applicationId ?? ""}
                            onChange={(e) => setApplicationId(Number(e.target.value))}
                        >
                            <option value="" disabled>Select an interview...</option>
                            {options.map((opt) => (
                                <option key={opt.applicationId} value={opt.applicationId}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    )}

                    <label className="field-label">
                        Technical Score
                        <input
                            type="number"
                            placeholder="Enter technical score (1-10)"
                            value={technicalScore}
                            onChange={(e) => setTechnicalScore(Number(e.target.value))}
                            min={1}
                            max={10}
                        />
                    </label>

                    <label className="field-label">
                        Communication Score
                        <input
                            type="number"
                            placeholder="Enter communication score (1-10)"
                            value={communicationScore}
                            onChange={(e) => setCommunicationScore(Number(e.target.value))}
                            min={1}
                            max={10}
                        />
                    </label>

                    <textarea
                        placeholder="Comments"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                    />

                    <button type="submit" disabled={applicationId == null}>
                        Submit Feedback
                    </button>
                </form>

                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
}
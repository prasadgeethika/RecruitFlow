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
    const [submitting, setSubmitting] = useState(false);
    const [generating, setGenerating] = useState(false);
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

    const scoresInRange = technicalScore >= 1 && technicalScore <= 10
        && communicationScore >= 1 && communicationScore <= 10;

    const generateComment = async () => {
        if (!scoresInRange) {
            setError("Enter both scores (1-10) before generating a suggested comment.");
            return;
        }

        setError("");
        setGenerating(true);

        try {
            const response = await api.post<{ comment: string }>(
                "/interviews/generate-comment",
                { technicalScore, communicationScore }
            );
            setComments(response.data.comment);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setGenerating(false);
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

        if (!scoresInRange) {
            setError("Technical and Communication scores must both be between 1 and 10.");
            return;
        }

        setSubmitting(true);

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
        } finally {
            setSubmitting(false);
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
                        <div className="empty-state">
                            <p className="empty-state-title">No interview feedback pending</p>
                            <p className="empty-state-hint">
                                Once you schedule an interview, it'll show up here once it's time to submit feedback.
                            </p>
                        </div>
                    ) : (
                        <div className="field">
                            <label className="field-label-text" htmlFor="feedback-interview">Interview</label>
                            <select
                                id="feedback-interview"
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
                        </div>
                    )}

                    <div className="field">
                        <label className="field-label-text" htmlFor="feedback-technical">
                            Technical Score <span className="field-required">*</span>
                        </label>
                        <input
                            id="feedback-technical"
                            type="number"
                            value={technicalScore}
                            onChange={(e) => setTechnicalScore(Number(e.target.value))}
                            min={1}
                            max={10}
                        />
                        <p className="field-hint">Rate the candidate's technical knowledge. Scale: 1–10.</p>
                    </div>

                    <div className="field">
                        <label className="field-label-text" htmlFor="feedback-communication">
                            Communication Score <span className="field-required">*</span>
                        </label>
                        <input
                            id="feedback-communication"
                            type="number"
                            value={communicationScore}
                            onChange={(e) => setCommunicationScore(Number(e.target.value))}
                            min={1}
                            max={10}
                        />
                        <p className="field-hint">Rate the candidate's communication and clarity. Scale: 1–10.</p>
                    </div>

                    <div className="field">
                        <div className="field-label-row">
                            <label className="field-label-text" htmlFor="feedback-comments">Comments</label>
                            <button
                                type="button"
                                className="secondary generate-btn"
                                disabled={generating || !scoresInRange}
                                onClick={() => void generateComment()}
                            >
                                {generating ? "Generating..." : "✨ Suggest comment"}
                            </button>
                        </div>
                        <textarea
                            id="feedback-comments"
                            placeholder="Additional observations about the candidate's performance"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                        />
                        <p className="field-hint">
                            Enter both scores above to enable suggestions. The AI only sees the scores, not
                            what actually happened in the interview — review and personalize before submitting.
                        </p>
                    </div>

                    <button type="submit" disabled={applicationId == null || submitting}>
                        {submitting ? "Submitting..." : "Submit Feedback"}
                    </button>
                </form>

                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
}

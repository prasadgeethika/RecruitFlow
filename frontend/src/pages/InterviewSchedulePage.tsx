import { useEffect, useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
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

interface ShortlistedOption {
    applicationId: number;
    label: string;
}

interface PassedState {
    applicationId?: number;
    candidateEmail?: string;
    jobTitle?: string;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function InterviewSchedulePage() {
    const { userId } = useAuth();
    const location = useLocation();
    const passed = (location.state as PassedState | null) ?? {};

    // Came here with full context from Review Applications — no fetch needed.
    const hasContext = passed.applicationId != null;

    const [applicationId, setApplicationId] = useState<number | null>(
        passed.applicationId ?? null
    );

    // Only populated when arriving with no context (e.g. via the Navbar
    // link directly) — lets the recruiter pick by name instead of typing an ID.
    const [options, setOptions] = useState<ShortlistedOption[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(!hasContext);

    const [scheduledDate, setScheduledDate] = useState("");
    const [scheduledTime, setScheduledTime] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (hasContext || userId == null) return;
        void loadShortlistedOptions();
    }, [hasContext, userId]);

    const loadShortlistedOptions = async () => {
        setLoadingOptions(true);
        setError("");

        try {
            const jobsRes = await api.get<Job[]>(`/jobs/recruiter/${userId}`);

            const perJob = await Promise.all(
                jobsRes.data.map(async (job) => {
                    const appsRes = await api.get<Application[]>(`/applications/job/${job.id}`);
                    return appsRes.data
                        .filter((a) => a.status === "SHORTLISTED")
                        .map((a) => ({ ...a, jobTitle: job.title }));
                })
            );

            const shortlisted = perJob.flat();

            const withNames = await Promise.all(
                shortlisted.map(async (app) => {
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
            setError("Select which candidate you're scheduling an interview for.");
            return;
        }

        if (!scheduledDate || !scheduledTime) {
            setError("Please select both a date and a time.");
            return;
        }

        const scheduledAt = `${scheduledDate}T${scheduledTime}`;

        if (new Date(scheduledAt).getTime() < Date.now()) {
            setError("Interview date and time must be in the future.");
            return;
        }

        setSubmitting(true);

        try {
            await api.post("/interviews/schedule", {
                applicationId,
                scheduledAt,
            });
            setMessage("Interview scheduled successfully.");
            if (!hasContext) setApplicationId(null);
            setScheduledDate("");
            setScheduledTime("");
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="page">
            <div className="card">
                <h2>Schedule Interview</h2>

                {hasContext ? (
                    <p className="job-subtitle">
                        Scheduling for <strong>{passed.candidateEmail}</strong>
                        {passed.jobTitle && <> — {passed.jobTitle}</>}
                    </p>
                ) : (
                    <p className="job-subtitle">
                        Pick a shortlisted candidate below to schedule their interview.
                    </p>
                )}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {!hasContext && (
                        loadingOptions ? (
                            <p>Loading shortlisted candidates...</p>
                        ) : options.length === 0 ? (
                            <div className="empty-state">
                                <p className="empty-state-title">No shortlisted candidates yet</p>
                                <p className="empty-state-hint">
                                    Shortlist someone from Review Applications first, then come back here.
                                </p>
                            </div>
                        ) : (
                            <div className="field">
                                <label className="field-label-text" htmlFor="interview-candidate">Candidate</label>
                                <select
                                    id="interview-candidate"
                                    className="job-select"
                                    value={applicationId ?? ""}
                                    onChange={(e) => setApplicationId(Number(e.target.value))}
                                >
                                    <option value="" disabled>Select a candidate...</option>
                                    {options.map((opt) => (
                                        <option key={opt.applicationId} value={opt.applicationId}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                                <p className="field-hint">Only shortlisted candidates without an interview yet are listed.</p>
                            </div>
                        )
                    )}

                    <div className="datetime-row">
                        <div className="field">
                            <label className="field-label-text" htmlFor="interview-date">Interview Date</label>
                            <input
                                id="interview-date"
                                type="date"
                                min={today()}
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                            />
                            <p className="field-hint">Select the date on which the interview will take place.</p>
                        </div>

                        <div className="field">
                            <label className="field-label-text" htmlFor="interview-time">Interview Time</label>
                            <input
                                id="interview-time"
                                type="time"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                            />
                            <p className="field-hint">Select the scheduled interview time.</p>
                        </div>
                    </div>

                    <button type="submit" disabled={applicationId == null || submitting}>
                        {submitting ? "Scheduling..." : "Schedule Interview"}
                    </button>
                </form>

                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
}

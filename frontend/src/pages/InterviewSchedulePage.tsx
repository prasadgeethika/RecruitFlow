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
                            <p className="empty-state">
                                No shortlisted candidates right now — shortlist someone from
                                Review Applications first.
                            </p>
                        ) : (
                            <select
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
                        )
                    )}

                    <div className="datetime-row">
                        <input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                        />
                        <input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                        />
                    </div>

                    <button type="submit" disabled={applicationId == null}>
                        Schedule Interview
                    </button>
                </form>

                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
}
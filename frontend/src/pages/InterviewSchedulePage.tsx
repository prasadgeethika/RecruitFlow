import { useState, type FormEvent } from "react";
import { useLocation } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";

export default function InterviewSchedulePage() {
    const location = useLocation();
    const passedId = (location.state as { applicationId?: number } | null)?.applicationId;

    const [applicationId, setApplicationId] = useState(
        passedId != null ? String(passedId) : ""
    );
    const [scheduledAt, setScheduledAt] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            await api.post("/interviews/schedule", {
                applicationId: Number(applicationId),
                scheduledAt,
            });
            setMessage("Interview scheduled successfully.");
            setApplicationId("");
            setScheduledAt("");
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    return (
        <div className="page">
            <div className="card">
                <h2>Schedule Interview</h2>
                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        type="number"
                        placeholder="Application ID"
                        value={applicationId}
                        onChange={(e) => setApplicationId(e.target.value)}
                    />
                    <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                    />
                    <button type="submit">Schedule Interview</button>
                </form>
                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
}
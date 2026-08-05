import { useState, type FormEvent } from "react";
import api, { getErrorMessage } from "../api/axios";

export default function FeedbackPage() {

    const [applicationId, setApplicationId] = useState("");

    const [technicalScore, setTechnicalScore] = useState(0);

    const [communicationScore, setCommunicationScore] = useState(0);

    const [comments, setComments] = useState("");

    const [message, setMessage] = useState("");

    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {

        e.preventDefault();

        setMessage("");
        setError("");

        try {

            await api.put(`/interviews/${applicationId}/feedback`, {
                technicalScore,
                communicationScore,
                comments,
            });

            setMessage("Feedback submitted successfully.");

            setApplicationId("");
            setTechnicalScore(0);
            setCommunicationScore(0);
            setComments("");

        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    return (

        <div className="page">

            <div className="card">

                <h2>Interview Feedback</h2>

                <form className="auth-form" onSubmit={handleSubmit}>

                    <input
                        type="number"
                        placeholder="Application ID"
                        value={applicationId}
                        onChange={(e) => setApplicationId(e.target.value)}
                    />

                    <input
                        type="number"
                        placeholder="Technical Score"
                        value={technicalScore}
                        onChange={(e) =>
                            setTechnicalScore(Number(e.target.value))
                        }
                    />

                    <input
                        type="number"
                        placeholder="Communication Score"
                        value={communicationScore}
                        onChange={(e) =>
                            setCommunicationScore(Number(e.target.value))
                        }
                    />

                    <textarea
                        placeholder="Comments"
                        value={comments}
                        onChange={(e) =>
                            setComments(e.target.value)
                        }
                    />

                    <button type="submit">
                        Submit Feedback
                    </button>

                </form>

                {message && (
                    <p className="success">
                        {message}
                    </p>
                )}

                {error && (
                    <p className="error">
                        {error}
                    </p>
                )}

            </div>

        </div>

    );
}
import { useState, type FormEvent } from "react";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function CreateJobPage() {
    const { userId } = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [skills, setSkills] = useState("");
    const [location, setLocation] = useState("");
    const [experienceRequired, setExperienceRequired] = useState(0);

    const [createdJobId, setCreatedJobId] = useState<number | null>(null);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setSkills("");
        setLocation("");
        setExperienceRequired(0);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await api.post("/jobs", {
                title,
                description,
                skills,
                location,
                experienceRequired,
                recruiterId: userId,
            });

            setCreatedJobId(response.data.id);
            setMessage(
                "Job created as a draft. Click \"Publish\" below so candidates can see and apply to it."
            );
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const publishJob = async () => {
        if (createdJobId == null) return;

        setError("");

        try {
            await api.put(`/jobs/${createdJobId}/open`);
            setMessage("Job published — it's now visible to candidates.");
            setCreatedJobId(null);
            resetForm();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    return (
        <div className="page">
            <div className="card">
                <Navbar />
                <h2>Create Job</h2>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        placeholder="Job Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <input
                        placeholder="Skills (Java, Spring Boot)"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                    />
                    <input
                        placeholder="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                    <input
                        type="number"
                        placeholder="Experience Required"
                        value={experienceRequired}
                        onChange={(e) => setExperienceRequired(Number(e.target.value))}
                    />

                    <button type="submit" disabled={createdJobId !== null}>
                        Create Job
                    </button>
                </form>

                {createdJobId !== null && (
                    <button onClick={() => void publishJob()} className="publish-btn">
                        Publish Job
                    </button>
                )}

                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
}
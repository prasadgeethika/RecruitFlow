import { useState, type FormEvent } from "react";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function CreateJobPage() {
    const { userId } = useAuth();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [skills, setSkills] = useState("");
    const [location, setLocation] = useState("");
    const [experienceRequired, setExperienceRequired] = useState(0);

    const [createdJobId, setCreatedJobId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setSkills("");
        setLocation("");
        setExperienceRequired(0);
    };

    const generateDescription = async () => {
        if (!title) {
            setError("Enter a job title first so the description matches the role.");
            return;
        }

        setError("");
        setGenerating(true);

        try {
            const response = await api.post<{ description: string }>(
                "/jobs/generate-description",
                { title, skills, experienceRequired }
            );
            setDescription(response.data.description);
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

        if (!title || !description || !skills || !location) {
            setError("Please fill in the title, description, skills, and location before creating the job.");
            return;
        }

        setSubmitting(true);

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
        } finally {
            setSubmitting(false);
        }
    };

    const publishJob = async () => {
        if (createdJobId == null) return;

        setError("");
        setPublishing(true);

        try {
            await api.put(`/jobs/${createdJobId}/open`);
            setMessage("Job published — it's now visible to candidates.");
            setCreatedJobId(null);
            resetForm();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="page">
            <div className="card">
                <h2>Create Job</h2>
                <p className="job-subtitle">
                    Fill in the details below. The job is saved as a draft first — you'll publish it
                    separately once you're happy with it.
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="field">
                        <label className="field-label-text" htmlFor="job-title">Job Title</label>
                        <input
                            id="job-title"
                            placeholder="e.g. Java Backend Developer"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <p className="field-hint">The role's title, as candidates will see it.</p>
                    </div>

                    <div className="field">
                        <div className="field-label-row">
                            <label className="field-label-text" htmlFor="job-description">Job Description</label>
                            <button
                                type="button"
                                className="secondary generate-btn"
                                disabled={generating}
                                onClick={() => void generateDescription()}
                            >
                                {generating ? "Generating..." : "✨ Generate with AI"}
                            </button>
                        </div>
                        <textarea
                            id="job-description"
                            placeholder="Describe the responsibilities, role, and expectations"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                        <p className="field-hint">
                            What the person will actually be doing day to day. Fill in title/skills/experience above, then generate a draft to edit — or write your own.
                        </p>
                    </div>

                    <div className="field">
                        <label className="field-label-text" htmlFor="job-skills">Skills</label>
                        <input
                            id="job-skills"
                            placeholder="e.g. Java, Spring Boot, PostgreSQL"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                        />
                        <p className="field-hint">Comma-separated. Used for candidate search matching.</p>
                    </div>

                    <div className="field">
                        <label className="field-label-text" htmlFor="job-location">Location</label>
                        <input
                            id="job-location"
                            placeholder="e.g. Hyderabad"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                        <p className="field-hint">Where the role is based, or "Remote".</p>
                    </div>

                    <div className="field">
                        <label className="field-label-text" htmlFor="job-experience">Years of Experience Required</label>
                        <input
                            id="job-experience"
                            type="number"
                            value={experienceRequired}
                            onChange={(e) => setExperienceRequired(Number(e.target.value))}
                            min={0}
                        />
                        <p className="field-hint">Minimum years of relevant experience a candidate should have.</p>
                    </div>

                    <button type="submit" disabled={submitting || createdJobId !== null}>
                        {submitting ? "Creating..." : "Create Job"}
                    </button>
                </form>

                {createdJobId !== null && (
                    <button
                        onClick={() => void publishJob()}
                        className="publish-btn"
                        disabled={publishing}
                    >
                        {publishing ? "Publishing..." : "Publish Job"}
                    </button>
                )}

                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
}

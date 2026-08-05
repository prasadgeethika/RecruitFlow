import { useState, type FormEvent } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";

interface Job {
    title: string;
    description: string;
    skills: string;
    location: string;
    experienceRequired: number;
}

export default function EditJobPage() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const existing = location.state as Job | null;

    const [title, setTitle] = useState(existing?.title ?? "");
    const [description, setDescription] = useState(existing?.description ?? "");
    const [skills, setSkills] = useState(existing?.skills ?? "");
    const [jobLocation, setJobLocation] = useState(existing?.location ?? "");
    const [experienceRequired, setExperienceRequired] = useState(existing?.experienceRequired ?? 0);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    if (!existing) {
        return (
            <div className="page">
                <div className="card">
                    <p className="error">
                        No job data was passed in. Go back to "My Jobs" and click Edit from there.
                    </p>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            await api.put(`/jobs/${id}`, {
                title,
                description,
                skills,
                location: jobLocation,
                experienceRequired,
            });
            setMessage("Job updated.");
            setTimeout(() => navigate("/my-jobs"), 800);
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    return (
        <div className="page">
            <div className="card">
                <h2>Edit Job (Draft)</h2>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Job Title" />
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
                    <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills" />
                    <input value={jobLocation} onChange={(e) => setJobLocation(e.target.value)} placeholder="Location" />
                    <input
                        type="number"
                        value={experienceRequired}
                        onChange={(e) => setExperienceRequired(Number(e.target.value))}
                        placeholder="Experience Required"
                    />
                    <button type="submit">Save Changes</button>
                </form>

                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
}
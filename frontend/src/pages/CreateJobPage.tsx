import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export default function CreateJobPage() {
    const { userId } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [skills, setSkills] = useState("");
    const [location, setLocation] = useState("");
    const [experienceRequired, setExperienceRequired] = useState(0);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            await api.post("/jobs", {
                title,
                description,
                skills,
                location,
                experienceRequired,
                recruiterId: userId,
            });

            setMessage("Job created successfully.");

            setTimeout(() => {
                navigate("/jobs");
            }, 1000);

            setTitle("");
            setDescription("");
            setSkills("");
            setLocation("");
            setExperienceRequired(0);

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
                        onChange={(e) =>
                            setExperienceRequired(Number(e.target.value))
                        }
                    />

                    <button type="submit">
                        Create Job
                    </button>

                </form>

                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}

            </div>
        </div>
    );
}
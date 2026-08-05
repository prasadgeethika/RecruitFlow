import { useEffect, useState, type FormEvent } from "react";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface RecruiterProfile {
    id?: number;
    userId: number;
    department: string;
    designation: string;
    company: string;
}

export default function RecruiterProfilePage() {
    const { userId } = useAuth();

    const [profileId, setProfileId] = useState<number | null>(null);

    const [department, setDepartment] = useState("");
    const [designation, setDesignation] = useState("");
    const [company, setCompany] = useState("");

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadProfile = async () => {
        if (userId == null) return;

        setLoading(true);

        try {
            const response = await api.get<RecruiterProfile>(
                `/profiles/recruiters/${userId}`
            );

            setProfileId(response.data.id ?? null);
            setDepartment(response.data.department);
            setDesignation(response.data.designation);
            setCompany(response.data.company);
        } catch {
            // No profile yet
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadProfile();
    }, [userId]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        setMessage("");
        setError("");

        try {
            if (profileId) {
                await api.put(`/profiles/recruiters/${profileId}`, {
                    userId,
                    department,
                    designation,
                    company,
                });

                setMessage("Profile updated successfully.");
            } else {
                await api.post("/profiles/recruiters", {
                    userId,
                    department,
                    designation,
                    company,
                });

                setMessage("Profile created successfully.");
                await loadProfile();
            }
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    if (loading) {
        return <p>Loading...</p>;
    }

    return (
        <div className="page">
            <div className="card">

                <h2>Recruiter Profile</h2>

                <form className="auth-form" onSubmit={handleSubmit}>

                    <input
                        placeholder="Company"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                    />

                    <input
                        placeholder="Department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                    />

                    <input
                        placeholder="Designation"
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                    />

                    <button type="submit">
                        {profileId ? "Update Profile" : "Create Profile"}
                    </button>

                </form>

                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}

            </div>
        </div>
    );
}
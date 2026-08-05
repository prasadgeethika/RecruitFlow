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
    const [editMode, setEditMode] = useState(false);

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
            setEditMode(false);
        } catch {
            setEditMode(true);
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
                <div className="page-header">
                    <div>
                        <h2>Recruiter Profile</h2>
                        <p className="section-copy">Your profile is read-only until you click edit.</p>
                    </div>
                    <button className="secondary" type="button" onClick={() => setEditMode((open) => !open)}>
                        {editMode ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>

                {!editMode ? (
                    <div className="profile-view">
                        <div className="profile-row">
                            <span>Company</span>
                            <strong>{company || 'Not set'}</strong>
                        </div>
                        <div className="profile-row">
                            <span>Department</span>
                            <strong>{department || 'Not set'}</strong>
                        </div>
                        <div className="profile-row">
                            <span>Designation</span>
                            <strong>{designation || 'Not set'}</strong>
                        </div>
                    </div>
                ) : (
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
                            {profileId ? 'Save Changes' : 'Create Profile'}
                        </button>
                    </form>
                )}

                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}
            </div>
        </div>
    );
}
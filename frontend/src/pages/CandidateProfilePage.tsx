import { useEffect, useState, type FormEvent } from "react";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface CandidateProfile {
    id?: number;
    userId: number;
    resumeUrl: string;
    skills: string;
    contactNumber: string;
    location: string;
}

export default function CandidateProfilePage() {

    const { userId } = useAuth();

    const [profileId, setProfileId] = useState<number | null>(null);
    const [editMode, setEditMode] = useState(false);

    const [resumeUrl, setResumeUrl] = useState("");
    const [skills, setSkills] = useState("");
    const [contactNumber, setContactNumber] = useState("");
    const [location, setLocation] = useState("");

    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadProfile = async () => {

        if (userId == null) return;

        try {

            const response = await api.get<CandidateProfile>(
                `/profiles/candidates/${userId}`
            );

            const profile = response.data;

            setProfileId(profile.id ?? null);
            setResumeUrl(profile.resumeUrl);
            setSkills(profile.skills);
            setContactNumber(profile.contactNumber);
            setLocation(profile.location);
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

        if (userId == null) return;

        setError("");
        setMessage("");

        const body = {
            userId,
            resumeUrl,
            skills,
            contactNumber,
            location,
        };

        try {

            if (profileId == null) {

                await api.post(
                    "/profiles/candidates",
                    body
                );

                setMessage("Profile created successfully.");

            } else {

                await api.put(
                    `/profiles/candidates/${profileId}`,
                    body
                );

                setMessage("Profile updated successfully.");
            }

            await loadProfile();

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
                        <h2>Candidate Profile</h2>
                        <p className="section-copy">Your profile is read-only until you click edit.</p>
                    </div>
                    <button className="secondary" type="button" onClick={() => setEditMode((open) => !open)}>
                        {editMode ? 'Cancel' : 'Edit Profile'}
                    </button>
                </div>

                {!editMode ? (
                    <div className="profile-view">
                        <div className="profile-row">
                            <span>Resume URL</span>
                            <strong>{resumeUrl || 'Not set'}</strong>
                        </div>
                        <div className="profile-row">
                            <span>Skills</span>
                            <strong>{skills || 'Not set'}</strong>
                        </div>
                        <div className="profile-row">
                            <span>Contact Number</span>
                            <strong>{contactNumber || 'Not set'}</strong>
                        </div>
                        <div className="profile-row">
                            <span>Location</span>
                            <strong>{location || 'Not set'}</strong>
                        </div>
                    </div>
                ) : (
                    <form className="auth-form" onSubmit={handleSubmit}>
                        <input
                            placeholder="Resume URL"
                            value={resumeUrl}
                            onChange={(e) => setResumeUrl(e.target.value)}
                        />

                        <input
                            placeholder="Skills"
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                        />

                        <input
                            placeholder="Contact Number"
                            value={contactNumber}
                            onChange={(e) => setContactNumber(e.target.value)}
                        />

                        <input
                            placeholder="Location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />

                        <button type="submit">
                            {profileId == null ? 'Create Profile' : 'Save Changes'}
                        </button>
                    </form>
                )}

                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}

            </div>

        </div>

    );
}
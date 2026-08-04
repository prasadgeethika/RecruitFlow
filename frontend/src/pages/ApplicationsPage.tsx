import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

interface Application {
    id: number;
    candidateId: number;
    jobId: number;
    status: string;
    coverLetter: string;
    appliedAt: string;
}

export default function ApplicationsPage() {
    const { userId } = useAuth();

    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadApplications = async () => {
        if (userId == null) return;

        setLoading(true);

        try {
            const response = await api.get<Application[]>(
                `/applications/candidate/${userId}`
            );

            setApplications(response.data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadApplications();
    }, [userId]);

    const withdraw = async (applicationId: number) => {
        setError("");
        setMessage("");

        try {
            await api.put(`/applications/${applicationId}/withdraw`);

            setMessage("Application withdrawn successfully.");

            await loadApplications();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    return (
        <div className="page">
            <div className="card">

                <Navbar />

                <h2>My Applications</h2>

                {loading && <p>Loading applications...</p>}

                {error && <p className="error">{error}</p>}

                {message && <p className="success">{message}</p>}

                {!loading && applications.length === 0 && (
                    <p>You haven't applied to any jobs yet.</p>
                )}

                <div className="job-list">

                    {applications.map((application) => (

                        <div className="job-card" key={application.id}>

                            <h3>Application #{application.id}</h3>

                            <p>
                                <strong>Job ID:</strong> {application.jobId}
                            </p>

                            <p>
                                <strong>Status:</strong> {application.status}
                            </p>

                            <p>
                                <strong>Applied:</strong>{" "}
                                {new Date(application.appliedAt).toLocaleString()}
                            </p>

                            {application.status === "APPLIED" && (

                                <button
                                    onClick={() => void withdraw(application.id)}
                                >
                                    Withdraw
                                </button>

                            )}

                        </div>

                    ))}

                </div>

            </div>
        </div>
    );
}
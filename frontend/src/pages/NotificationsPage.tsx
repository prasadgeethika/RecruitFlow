import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import api, { getErrorMessage } from "../api/axios";
import { useAuth } from "../context/AuthContext";

interface Notification {
    id: number;
    userId: number;
    message: string;
    read: boolean;
    createdAt: string;
}

export default function NotificationsPage() {

    const { userId } = useAuth();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const loadNotifications = async () => {

        if (userId == null) return;

        setLoading(true);

        try {

            const response = await api.get<Notification[]>(
                `/notifications/user/${userId}`
            );

            setNotifications(response.data);

        } catch (err) {

            setError(getErrorMessage(err));

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        void loadNotifications();
    }, [userId]);

    const markRead = async (id: number) => {

        setError("");
        setMessage("");

        try {

            await api.put(`/notifications/${id}/read`);

            setMessage("Notification marked as read.");

            await loadNotifications();

        } catch (err) {

            setError(getErrorMessage(err));

        }
    };

    return (

        <div className="page">

            <div className="card">

                <Navbar />

                <h2>Notifications</h2>

                {loading && <p>Loading notifications...</p>}

                {error && (
                    <p className="error">{error}</p>
                )}

                {message && (
                    <p className="success">{message}</p>
                )}

                {!loading && notifications.length === 0 && (
                    <p>No notifications.</p>
                )}

                <div className="job-list">

                    {notifications.map((notification) => (

                        <div
                            key={notification.id}
                            className="job-card"
                        >

                            <p>{notification.message}</p>

                            <p>
                                <strong>Date:</strong>{" "}
                                {new Date(
                                    notification.createdAt
                                ).toLocaleString()}
                            </p>

                            <p>
                                <strong>Status:</strong>{" "}
                                {notification.read
                                    ? "Read"
                                    : "Unread"}
                            </p>

                            {!notification.read && (

                                <button
                                    onClick={() =>
                                        void markRead(notification.id)
                                    }
                                >
                                    Mark as Read
                                </button>

                            )}

                        </div>

                    ))}

                </div>

            </div>

        </div>

    );
}
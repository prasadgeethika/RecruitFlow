import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {

    const { role, email, logout } = useAuth();

    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-top">
                <div>
                    <h2>RecruitFlow</h2>
                    <p className="user-meta">
                        Signed in as <strong>{email ?? "Unknown user"}</strong>
                        {role ? ` · ${role.toLowerCase()}` : ""}
                    </p>
                </div>
            </div>

            <div className="nav-links">
                <Link to="/jobs">Jobs</Link>
                <Link to="/notifications">Notifications</Link>

                {role === "CANDIDATE" && (
                    <>
                        <Link to="/applications">My Applications</Link>
                        <Link to="/candidate-profile">My Profile</Link>
                    </>
                )}

                {role === "RECRUITER" && (
                    <>
                        <Link to="/my-jobs">My Jobs</Link>
                        <Link to="/create-job">Create Job</Link>
                        <Link to="/review-applications">Review Applications</Link>
                        <Link to="/schedule-interview">Schedule Interview</Link>
                        <Link to="/feedback">Interview Feedback</Link>
                        <Link to="/recruiter-profile">My Profile</Link>
                    </>
                )}
            </div>
        </nav>
    );
}
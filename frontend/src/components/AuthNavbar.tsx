import { Link } from "react-router-dom";

// Shared chrome for Login/Register so they read as the same product as the
// landing page, instead of a bare card floating with no way back.
export default function AuthNavbar({ current }: { current: "login" | "register" }) {
    return (
        <header className="auth-navbar">
            <Link to="/" className="brand">RecruitFlow</Link>
            <div className="auth-navbar-links">
                <Link to="/login" className={current === "login" ? "current" : ""}>Login</Link>
                <Link to="/register" className={current === "register" ? "current" : ""}>Register</Link>
            </div>
        </header>
    );
}

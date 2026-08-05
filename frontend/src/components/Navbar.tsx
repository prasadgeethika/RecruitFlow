import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { role } = useAuth();

    const navItems = [
        { path: '/jobs', label: 'Jobs' },
        { path: '/notifications', label: 'Notifications' },
    ];

    if (role === 'CANDIDATE') {
        navItems.push({ path: '/applications', label: 'My Applications' });
        navItems.push({ path: '/candidate-profile', label: 'My Profile' });
    }

    if (role === 'RECRUITER') {
        navItems.push({ path: '/create-job', label: 'Create Job' });
        navItems.push({ path: '/review-applications', label: 'Review Applications' });
        navItems.push({ path: '/schedule-interview', label: 'Schedule Interview' });
        navItems.push({ path: '/feedback', label: 'Interview Feedback' });
        navItems.push({ path: '/recruiter-profile', label: 'My Profile' });
    }

    return (
        <nav className="navbar">
            <div className="navbar-top">
                <div>
                    <p className="sidebar-logo">RecruitFlow</p>
                    <p className="sidebar-role">{role === 'RECRUITER' ? 'Recruiter' : 'Candidate'}</p>
                </div>
            </div>

            <div className="nav-links">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
                    >
                        {item.label}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
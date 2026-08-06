import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { role } = useAuth();

    const navItems = [
        { path: '/dashboard/jobs', label: 'Jobs' },
        { path: '/dashboard/notifications', label: 'Notifications' },
    ];

    if (role === 'CANDIDATE') {
        navItems.push({ path: '/dashboard/applications', label: 'My Applications' });
        navItems.push({ path: '/dashboard/candidate-profile', label: 'My Profile' });
    }

    if (role === 'RECRUITER') {
        navItems.push({ path: '/dashboard/create-job', label: 'Create Job' });
        navItems.push({ path: '/dashboard/review-applications', label: 'Review Applications' });
        navItems.push({ path: '/dashboard/schedule-interview', label: 'Schedule Interview' });
        navItems.push({ path: '/dashboard/feedback', label: 'Interview Feedback' });
        navItems.push({ path: '/dashboard/recruiter-profile', label: 'My Profile' });
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
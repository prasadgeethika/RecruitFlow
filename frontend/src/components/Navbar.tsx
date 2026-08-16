import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

const icon = (paths: ReactNode) => (
    <svg className="nav-icon" width="18" height="18" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        {paths}
    </svg>
);

const icons: Record<string, ReactNode> = {
    jobs: icon(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><path d="M3 12h18" /></>),
    notifications: icon(<><path d="M6 8a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 12 6 8Z" /><path d="M9.5 17a2.5 2.5 0 0 0 5 0" /></>),
    applications: icon(<><path d="M8 3h6l5 5v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 17h6" /></>),
    profile: icon(<><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" /></>),
    create: icon(<><path d="M12 5v14M5 12h14" /></>),
    review: icon(<><path d="M9 11l2 2 4-4" /><rect x="3" y="4" width="18" height="16" rx="2" /></>),
    interview: icon(<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>),
    feedback: icon(<><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-4-1L3 20l1-4.5A8.38 8.38 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5Z" /></>),
    admin: icon(<><path d="M12 3 4 6.5v5c0 4.6 3.2 8.6 8 9.5 4.8-.9 8-4.9 8-9.5v-5L12 3Z" /><path d="M9.5 12.2l1.8 1.8 3.2-3.6" /></>),
};

export default function Navbar() {
    const { role } = useAuth();

    const navItems = [
        { path: '/dashboard/jobs', label: 'Jobs', icon: icons.jobs },
        { path: '/dashboard/notifications', label: 'Notifications', icon: icons.notifications },
    ];

    if (role === 'CANDIDATE') {
        navItems.push({ path: '/dashboard/applications', label: 'My Applications', icon: icons.applications });
        navItems.push({ path: '/dashboard/candidate-profile', label: 'My Profile', icon: icons.profile });
    }

    if (role === 'RECRUITER') {
        navItems.push({ path: '/dashboard/my-jobs', label: 'My Jobs', icon: icons.jobs });
        navItems.push({ path: '/dashboard/create-job', label: 'Create Job', icon: icons.create });
        navItems.push({ path: '/dashboard/review-applications', label: 'Review Applications', icon: icons.review });
        navItems.push({ path: '/dashboard/schedule-interview', label: 'Schedule Interview', icon: icons.interview });
        navItems.push({ path: '/dashboard/feedback', label: 'Interview Feedback', icon: icons.feedback });
        navItems.push({ path: '/dashboard/recruiter-profile', label: 'My Profile', icon: icons.profile });
    }

    if (role === 'ADMIN') {
        navItems.push({ path: '/dashboard/admin', label: 'Admin', icon: icons.admin });
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
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}

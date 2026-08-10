import type { ReactNode } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobsPage from './pages/JobsPage';
import ApplicationsPage from "./pages/ApplicationsPage";
import CreateJobPage from "./pages/CreateJobPage";
import RecruiterReviewPage from "./pages/RecruiterReviewPage";
import InterviewSchedulePage from "./pages/InterviewSchedulePage";
import FeedbackPage from "./pages/FeedbackPage";
import NotificationsPage from "./pages/NotificationsPage";
import CandidateProfilePage from "./pages/CandidateProfilePage";
import RecruiterProfilePage from "./pages/RecruiterProfilePage";
import MyJobsPage from "./pages/MyJobsPage";
import EditJobPage from "./pages/EditJobPage";
import DashboardLayout from "./components/DashboardLayout";
import LandingPage from './pages/LandingPage';
import AdminDashboardPage from "./pages/AdminDashboardPage";

function ProtectedRoute({ children }: { children: ReactNode }) {
    const { token } = useAuth();
    return token ? <>{children}</> : <Navigate to="/login" replace />;
}

// Guards routes that only a specific role should reach - e.g. a candidate
// or recruiter typing /dashboard/admin directly gets bounced to their own
// jobs list instead of seeing the admin UI render (even briefly) before
// its API calls fail.
function RoleRoute({ allow, children }: { allow: string[]; children: ReactNode }) {
    const { role } = useAuth();
    return role && allow.includes(role) ? <>{children}</> : <Navigate to="/dashboard/jobs" replace />;
}

function PublicRoute({ children }: { children: ReactNode }) {
    const { token } = useAuth();
    return token ? <Navigate to="/dashboard/jobs" replace /> : <>{children}</>;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<Navigate to="/dashboard/jobs" replace />} />
                <Route path="jobs" element={<JobsPage />} />
                <Route path="applications" element={<ApplicationsPage />} />
                <Route path="create-job" element={<CreateJobPage />} />
                <Route path="review-applications" element={<RecruiterReviewPage />} />
                <Route path="schedule-interview" element={<InterviewSchedulePage />} />
                <Route path="feedback" element={<FeedbackPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="candidate-profile" element={<CandidateProfilePage />} />
                <Route path="recruiter-profile" element={<RecruiterProfilePage />} />
                <Route path="my-jobs" element={<MyJobsPage />} />
                <Route path="edit-job/:id" element={<EditJobPage />} />
                <Route
                    path="admin"
                    element={
                        <RoleRoute allow={['ADMIN']}>
                            <AdminDashboardPage />
                        </RoleRoute>
                    }
                />
            </Route>

            <Route path="/jobs" element={<Navigate to="/dashboard/jobs" replace />} />
            <Route path="/applications" element={<Navigate to="/dashboard/applications" replace />} />
            <Route path="/create-job" element={<Navigate to="/dashboard/create-job" replace />} />
            <Route path="/review-applications" element={<Navigate to="/dashboard/review-applications" replace />} />
            <Route path="/schedule-interview" element={<Navigate to="/dashboard/schedule-interview" replace />} />
            <Route path="/feedback" element={<Navigate to="/dashboard/feedback" replace />} />
            <Route path="/notifications" element={<Navigate to="/dashboard/notifications" replace />} />
            <Route path="/candidate-profile" element={<Navigate to="/dashboard/candidate-profile" replace />} />
            <Route path="/recruiter-profile" element={<Navigate to="/dashboard/recruiter-profile" replace />} />
            <Route path="/my-jobs" element={<Navigate to="/dashboard/my-jobs" replace />} />
            <Route path="/edit-job/:id" element={<Navigate to="/dashboard/edit-job/:id" replace />} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    );
}
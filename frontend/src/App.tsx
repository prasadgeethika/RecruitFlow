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

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  return token ? <Navigate to="/jobs" replace /> : <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
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
      </Route>

      <Route path="*" element={<Navigate to="/jobs" replace />} />
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
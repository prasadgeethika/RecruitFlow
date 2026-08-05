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
      <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/applications" element={<ProtectedRoute><ApplicationsPage /></ProtectedRoute>}/>
      <Route path="/create-job" element={<ProtectedRoute><CreateJobPage /></ProtectedRoute>}/>
      <Route path="/review-applications" element={<ProtectedRoute><RecruiterReviewPage /></ProtectedRoute>}/>
      <Route path="/schedule-interview" element={<ProtectedRoute><InterviewSchedulePage /></ProtectedRoute>}/>
      <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>}/>
      <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>}/>
      <Route path="/candidate-profile" element={<ProtectedRoute><CandidateProfilePage /></ProtectedRoute>}/>
      <Route path="/recruiter-profile" element={<ProtectedRoute><RecruiterProfilePage /></ProtectedRoute>}/>
      <Route path="/my-jobs" element={<ProtectedRoute><MyJobsPage /></ProtectedRoute>} />
      <Route path="/edit-job/:id" element={<ProtectedRoute><EditJobPage /></ProtectedRoute>} />
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
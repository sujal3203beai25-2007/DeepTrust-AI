import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PublicLayout } from './layouts/PublicLayout';
import { AppLayout } from './layouts/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { ScanCenterPage } from './pages/ScanCenterPage';
import { DualRiskPage } from './pages/DualRiskPage';
import { LiveDemoLabPage } from './pages/LiveDemoLabPage';
import { ScanHistoryPage } from './pages/ScanHistoryPage';
import { ReportDetailPage } from './pages/ReportDetailPage';
import { CompareVerifyPage } from './pages/CompareVerifyPage';
import { EvidenceVaultPage } from './pages/EvidenceVaultPage';
import { AssistantPage } from './pages/AssistantPage';
import { AwarenessCenterPage } from './pages/AwarenessCenterPage';
import { ModelTransparencyPage } from './pages/ModelTransparencyPage';
import { SettingsPage } from './pages/SettingsPage';
import { AudioAnalysisPage } from './pages/AudioAnalysisPage';
import { ImageAnalysisPage } from './pages/ImageAnalysisPage';
import { VideoAnalysisPage } from './pages/VideoAnalysisPage';
import { MessageAnalysisPage } from './pages/MessageAnalysisPage';

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020914] flex items-center justify-center font-sans text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00d9f5] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-[#00d9f5] tracking-widest uppercase">INITIALIZING FORENSIC WORKSTATION...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Informational Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/transparency" element={<ModelTransparencyPage />} />
            <Route path="/demo-lab" element={<LiveDemoLabPage />} />
          </Route>

          {/* Authentication & Account Recovery Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signin" element={<LoginPage />} />
          <Route path="/sign-in" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/register" element={<SignUpPage />} />
          <Route path="/create-account" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Authenticated Application Routes Protected by Guard */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/scan" element={<ScanCenterPage />} />
            <Route path="/dual-risk" element={<DualRiskPage />} />
            <Route path="/history" element={<ScanHistoryPage />} />
            <Route path="/reports" element={<ReportDetailPage />} />
            <Route path="/compare" element={<CompareVerifyPage />} />
            <Route path="/evidence-vault" element={<EvidenceVaultPage />} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/awareness" element={<AwarenessCenterPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/profile" element={<SettingsPage />} />
            <Route path="/audio-analysis" element={<AudioAnalysisPage />} />
            <Route path="/image-analysis" element={<ImageAnalysisPage />} />
            <Route path="/video-analysis" element={<VideoAnalysisPage />} />
            <Route path="/message-analysis" element={<MessageAnalysisPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

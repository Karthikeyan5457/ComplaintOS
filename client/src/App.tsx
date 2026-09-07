import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ComplaintListPage from './pages/complaints/ComplaintListPage';
import ComplaintDetailPage from './pages/complaints/ComplaintDetailPage';
import CreateComplaintPage from './pages/complaints/CreateComplaintPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import DepartmentManagementPage from './pages/admin/DepartmentManagementPage';
import CategoryManagementPage from './pages/admin/CategoryManagementPage';
import SlaConfigPage from './pages/admin/SlaConfigPage';
import ProfilePage from './pages/profile/ProfilePage';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-950">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />

      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/complaints" element={<ComplaintListPage />} />
        <Route path="/complaints/new" element={<CreateComplaintPage />} />
        <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin routes */}
        <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><UserManagementPage /></ProtectedRoute>} />
        <Route path="/admin/departments" element={<ProtectedRoute roles={['ADMIN']}><DepartmentManagementPage /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute roles={['ADMIN']}><CategoryManagementPage /></ProtectedRoute>} />
        <Route path="/admin/sla" element={<ProtectedRoute roles={['ADMIN']}><SlaConfigPage /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

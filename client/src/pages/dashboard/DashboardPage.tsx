import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.role === 'ADMIN') return <AdminDashboard />;
  // Staff uses admin dashboard with limited data
  if (user?.role === 'STAFF') return <AdminDashboard />;
  return <UserDashboard />;
}

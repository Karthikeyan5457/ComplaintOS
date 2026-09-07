import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, FileText, PlusCircle, Building2, Tags, Users,
  LogOut, ChevronLeft, ChevronRight, Shield, Clock,
  Menu, X,
} from 'lucide-react';

const navItems = {
  USER: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/complaints', icon: FileText, label: 'My Complaints' },
    { to: '/complaints/new', icon: PlusCircle, label: 'New Complaint' },
  ],
  STAFF: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/complaints', icon: FileText, label: 'Complaints' },
  ],
  ADMIN: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/complaints', icon: FileText, label: 'All Complaints' },
    { to: '/complaints/new', icon: PlusCircle, label: 'New Complaint' },
    { to: '/admin/departments', icon: Building2, label: 'Departments' },
    { to: '/admin/categories', icon: Tags, label: 'Categories' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/sla', icon: Clock, label: 'SLA Rules' },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = navItems[user?.role || 'USER'];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-surface-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center flex-shrink-0">
          <Shield className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="animate-fadeIn">
            <h1 className="text-sm font-bold text-white tracking-tight">ComplaintOS</h1>
            <p className="text-[10px] text-surface-400 uppercase tracking-wider">AI-Powered</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group
              ${isActive
                ? 'bg-primary-600/20 text-primary-400 shadow-sm shadow-primary-500/10'
                : 'text-surface-400 hover:text-white hover:bg-surface-800'
              }`
            }
          >
            <item.icon className="w-[18px] h-[18px] flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
            {!collapsed && <span className="animate-fadeIn">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-surface-800">
        <NavLink to="/profile" className="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-800/50 mb-2 hover:bg-surface-800 transition-colors block w-full text-left">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0 text-xs font-bold text-white shadow-lg shadow-primary-500/20">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="animate-fadeIn min-w-0">
              <p className="text-sm font-medium text-white truncate group-hover:text-primary-400">{user?.name}</p>
              <p className="text-[10px] text-surface-400 uppercase tracking-wider">{user?.role}</p>
            </div>
          )}
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-sm text-surface-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse toggle - desktop only */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center p-2 border-t border-surface-800 text-surface-500 hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl glass text-white"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-surface-950 border-r border-surface-800 animate-slideDown">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-surface-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col h-screen bg-surface-950 border-r border-surface-800 transition-all duration-300 ${collapsed ? 'w-[68px]' : 'w-[240px]'} flex-shrink-0 sticky top-0`}>
        {sidebarContent}
      </aside>
    </>
  );
}

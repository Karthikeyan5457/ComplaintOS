import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { notificationsApi } from '../../api/client';
import { Bell, BellDot, User, LogOut } from 'lucide-react';
import { formatRelativeTime } from '../../utils/helpers';
import type { Notification } from '../../types';

export default function Header({ title }: { title?: string }) {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const [{ data: notifs }, { data: countData }] = await Promise.all([
        notificationsApi.findAll(),
        notificationsApi.getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(countData.count);
    } catch { /* ignore */ }
  };

  const markAllRead = async () => {
    await notificationsApi.markAllAsRead();
    setUnreadCount(0);
    setNotifications(n => n.map(x => ({ ...x, isRead: true })));
  };

  return (
    <header className="sticky top-0 z-30 glass border-b border-surface-800">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="pl-12 lg:pl-0">
          <h1 className="text-xl font-bold text-white">{title || 'Dashboard'}</h1>
          <p className="text-xs text-surface-400 mt-0.5">
            Welcome back, {user?.name?.split(' ')[0]}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-xl text-surface-400 hover:text-white hover:bg-surface-800 transition-all"
            >
              {unreadCount > 0 ? <BellDot className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scaleIn">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown */}
            {showNotifications && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                <div className="absolute right-0 top-12 w-80 max-h-96 bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-scaleIn">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} className="text-xs text-primary-400 hover:text-primary-300">
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="overflow-y-auto max-h-72">
                    {notifications.length === 0 ? (
                      <p className="text-center text-surface-500 py-8 text-sm">No notifications</p>
                    ) : (
                      notifications.slice(0, 10).map(n => (
                        <div key={n.id} className={`px-4 py-3 border-b border-surface-800/50 hover:bg-surface-800/50 transition-colors ${!n.isRead ? 'bg-primary-500/5' : ''}`}>
                          <p className="text-sm text-white font-medium">{n.title}</p>
                          <p className="text-xs text-surface-400 mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-surface-500 mt-1">{formatRelativeTime(n.createdAt)}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Avatar Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-primary-500/20">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </button>

            {showProfileMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)} />
                <div className="absolute right-0 top-12 w-56 bg-surface-900 border border-surface-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-scaleIn">
                  <div className="p-4 border-b border-surface-800 bg-surface-800/30">
                    <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                    <p className="text-xs text-surface-400 truncate">{user?.email}</p>
                    <div className="mt-2 inline-block px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400 text-[10px] font-bold tracking-wider uppercase">
                      {user?.role}
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => { setShowProfileMenu(false); window.location.href = '/profile'; }}
                      className="w-full text-left px-3 py-2 text-sm text-surface-300 hover:text-white hover:bg-surface-800 rounded-xl transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" /> My Profile
                    </button>
                    <button
                      onClick={() => { setShowProfileMenu(false); logout(); }}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2 mt-1"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

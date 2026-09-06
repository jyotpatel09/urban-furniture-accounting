import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Bell, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const rawNotifications = useStore((state) => state.notifications);
  const markRead = useStore((state) => state.markNotificationRead) || (() => {});
  const clearAll = useStore((state) => state.clearAllNotifications) || (() => {});
  const navigate = useNavigate();

  const notifications = Array.isArray(rawNotifications) ? rawNotifications : [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (n) => {
    markRead(n.id);
    setIsOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full font-medium">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button onClick={clearAll} className="text-xs text-purple-700 hover:text-purple-900 font-medium">
                Clear all
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">No notifications</div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3 flex items-start gap-3 cursor-pointer hover:bg-purple-50/40 transition-colors ${
                      !n.read ? 'bg-purple-50/20 font-medium' : ''
                    }`}
                  >
                    <div className="mt-0.5">
                      {n.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      {n.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                      {n.type === 'info' && <Info className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-900 truncate">{n.title}</p>
                        <span className="text-[10px] text-gray-400">{n.time}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.message}</p>
                    </div>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

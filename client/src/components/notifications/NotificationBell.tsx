import { useEffect, useState } from 'react';
import { HiOutlineBell, HiOutlineCheckCircle } from 'react-icons/hi2';
import { notificationApi } from '../../api';
import { useAppDispatch, useNotifications } from '../../hooks';
import { markAllAsRead, markAsRead, setNotifications } from '../../store/slices/notificationSlice';
import { formatDateTime } from '../../utils';
import type { Notification } from '../../types';

const getNotificationId = (notification: Notification) => notification.id ?? notification._id ?? '';

export default function NotificationBell() {
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await notificationApi.getNotifications(1, 8);
        const payload = response.data.data ?? response.data;
        const items = Array.isArray(payload) ? payload : payload.notifications ?? [];
        dispatch(setNotifications(items));
      } catch {
        dispatch(setNotifications([]));
      }
    };

    fetchNotifications();
  }, [dispatch]);

  const handleMarkRead = async (notification: Notification) => {
    const id = getNotificationId(notification);
    if (!id) return;
    dispatch(markAsRead(id));
    try {
      await notificationApi.markRead(id);
    } catch {
      // Keep the optimistic read state; the next fetch will reconcile it.
    }
  };

  const handleMarkAllRead = async () => {
    dispatch(markAllAsRead());
    try {
      await notificationApi.markAllRead();
    } catch {
      // Keep the optimistic read state.
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        onClick={() => setOpen((value) => !value)}
        aria-label="Notifications"
      >
        <HiOutlineBell className="h-6 w-6" />
        {unreadCount > 0 ? (
          <span className="absolute right-1 top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-lg border border-slate-200 bg-white shadow-xl animate-slide-in">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h3 className="font-semibold text-slate-950">Notifications</h3>
            <button type="button" className="text-xs font-medium text-blue-600 hover:text-blue-700" onClick={handleMarkAllRead}>
              Mark all read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-slate-500">No notifications yet</p>
            ) : (
              notifications.slice(0, 8).map((notification) => (
                <button
                  key={getNotificationId(notification)}
                  type="button"
                  className={`block w-full border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 ${
                    notification.read ? 'bg-white' : 'bg-blue-50/60'
                  }`}
                  onClick={() => handleMarkRead(notification)}
                >
                  <div className="flex items-start gap-2">
                    <HiOutlineCheckCircle className={`mt-0.5 h-4 w-4 ${notification.read ? 'text-slate-300' : 'text-blue-500'}`} />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{notification.title ?? notification.type.replace('_', ' ')}</p>
                      <p className="mt-0.5 text-xs text-slate-500">{notification.message}</p>
                      <p className="mt-1 text-[11px] text-slate-400">{formatDateTime(notification.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

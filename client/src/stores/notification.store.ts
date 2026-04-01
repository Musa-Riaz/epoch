import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { notificationApi } from '@/lib/api';
import {
  INotification,
  NotificationListQueryParams,
  PaginationMeta,
} from '@/interfaces/api';
import { getErrorMessage } from '@/utils/helpers.utils';

interface NotificationState {
  notifications: INotification[];
  unreadCount: number;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
}

interface NotificationActions {
  getNotifications: (params?: NotificationListQueryParams) => Promise<INotification[] | null>;
  markAsRead: (id: string) => Promise<boolean>;
  markAllAsRead: () => Promise<boolean>;
  pushNotification: (notification: INotification) => void;
  setNotifications: (notifications: INotification[], unreadCount: number) => void;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  devtools((set) => ({
    notifications: [],
    unreadCount: 0,
    pagination: null,
    isLoading: false,
    error: null,

    getNotifications: async (params) => {
      set({ isLoading: true, error: null });
      try {
        const response = await notificationApi.getNotifications(params);
        const payload = response.data.data;
        set({
          notifications: payload.items,
          unreadCount: payload.unreadCount,
          pagination: response.data.pagination ?? null,
          isLoading: false,
        });
        return payload.items;
      } catch (err) {
        set({ error: getErrorMessage(err), isLoading: false });
        return null;
      }
    },

    markAsRead: async (id) => {
      try {
        await notificationApi.markAsRead(id);
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n._id === id ? { ...n, isRead: true } : n
          ),
          unreadCount: Math.max(0, state.unreadCount - 1),
        }));
        return true;
      } catch (err) {
        set({ error: getErrorMessage(err) });
        return false;
      }
    },

    markAllAsRead: async () => {
      try {
        await notificationApi.markAllAsRead();
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
          unreadCount: 0,
        }));
        return true;
      } catch (err) {
        set({ error: getErrorMessage(err) });
        return false;
      }
    },

    pushNotification: (notification) => {
      set((state) => {
        const exists = state.notifications.some((n) => n._id === notification._id);
        if (exists) {
          return state;
        }

        return {
          notifications: [notification, ...state.notifications],
          unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
        };
      });
    },

    setNotifications: (notifications, unreadCount) => {
      set({ notifications, unreadCount });
    },

    clearError: () => set({ error: null }),
  }))
);

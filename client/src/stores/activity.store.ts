import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { activityApi } from '@/lib/api';
import { ActivityListQueryParams, IActivity, PaginationMeta } from '@/interfaces/api';
import { getErrorMessage } from '@/utils/helpers.utils';

interface ActivityState {
  activities: IActivity[];
  pagination: PaginationMeta | null;
  isLoading: boolean;
  error: string | null;
}

interface ActivityActions {
  getActivities: (params?: ActivityListQueryParams) => Promise<IActivity[] | null>;
  pushActivity: (activity: IActivity) => void;
  setActivities: (activities: IActivity[]) => void;
  clearError: () => void;
}

export const useActivityStore = create<ActivityState & ActivityActions>()(
  devtools((set) => ({
    activities: [],
    pagination: null,
    isLoading: false,
    error: null,
    getActivities: async (params) => {
      set({ isLoading: true, error: null });
      try {
        const response = await activityApi.getActivities(params);
        const activities = response.data.data;
        set({
          activities,
          pagination: response.data.pagination ?? null,
          isLoading: false,
        });
        return activities;
      } catch (err) {
        set({ error: getErrorMessage(err), isLoading: false });
        return null;
      }
    },
    pushActivity: (activity) => {
      set((state) => {
        const exists = state.activities.some((a) => a._id === activity._id);
        if (exists) {
          return state;
        }

        return {
          activities: [activity, ...state.activities],
        };
      });
    },
    setActivities: (activities) => set({ activities }),
    clearError: () => set({ error: null }),
  }))
);

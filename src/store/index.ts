import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getConfig } from '../config';

interface AppState {
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;

  countDays: number;
  setCountDays: (days: number) => void;

  statusFilter: 'all' | 'ok' | 'down' | 'paused';
  setStatusFilter: (filter: 'all' | 'ok' | 'down' | 'paused') => void;

  sortBy: 'name' | 'status' | 'uptime';
  setSortBy: (sort: 'name' | 'status' | 'uptime') => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  embedMode: boolean;
  setEmbedMode: (mode: boolean) => void;

  notificationEnabled: boolean;
  setNotificationEnabled: (enabled: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => {
      const config = getConfig();
      return {
        theme: config.defaultTheme,
        setTheme: (theme) => set({ theme }),

        countDays: config.countDays,
        setCountDays: (countDays) => set({ countDays }),

        statusFilter: config.defaultFilter,
        setStatusFilter: (statusFilter) => set({ statusFilter }),

        sortBy: config.defaultSort,
        setSortBy: (sortBy) => set({ sortBy }),

        searchQuery: '',
        setSearchQuery: (searchQuery) => set({ searchQuery }),

        embedMode: false,
        setEmbedMode: (embedMode) => set({ embedMode }),

        notificationEnabled: true,
        setNotificationEnabled: (notificationEnabled) => set({ notificationEnabled }),
      };
    },
    {
      name: 'uptime-status-storage',
      partialize: (state) => ({
        theme: state.theme,
        notificationEnabled: state.notificationEnabled,
      }),
    }
  )
);

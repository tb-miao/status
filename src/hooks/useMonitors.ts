import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { fetchMonitors } from '../api/uptimerobot';
import { useAppStore } from '../store';
import { getConfig } from '../config';
import type { IncidentEvent } from '../types';

export function useMonitors() {
  const countDays = useAppStore((s) => s.countDays);
  const statusFilter = useAppStore((s) => s.statusFilter);
  const sortBy = useAppStore((s) => s.sortBy);
  const searchQuery = useAppStore((s) => s.searchQuery);

  const config = getConfig();

  const apiKeys = useMemo(() => {
    const keys = config.apiKeys;
    if (Array.isArray(keys)) return keys;
    if (typeof keys === 'string') return [keys];
    return [];
  }, [config.apiKeys]);

  const queries = useQueries({
    queries: apiKeys.map((apikey) => ({
      queryKey: ['monitors', apikey, countDays],
      queryFn: () => fetchMonitors(apikey, countDays),
    })),
  });

  const isLoading = queries.some((q) => q.isLoading);
  const isFetching = queries.some((q) => q.isFetching);
  const isError = queries.some((q) => q.isError);
  const error = queries.find((q) => q.error)?.error;
  
  // 获取最后更新时间
  const lastUpdated = useMemo(() => {
    const times = queries
      .map((q) => q.dataUpdatedAt)
      .filter((t) => t > 0);
    return times.length > 0 ? Math.max(...times) : null;
  }, [queries]);

  const allMonitors = useMemo(() => {
    return queries.flatMap((q) => q.data || []);
  }, [queries]);

  const filteredMonitors = useMemo(() => {
    let result = [...allMonitors];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.url.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter((m) => m.status === statusFilter);
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case 'status':
          const statusOrder: Record<string, number> = {
            down: 0,
            unknown: 1,
            paused: 2,
            ok: 3,
          };
          return statusOrder[a.status] - statusOrder[b.status];
        case 'uptime':
          return a.average - b.average;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [allMonitors, statusFilter, sortBy, searchQuery]);

  const stats = useMemo(() => {
    const total = allMonitors.length;
    const up = allMonitors.filter((m) => m.status === 'ok').length;
    const down = allMonitors.filter((m) => m.status === 'down').length;
    const paused = allMonitors.filter((m) => m.status === 'paused').length;
    const avgUptime =
      total > 0
        ? allMonitors.reduce((sum, m) => sum + m.average, 0) / total
        : 0;

    return {
      total,
      up,
      down,
      paused,
      avgUptime: Math.floor(avgUptime * 100) / 100,
    };
  }, [allMonitors]);

  const incidents = useMemo(() => {
    const events: IncidentEvent[] = [];

    allMonitors.forEach((monitor) => {
      monitor.logs.forEach((log, idx) => {
        if (log.type === 1) {
          events.push({
            id: `${monitor.id}-${idx}`,
            monitorId: monitor.id,
            monitorName: monitor.name,
            type: 'down',
            datetime: log.datetime,
            duration: log.duration,
            reason: log.reason?.detail,
          });
        }
      });
    });

    return events.sort((a, b) => b.datetime - a.datetime).slice(0, 20);
  }, [allMonitors]);

  const queryClient = useQueryClient();
  const refetch = () => {
    apiKeys.forEach((key) => {
      queryClient.invalidateQueries({ queryKey: ['monitors', key] });
    });
  };

  return {
    monitors: filteredMonitors,
    allMonitors,
    isLoading,
    isFetching,
    isError,
    error,
    stats,
    incidents,
    lastUpdated,
    refetch,
  };
}

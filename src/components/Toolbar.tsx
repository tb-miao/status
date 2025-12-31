import { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { requestNotificationPermission } from '../hooks/useNotification';
import { Select } from './Select';

interface ToolbarProps {
  onRefresh: () => void;
  isLoading?: boolean;
  lastUpdated?: number | null;
}

const daysOptions = [
  { value: 30, label: '30 天' },
  { value: 60, label: '60 天' },
  { value: 90, label: '90 天' },
];

const statusOptions = [
  { value: 'all', label: '全部状态' },
  { value: 'ok', label: '✓ 正常' },
  { value: 'down', label: '✗ 故障' },
  { value: 'paused', label: '⏸ 暂停' },
];

const sortOptions = [
  { value: 'name', label: '按名称' },
  { value: 'status', label: '按状态' },
  { value: 'uptime', label: '按可用率' },
];

export function Toolbar({ onRefresh, isLoading, lastUpdated }: ToolbarProps) {
  const countDays = useAppStore((s) => s.countDays);
  const setCountDays = useAppStore((s) => s.setCountDays);
  const statusFilter = useAppStore((s) => s.statusFilter);
  const setStatusFilter = useAppStore((s) => s.setStatusFilter);
  const sortBy = useAppStore((s) => s.sortBy);
  const setSortBy = useAppStore((s) => s.setSortBy);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const notificationEnabled = useAppStore((s) => s.notificationEnabled);
  const setNotificationEnabled = useAppStore((s) => s.setNotificationEnabled);

  // 通知权限状态
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>('default');
  
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  const handleNotificationClick = () => {
    // 如果浏览器权限已授予，切换应用内开关
    if (notificationStatus === 'granted') {
      setNotificationEnabled(!notificationEnabled);
      return;
    }
    // 否则请求权限
    requestNotificationPermission();
    setTimeout(() => {
      if ('Notification' in window) {
        setNotificationStatus(Notification.permission);
        if (Notification.permission === 'granted') {
          setNotificationEnabled(true);
        }
      }
    }, 100);
  };

  return (
    <div className="card p-4 mb-6" role="toolbar" aria-label="筛选工具栏">
      <div className="flex flex-wrap items-center gap-3">
        {/* 搜索 */}
        <div className="flex-1 min-w-[200px] relative">
          <svg 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="搜索服务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="搜索服务"
            className="w-full pl-10 pr-8 py-2 rounded-lg 
                       border border-slate-200 dark:border-slate-700 
                       bg-white dark:bg-slate-800 
                       text-slate-900 dark:text-white text-sm
                       placeholder:text-slate-400
                       focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500
                       transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              aria-label="清空搜索"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* 时间范围 */}
        <Select
          value={countDays}
          options={daysOptions}
          onChange={(v) => setCountDays(v as number)}
          aria-label="选择时间范围"
        />

        {/* 状态筛选 */}
        <Select
          value={statusFilter}
          options={statusOptions}
          onChange={(v) => setStatusFilter(v as 'all' | 'ok' | 'down' | 'paused')}
          aria-label="筛选状态"
        />

        {/* 排序 */}
        <Select
          value={sortBy}
          options={sortOptions}
          onChange={(v) => setSortBy(v as 'name' | 'status' | 'uptime')}
          aria-label="排序方式"
        />

        {/* 通知开关 */}
        <button
          onClick={handleNotificationClick}
          className={`p-2 rounded-lg transition-colors ${
            notificationStatus === 'denied'
              ? 'text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-not-allowed'
              : notificationStatus === 'granted' && notificationEnabled
              ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
          title={
            notificationStatus === 'denied'
              ? '通知已被禁止，请在浏览器设置中开启'
              : notificationStatus === 'granted' && notificationEnabled
              ? '点击关闭通知'
              : '点击开启通知'
          }
          aria-label={
            notificationStatus === 'granted' && notificationEnabled
              ? '关闭通知'
              : '开启通知'
          }
          disabled={notificationStatus === 'denied'}
        >
          {notificationStatus === 'granted' && !notificationEnabled ? (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          )}
        </button>

        {/* 刷新 */}
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="p-2 rounded-lg 
                     hover:bg-slate-100 dark:hover:bg-slate-700 
                     text-slate-500 hover:text-slate-700 dark:hover:text-slate-300
                     transition-colors disabled:opacity-50"
          title="刷新数据"
          aria-label="刷新数据"
        >
          <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* 最后更新时间 */}
        {lastUpdated && (
          <span className="text-xs text-slate-400 ml-auto hidden sm:inline" aria-live="polite">
            更新于 {new Date(lastUpdated).toLocaleTimeString('zh-CN')}
          </span>
        )}
      </div>
    </div>
  );
}

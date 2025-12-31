import { useEffect, useRef } from 'react';
import { getConfig } from '../config';
import { useAppStore } from '../store';
import type { ProcessedMonitor } from '../types';

export function useNotification(monitors: ProcessedMonitor[]) {
  const prevStatusRef = useRef<Map<number, string>>(new Map());
  const config = getConfig();
  const notificationEnabled = useAppStore((s) => s.notificationEnabled);

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (!notificationEnabled) return;

    monitors.forEach((monitor) => {
      const prevStatus = prevStatusRef.current.get(monitor.id);

      if (prevStatus && prevStatus !== monitor.status) {
        if (monitor.status === 'down') {
          sendNotification(
            `🔴 ${monitor.name} 已离线`,
            `服务 ${monitor.name} 当前无法访问`
          );
        } else if (monitor.status === 'ok' && prevStatus === 'down') {
          sendNotification(
            `🟢 ${monitor.name} 已恢复`,
            `服务 ${monitor.name} 已恢复正常`
          );
        }
      }

      prevStatusRef.current.set(monitor.id, monitor.status);
    });
  }, [monitors, notificationEnabled]);

  // 更新页面标题
  useEffect(() => {
    const downCount = monitors.filter((m) => m.status === 'down').length;

    if (downCount > 0) {
      document.title = `(${downCount} Down) ${config.siteName}`;
    } else {
      document.title = config.siteName;
    }
  }, [monitors, config.siteName]);
}

async function sendNotification(title: string, body: string) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/logo.png' });
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification(title, { body, icon: '/logo.png' });
    }
  }
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

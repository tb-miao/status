import React, { useState, useEffect, useRef } from 'react';

interface HCaptchaWrapperProps {
  sitekey: string;
  onVerify: (token: string) => void;
  onExpire: () => void;
  theme?: 'light' | 'dark';
  languageOverride?: string;
}

const HCaptchaWrapper: React.FC<HCaptchaWrapperProps> = ({
  sitekey,
  onVerify,
  onExpire,
  theme = 'light',
  languageOverride = 'zh-CN'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const isRenderingRef = useRef(false);

  useEffect(() => {
    // 检查hCaptcha脚本是否已加载
    const checkHCaptchaLoaded = () => {
      if (typeof (window as any).hcaptcha !== 'undefined') {
        setIsLoaded(true);
      } else {
        // 如果未加载，尝试动态加载脚本
        loadHCaptchaScript();
      }
    };

    const loadHCaptchaScript = () => {
      if (document.getElementById('hcaptcha-script')) {
        // 脚本已存在，等待加载完成
        const checkInterval = setInterval(() => {
          if (typeof (window as any).hcaptcha !== 'undefined') {
            setIsLoaded(true);
            clearInterval(checkInterval);
          }
        }, 100);
        return;
      }

      const script = document.createElement('script');
      script.id = 'hcaptcha-script';
      script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit&hl=' + languageOverride;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setIsLoaded(true);
        setLoadError('');
      };

      script.onerror = () => {
        setLoadError('hCaptcha 加载失败，请刷新页面重试');
        console.error('Failed to load hCaptcha script');
      };

      document.head.appendChild(script);
    };

    checkHCaptchaLoaded();

    return () => {
      // 清理函数
      const script = document.getElementById('hcaptcha-script');
      if (script && !document.querySelector('[data-hcaptcha-widget-id]')) {
        // 只有当没有其他组件使用hCaptcha时才移除脚本
        script.remove();
      }
    };
  }, [languageOverride]);

  useEffect(() => {
    if (!isLoaded) return;

    // 防止重复渲染
    if (isRenderingRef.current) return;
    isRenderingRef.current = true;

    const renderHCaptcha = () => {
      try {
        const element = document.getElementById('hcaptcha-container');
        if (!element) return;

        // 检查是否已经存在hCaptcha实例
        const existingWidgetId = element.getAttribute('data-hcaptcha-widget-id');
        if (existingWidgetId && (window as any).hcaptcha) {
          // 如果已经存在实例，先重置它
          try {
            (window as any).hcaptcha.reset(existingWidgetId);
          } catch (error) {
            console.warn('Error resetting existing hCaptcha:', error);
          }
        }

        // 清除现有的hCaptcha DOM元素
        const existingWidget = element.querySelector('.h-captcha');
        if (existingWidget) {
          existingWidget.remove();
        }

        // 渲染新的hCaptcha
        const widgetId = (window as any).hcaptcha.render('hcaptcha-container', {
          sitekey,
          theme,
          callback: onVerify,
          'expired-callback': onExpire,
          'error-callback': () => {
            setLoadError('hCaptcha 验证出错，请重试');
            onExpire();
          }
        });

        // 存储widget ID以便后续清理
        element.setAttribute('data-hcaptcha-widget-id', widgetId);
      } catch (error) {
        console.error('Error rendering hCaptcha:', error);
        setLoadError('hCaptcha 渲染失败，请刷新页面重试');
      } finally {
        isRenderingRef.current = false;
      }
    };

    // 等待DOM更新，使用更长的延迟避免React StrictMode的重复渲染问题
    const timeoutId = setTimeout(renderHCaptcha, 300);

    return () => {
      clearTimeout(timeoutId);
      isRenderingRef.current = false;
      // 清理hCaptcha实例
      try {
        const element = document.getElementById('hcaptcha-container');
        if (element) {
          const widgetId = element.getAttribute('data-hcaptcha-widget-id');
          if (widgetId && (window as any).hcaptcha) {
            try {
              (window as any).hcaptcha.reset(widgetId);
            } catch (error) {
              console.warn('Error resetting hCaptcha on cleanup:', error);
            }
          }
          element.removeAttribute('data-hcaptcha-widget-id');
        }
      } catch (error) {
        console.error('Error cleaning up hCaptcha:', error);
      }
    };
  }, [isLoaded, sitekey, theme, onVerify, onExpire]);

  return (
    <div className="hcaptcha-wrapper">
      <div id="hcaptcha-container" ref={containerRef} className="flex justify-center"></div>
      {loadError && (
        <div className="text-center text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
          <p>{loadError}</p>
          <button onClick={() => window.location.reload()}>刷新页面</button>
        </div>
      )}
      {!isLoaded && !loadError && (
        <div className="text-center text-slate-500 dark:text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
          加载人机验证...
        </div>
      )}
    </div>
  );
};

export default HCaptchaWrapper;
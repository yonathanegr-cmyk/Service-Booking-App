import { useState, useEffect } from 'react';
import { getCurrentEnv, toggleEnv } from '../lib/supabase';
import { Bug, Server, Database, AlertTriangle } from 'lucide-react';

interface DevToolsProps {
  forceShow?: boolean;
}

export function DevTools({ forceShow = false }: DevToolsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentEnv, setCurrentEnv] = useState<'dev' | 'prod'>('dev');

  useEffect(() => {
    const isDev = import.meta.env.DEV;
    const hasDebugParam = new URLSearchParams(window.location.search).get('debug') === 'true';
    const hasDevToolsEnabled = localStorage.getItem('beed_devtools_enabled') === 'true';
    
    setIsVisible(forceShow || isDev || hasDebugParam || hasDevToolsEnabled);
    setCurrentEnv(getCurrentEnv());

    if (hasDebugParam && !hasDevToolsEnabled) {
      localStorage.setItem('beed_devtools_enabled', 'true');
    }
  }, [forceShow]);

  if (!isVisible) return null;

  const isProd = currentEnv === 'prod';

  return (
    <>
      {currentEnv === 'dev' && (
        <div 
          className="fixed inset-0 pointer-events-none z-40"
          style={{
            border: '3px solid #22c55e',
            boxShadow: 'inset 0 0 20px rgba(34, 197, 94, 0.2)'
          }}
        >
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            TEST MODE - DEV
          </div>
        </div>
      )}

      {currentEnv === 'prod' && (
        <div className="fixed top-2 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          PRODUCTION
        </div>
      )}

      <div className="fixed bottom-4 left-4 z-50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 ${
            isProd
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
          title={`סביבה: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}`}
        >
          <Bug className="w-5 h-5" />
        </button>

        {isExpanded && (
          <div 
            className="absolute bottom-0 left-16 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-64"
            dir="rtl"
          >
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              <Bug className="w-4 h-4" />
              כלי פיתוח Beedy
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600 dark:text-gray-400">סביבה נוכחית:</span>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  isProd 
                    ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' 
                    : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                }`}>
                  {isProd ? 'PROD' : 'DEV'}
                </span>
              </div>

              <button
                onClick={() => {
                  if (isProd) {
                    const confirmed = window.confirm(
                      'אתה עומד לעבור לסביבת DEV עם נתונים מדומים. להמשיך?'
                    );
                    if (!confirmed) return;
                  } else {
                    const confirmed = window.confirm(
                      '⚠️ אזהרה: אתה עומד לעבור לסביבת PRODUCTION עם נתונים אמיתיים!\n\nכל הפעולות יבוצעו על מסד הנתונים האמיתי.\n\nלהמשיך?'
                    );
                    if (!confirmed) return;
                  }
                  toggleEnv();
                }}
                className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  isProd
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {isProd ? (
                  <>
                    <Database className="w-4 h-4" />
                    עבור ל-DEV
                  </>
                ) : (
                  <>
                    <Server className="w-4 h-4" />
                    עבור ל-PROD
                  </>
                )}
              </button>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <p className="text-[10px] text-gray-400 text-center">
                  {isProd 
                    ? '🔴 נתונים אמיתיים - היזהר!' 
                    : '🟢 נתונים מדומים - בטוח לנסות'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function enableDevTools(): void {
  localStorage.setItem('beed_devtools_enabled', 'true');
  window.location.reload();
}

export function disableDevTools(): void {
  localStorage.removeItem('beed_devtools_enabled');
  window.location.reload();
}

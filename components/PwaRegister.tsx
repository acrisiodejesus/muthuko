'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export function PwaRegister() {
  const [isOnline, setIsOnline] = useState(true);
  const [swRegistered, setSwRegistered] = useState(false);

  useEffect(() => {
    // Check initial online status
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);

      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Register Service Worker
      if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            console.log('[Muthuko PWA] Service Worker registrado com escopo:', reg.scope);
            setSwRegistered(true);
          })
          .catch((err) => {
            console.error('[Muthuko PWA] Falha ao registar Service Worker:', err);
          });
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  if (isOnline) {
    return null; // Silent when online, no clutter
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-center gap-2 shadow-md">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Modo Offline Ativo — Todas as operações e fotos continuam salvas no aparelho (IndexedDB).</span>
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';

export function useWakeLock() {
  const [isSupported, setIsSupported] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    setIsSupported('wakeLock' in navigator);
  }, []);

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) return false;
    try {
      if (wakeLockRef.current && !wakeLockRef.current.released) {
        setIsActive(true);
        return true;
      }
      const sentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockRef.current = sentinel;
      setIsActive(true);

      sentinel.addEventListener('release', () => {
        setIsActive(false);
        wakeLockRef.current = null;
      });

      return true;
    } catch (err) {
      console.warn('Wake Lock no pudo ser adquirido:', err);
      setIsActive(false);
      return false;
    }
  }, []);

  const release = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
      } catch {
        // ignorar
      }
      wakeLockRef.current = null;
    }
    setIsActive(false);
  }, []);

  const toggle = useCallback(() => {
    if (isActive) {
      release();
    } else {
      request();
    }
  }, [isActive, release, request]);

  // Re-adquirir el wake lock si el usuario minimiza la pestaña y vuelve a ella
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive && !wakeLockRef.current) {
        request();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [isActive, request]);

  return {
    isSupported,
    isActive,
    request,
    release,
    toggle,
  };
}

import { useState, useEffect, useCallback } from 'react';
import type { AppData } from '../types';

const STORAGE_KEY = 'perekladychka_data';
const INITIAL_DATA: AppData = { soldiers: [], sessions: [] };

export function useAppData() {
  const [data, setDataState] = useState<AppData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse app data', e);
    }
    return INITIAL_DATA;
  });

  const setData = useCallback((newData: AppData | ((prev: AppData) => AppData)) => {
    setDataState(prev => {
      const updated = typeof newData === 'function' ? newData(prev) : newData;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      // Dispatch custom event so other hook instances can sync if needed
      window.dispatchEvent(new Event('perekladychka_sync'));
      return updated;
    });
  }, []);

  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setDataState(JSON.parse(stored));
        }
      } catch (e) {
        // ignore
      }
    };
    
    // Also listen to normal storage events for multi-tab sync
    window.addEventListener('storage', handleSync);
    window.addEventListener('perekladychka_sync', handleSync);
    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('perekladychka_sync', handleSync);
    };
  }, []);

  return { data, setData };
}

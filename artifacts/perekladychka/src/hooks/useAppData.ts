import { useState, useEffect, useCallback } from 'react';
import type { AppData } from '../types';
import { normalizeAppData } from '../utils/appData';

const STORAGE_KEY = 'perekladychka_data';
const INITIAL_DATA: AppData = { soldiers: [], sessions: [] };

function parseStoredData(value: string): AppData | null {
  const parsed = JSON.parse(value) as Partial<AppData>;
  if (!Array.isArray(parsed?.soldiers) || !Array.isArray(parsed?.sessions)) return null;
  return normalizeAppData(parsed as AppData);
}

export function useAppData() {
  const [data, setDataState] = useState<AppData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const normalized = parseStoredData(stored);
        if (normalized) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
          return normalized;
        }
      }
    } catch (e) {
      console.error('Failed to parse app data', e);
    }
    return INITIAL_DATA;
  });

  const setData = useCallback((newData: AppData | ((prev: AppData) => AppData)) => {
    setDataState(prev => {
      const updated = typeof newData === 'function' ? newData(prev) : newData;
      const normalized = normalizeAppData(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
      // Dispatch custom event so other hook instances can sync if needed
      window.dispatchEvent(new Event('perekladychka_sync'));
      return normalized;
    });
  }, []);

  useEffect(() => {
    const handleSync = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const normalized = parseStoredData(stored);
          if (normalized) setDataState(normalized);
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

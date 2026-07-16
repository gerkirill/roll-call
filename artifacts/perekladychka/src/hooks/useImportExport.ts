import { useCallback } from 'react';
import { useAppData } from './useAppData';
import type { AppData } from '../types';

export function useImportExport() {
  const { data, setData } = useAppData();

  const exportData = useCallback(() => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    
    const d = new Date();
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    
    a.download = `perekladychka-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data]);

  const importData = useCallback(async (file: File): Promise<'ok' | 'invalid'> => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<AppData>;
      
      if (!parsed || !Array.isArray(parsed.soldiers) || !Array.isArray(parsed.sessions)) {
        return 'invalid';
      }
      
      // Basic validation passes, override
      setData({
        soldiers: parsed.soldiers,
        sessions: parsed.sessions
      });
      return 'ok';
    } catch (e) {
      console.error('Import failed', e);
      return 'invalid';
    }
  }, [setData]);

  return { exportData, importData };
}

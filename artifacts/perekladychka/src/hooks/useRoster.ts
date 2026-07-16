import { useCallback } from 'react';
import { useAppData } from './useAppData';
import type { Soldier } from '../types';

export function useRoster() {
  const { data, setData } = useAppData();

  const addSoldier = useCallback((s: Omit<Soldier, 'id'>) => {
    const id = crypto.randomUUID();
    const newSoldier: Soldier = { ...s, id };
    setData(prev => ({
      ...prev,
      soldiers: [...prev.soldiers, newSoldier]
    }));
  }, [setData]);

  const updateSoldier = useCallback((s: Soldier) => {
    setData(prev => ({
      ...prev,
      soldiers: prev.soldiers.map(soldier => soldier.id === s.id ? s : soldier)
    }));
  }, [setData]);

  const deleteSoldier = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      soldiers: prev.soldiers.filter(s => s.id !== id)
    }));
  }, [setData]);

  return {
    soldiers: data.soldiers,
    addSoldier,
    updateSoldier,
    deleteSoldier
  };
}

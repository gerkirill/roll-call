import { useCallback } from 'react';
import { useAppData } from './useAppData';
import type { Soldier } from '../types';
import { arrayMove } from '@dnd-kit/sortable';

export function useRoster() {
  const { data, setData } = useAppData();

  const addSoldier = useCallback((s: Omit<Soldier, 'id' | 'updatedAt'>) => {
    const id = crypto.randomUUID();
    const newSoldier: Soldier = { ...s, id, updatedAt: new Date().toISOString() };
    setData(prev => ({
      ...prev,
      soldiers: [...prev.soldiers, newSoldier]
    }));
  }, [setData]);

  const updateSoldier = useCallback((s: Soldier) => {
    const updated: Soldier = { ...s, updatedAt: new Date().toISOString() };
    setData(prev => ({
      ...prev,
      soldiers: prev.soldiers.map(soldier => soldier.id === s.id ? updated : soldier)
    }));
  }, [setData]);

  const deleteSoldier = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      soldiers: prev.soldiers.filter(s => s.id !== id)
    }));
  }, [setData]);

  const reorderSoldiers = useCallback((fromIndex: number, toIndex: number) => {
    setData(prev => ({
      ...prev,
      soldiers: arrayMove(prev.soldiers, fromIndex, toIndex)
    }));
  }, [setData]);

  return {
    soldiers: data.soldiers,
    addSoldier,
    updateSoldier,
    deleteSoldier,
    reorderSoldiers
  };
}

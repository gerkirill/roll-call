import { useCallback } from 'react';
import { useAppData } from './useAppData';
import type { Soldier } from '../types';
import { arrayMove } from '@dnd-kit/sortable';
import { nanoid } from '../utils/id';

type NewSoldier = Omit<Soldier, 'id' | 'updatedAt'>;

export function useRoster() {
  const { data, setData } = useAppData();

  const addSoldier = useCallback((s: NewSoldier) => {
    const id = nanoid(8);
    const newSoldier: Soldier = { ...s, id, updatedAt: new Date().toISOString() };
    setData(prev => ({
      ...prev,
      soldiers: [...prev.soldiers, newSoldier]
    }));
  }, [setData]);

  const addSoldiers = useCallback((soldiers: NewSoldier[]) => {
    if (soldiers.length === 0) return;

    const updatedAt = new Date().toISOString();
    const newSoldiers: Soldier[] = soldiers.map(soldier => ({
      ...soldier,
      id: nanoid(8),
      updatedAt
    }));

    setData(prev => ({
      ...prev,
      soldiers: [...prev.soldiers, ...newSoldiers]
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
    addSoldiers,
    updateSoldier,
    deleteSoldier,
    reorderSoldiers
  };
}

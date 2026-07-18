import { useCallback } from 'react';
import { useAppData } from './useAppData';
import type { RollCallSession, StoredStatus } from '../types';
import { nanoid } from '../utils/id';

export function useRollCall() {
  const { data, setData } = useAppData();

  // Latest session without completedAt
  const currentSession = [...data.sessions].reverse().find(s => !s.completedAt) || null;
  
  // Latest session WITH completedAt
  const previousSession = [...data.sessions].reverse().find(s => !!s.completedAt) || null;

  const startSession = useCallback(() => {
    const id = nanoid(8);
    const newSession: RollCallSession = {
      id,
      startedAt: new Date().toISOString(),
      entries: []
    };
    setData(prev => ({
      ...prev,
      sessions: [...prev.sessions, newSession]
    }));
    return id;
  }, [setData]);

  const completeSession = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => 
        s.id === id ? { ...s, completedAt: new Date().toISOString() } : s
      )
    }));
  }, [setData]);

  const cancelSession = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.id !== id || !!s.completedAt)
    }));
  }, [setData]);

  const setEntry = useCallback((sessionId: string, soldierId: string, status: StoredStatus) => {
    setData(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => {
        if (s.id !== sessionId) return s;

        const startedAt = Date.parse(s.startedAt);
        const timestamp = Number.isFinite(startedAt)
          ? Math.max(0, Math.floor((Date.now() - startedAt) / 1000))
          : 0;
        const existingIdx = s.entries.findIndex(e => e.soldierId === soldierId);
        
        const newEntries = [...s.entries];
        if (existingIdx >= 0) {
          newEntries[existingIdx] = { soldierId, status, timestamp };
        } else {
          newEntries.push({ soldierId, status, timestamp });
        }
        
        return { ...s, entries: newEntries };
      })
    }));
  }, [setData]);

  const undoLastEntry = useCallback((sessionId: string) => {
    setData(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => {
        if (s.id !== sessionId || s.completedAt || s.entries.length === 0) return s;
        return { ...s, entries: s.entries.slice(0, -1) };
      })
    }));
  }, [setData]);
  
  const removeEntry = useCallback((sessionId: string, soldierId: string) => {
    setData(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => {
        if (s.id !== sessionId) return s;
        return {
          ...s,
          entries: s.entries.filter(e => e.soldierId !== soldierId)
        };
      })
    }));
  }, [setData]);

  return {
    sessions: data.sessions,
    currentSession,
    previousSession,
    startSession,
    completeSession,
    cancelSession,
    setEntry,
    undoLastEntry,
    removeEntry
  };
}

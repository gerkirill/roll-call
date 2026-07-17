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

  const setEntry = useCallback((sessionId: string, soldierId: string, status: StoredStatus) => {
    setData(prev => ({
      ...prev,
      sessions: prev.sessions.map(s => {
        if (s.id !== sessionId) return s;
        const now = new Date().toISOString();
        const existingIdx = s.entries.findIndex(e => e.soldierId === soldierId);
        
        const newEntries = [...s.entries];
        if (existingIdx >= 0) {
          newEntries[existingIdx] = { soldierId, status, timestamp: now };
        } else {
          newEntries.push({ soldierId, status, timestamp: now });
        }
        
        return { ...s, entries: newEntries };
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
    setEntry,
    removeEntry
  };
}

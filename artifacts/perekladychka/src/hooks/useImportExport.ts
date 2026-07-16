import { useCallback } from 'react';
import { useAppData } from './useAppData';
import type { AppData, Soldier, RollCallSession } from '../types';
import { encodeShareString, decodeShareString } from '../utils/share';

export type ImportResult =
  | { status: 'invalid' }
  | { status: 'ok'; soldiersAdded: number; soldiersUpdated: number; sessionsAdded: number };

function mergeSoldiers(
  local: Soldier[],
  incoming: Soldier[]
): { soldiers: Soldier[]; added: number; updated: number } {
  const localMap = new Map(local.map(s => [s.id, s]));
  let added = 0;
  let updated = 0;

  for (const incomingSoldier of incoming) {
    const existing = localMap.get(incomingSoldier.id);
    if (!existing) {
      localMap.set(incomingSoldier.id, incomingSoldier);
      added++;
    } else {
      const existingTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
      const incomingTime = incomingSoldier.updatedAt ? new Date(incomingSoldier.updatedAt).getTime() : 0;
      if (incomingTime > existingTime) {
        localMap.set(incomingSoldier.id, incomingSoldier);
        updated++;
      }
    }
  }

  return { soldiers: Array.from(localMap.values()), added, updated };
}

function mergeSessions(
  local: RollCallSession[],
  incoming: RollCallSession[]
): { sessions: RollCallSession[]; added: number } {
  const localMap = new Map(local.map(s => [s.id, s]));
  let added = 0;

  for (const incomingSession of incoming) {
    const existing = localMap.get(incomingSession.id);
    if (!existing) {
      localMap.set(incomingSession.id, incomingSession);
      added++;
    } else {
      if (incomingSession.entries.length > existing.entries.length) {
        localMap.set(incomingSession.id, incomingSession);
      }
    }
  }

  return { sessions: Array.from(localMap.values()), added };
}

/** Applies incoming AppData into the store using merge rules. Returns counts. */
function applyMerge(
  setData: (fn: (prev: AppData) => AppData) => void,
  incoming: AppData
): ImportResult {
  let soldiersAdded = 0;
  let soldiersUpdated = 0;
  let sessionsAdded = 0;

  setData(prev => {
    const soldierResult = mergeSoldiers(prev.soldiers, incoming.soldiers);
    const sessionResult = mergeSessions(prev.sessions, incoming.sessions);
    soldiersAdded = soldierResult.added;
    soldiersUpdated = soldierResult.updated;
    sessionsAdded = sessionResult.added;
    return { soldiers: soldierResult.soldiers, sessions: sessionResult.sessions };
  });

  return { status: 'ok', soldiersAdded, soldiersUpdated, sessionsAdded };
}

export function useImportExport() {
  const { data, setData } = useAppData();

  // ── File export ────────────────────────────────────────────────────────────
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

  // ── File import ────────────────────────────────────────────────────────────
  const importData = useCallback(async (file: File): Promise<ImportResult> => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<AppData>;
      if (!parsed || !Array.isArray(parsed.soldiers) || !Array.isArray(parsed.sessions)) {
        return { status: 'invalid' };
      }
      return applyMerge(setData, parsed as AppData);
    } catch (e) {
      console.error('Import failed', e);
      return { status: 'invalid' };
    }
  }, [setData]);

  // ── Text share (pk1: string) ───────────────────────────────────────────────
  const shareData = useCallback(async (): Promise<'shared' | 'copied' | 'error'> => {
    try {
      const encoded = await encodeShareString(data);
      if (navigator.share) {
        await navigator.share({ text: encoded });
        return 'shared';
      } else {
        await navigator.clipboard.writeText(encoded);
        return 'copied';
      }
    } catch (e) {
      // User cancelled navigator.share — not an error worth surfacing
      if (e instanceof DOMException && e.name === 'AbortError') return 'shared';
      console.error('Share failed', e);
      return 'error';
    }
  }, [data]);

  // ── Text import (pk1: string) ──────────────────────────────────────────────
  const importFromString = useCallback(async (s: string): Promise<ImportResult> => {
    try {
      const parsed = await decodeShareString(s);
      if (!parsed) return { status: 'invalid' };
      return applyMerge(setData, parsed);
    } catch (e) {
      console.error('String import failed', e);
      return { status: 'invalid' };
    }
  }, [setData]);

  // ── Clear ──────────────────────────────────────────────────────────────────
  const clearData = useCallback(() => {
    setData({ soldiers: [], sessions: [] });
  }, [setData]);

  return { exportData, importData, shareData, importFromString, clearData };
}

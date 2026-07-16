import { useCallback } from 'react';
import { useAppData } from './useAppData';
import type { AppData, Soldier, RollCallSession } from '../types';

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
      // New id — add soldier
      localMap.set(incomingSoldier.id, incomingSoldier);
      added++;
    } else {
      // Same id — newer updatedAt wins; local wins if neither has a timestamp
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
      // New session — add it
      localMap.set(incomingSession.id, incomingSession);
      added++;
    } else {
      // Conflict: keep the one with more entries; local wins on tie
      if (incomingSession.entries.length > existing.entries.length) {
        localMap.set(incomingSession.id, incomingSession);
      }
    }
  }

  return { sessions: Array.from(localMap.values()), added };
}

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

  const importData = useCallback(async (file: File): Promise<ImportResult> => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<AppData>;

      if (!parsed || !Array.isArray(parsed.soldiers) || !Array.isArray(parsed.sessions)) {
        return { status: 'invalid' };
      }

      // Capture merge counts via closure (setData updater runs synchronously in React)
      let soldiersAdded = 0;
      let soldiersUpdated = 0;
      let sessionsAdded = 0;

      setData(prev => {
        const soldierResult = mergeSoldiers(prev.soldiers, parsed.soldiers!);
        const sessionResult = mergeSessions(prev.sessions, parsed.sessions!);
        soldiersAdded = soldierResult.added;
        soldiersUpdated = soldierResult.updated;
        sessionsAdded = sessionResult.added;
        return { soldiers: soldierResult.soldiers, sessions: sessionResult.sessions };
      });

      return { status: 'ok', soldiersAdded, soldiersUpdated, sessionsAdded };
    } catch (e) {
      console.error('Import failed', e);
      return { status: 'invalid' };
    }
  }, [setData]);

  const clearData = useCallback(() => {
    setData({ soldiers: [], sessions: [] });
  }, [setData]);

  return { exportData, importData, clearData };
}

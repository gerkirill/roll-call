import { useCallback } from 'react';
import { useAppData } from './useAppData';
import type { AppData, Soldier, RollCallSession } from '../types';
import { decodeShareString } from '../utils/share';

export type ImportResult =
  | { status: 'invalid' }
  | { status: 'ok'; soldiersAdded: number; soldiersUpdated: number; sessionsAdded: number };

export type ExportResult =
  | { status: 'shared' }
  | { status: 'downloaded' }
  | { status: 'cancelled' }
  | { status: 'error'; message: string };

function errorText(error: unknown): string {
  if (error instanceof DOMException || error instanceof Error) {
    return error.message ? `${error.name}: ${error.message}` : error.name;
  }
  if (typeof error === 'string' && error.trim()) return error;
  return 'невідома помилка';
}

function createExportFile(data: AppData): File {
  const d = new Date();
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return new File(
    [JSON.stringify(data, null, 2)],
    `perekladychka-${dateStr}.json`,
    { type: 'application/json' },
  );
}

function downloadFile(file: File): void {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

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
  const exportData = useCallback(async (): Promise<ExportResult> => {
    const file = createExportFile(data);
    const shareData: ShareData = { files: [file] };

    if (
      window.isSecureContext &&
      typeof navigator.share === 'function' &&
      typeof navigator.canShare === 'function' &&
      navigator.canShare(shareData)
    ) {
      try {
        await navigator.share(shareData);
        return { status: 'shared' };
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return { status: 'cancelled' };
        }
        console.error('File share failed', error);
        return { status: 'error', message: errorText(error) };
      }
    }

    try {
      downloadFile(file);
      return { status: 'downloaded' };
    } catch (error) {
      console.error('File export failed', error);
      return { status: 'error', message: errorText(error) };
    }
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

  return { exportData, importData, importFromString, clearData };
}

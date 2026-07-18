import type { AppData } from '../types';

function normalizeEntryTimestamp(timestamp: unknown, startedAt: string): number {
  if (typeof timestamp === 'number' && Number.isFinite(timestamp)) {
    return Math.max(0, Math.floor(timestamp));
  }

  // Backward compatibility with exports and local data created before
  // entry timestamps became offsets from the beginning of a roll call.
  if (typeof timestamp === 'string') {
    const entryTime = Date.parse(timestamp);
    const sessionStart = Date.parse(startedAt);

    if (Number.isFinite(entryTime) && Number.isFinite(sessionStart)) {
      return Math.max(0, Math.floor((entryTime - sessionStart) / 1000));
    }
  }

  return 0;
}

export function normalizeAppData(data: AppData): AppData {
  return {
    ...data,
    sessions: data.sessions.map(session => ({
      ...session,
      entries: session.entries.map(entry => ({
        ...entry,
        timestamp: normalizeEntryTimestamp(
          (entry as { timestamp: unknown }).timestamp,
          session.startedAt,
        ),
      })),
    })),
  };
}

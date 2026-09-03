import { useSyncExternalStore } from 'react';
import { getNewerReleases, validateChangelog, type ChangelogRelease } from '@/lib/changelog';
import { INSTALLED_VERSION } from '@/releaseInfo';

export type ReleaseNotesState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'ready'; latestVersion: string; releases: ChangelogRelease[] }
  | { status: 'error'; message: string };

type PwaUpdateState = {
  updateAvailable: boolean;
  isUpdating: boolean;
  releaseNotes: ReleaseNotesState;
};

const MAX_CHANGELOG_BYTES = 256 * 1024;

const listeners = new Set<() => void>();

let snapshot: PwaUpdateState = {
  updateAvailable: false,
  isUpdating: false,
  releaseNotes: { status: 'idle' },
};

let registration: ServiceWorkerRegistration | null = null;
let waitingWorker: ServiceWorker | null = null;
let initialized = false;
let reloadRequested = false;
let reloadStarted = false;
let releaseNotesRequestId = 0;
let releaseNotesAbortController: AbortController | null = null;

function emit(next: Partial<PwaUpdateState>) {
  snapshot = { ...snapshot, ...next };
  listeners.forEach(listener => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return snapshot;
}

function getRemoteChangelogUrl(): string {
  const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
  const url = new URL('changelog.md', baseUrl);
  url.searchParams.set('update-check', Date.now().toString());
  return url.href;
}

function releaseNotesError(error: unknown): string {
  console.warn('Failed to load PWA release notes', error);
  return 'Не вдалося завантажити опис оновлення. Саме оновлення вже готове до встановлення.';
}

export function loadPwaReleaseNotes() {
  if (!snapshot.updateAvailable) return;

  const requestId = ++releaseNotesRequestId;
  releaseNotesAbortController?.abort();
  const abortController = new AbortController();
  releaseNotesAbortController = abortController;
  emit({ releaseNotes: { status: 'loading' } });

  void fetch(getRemoteChangelogUrl(), {
    cache: 'no-store',
    headers: { Accept: 'text/markdown' },
    signal: abortController.signal,
  }).then(async response => {
    if (!response.ok) throw new Error(`Changelog request failed with ${response.status}`);

    const declaredSize = Number(response.headers.get('content-length'));
    if (Number.isFinite(declaredSize) && declaredSize > MAX_CHANGELOG_BYTES) {
      throw new Error('Remote changelog is too large');
    }

    const markdown = await response.text();
    if (new TextEncoder().encode(markdown).byteLength > MAX_CHANGELOG_BYTES) {
      throw new Error('Remote changelog is too large');
    }

    const releases = getNewerReleases(validateChangelog(markdown), INSTALLED_VERSION);
    if (!releases.length) {
      throw new Error('Remote changelog does not contain a newer release');
    }

    if (requestId !== releaseNotesRequestId) return;
    emit({
      releaseNotes: {
        status: 'ready',
        latestVersion: releases[0].version,
        releases,
      },
    });
  }).catch(error => {
    if (requestId !== releaseNotesRequestId || abortController.signal.aborted) return;
    emit({
      releaseNotes: {
        status: 'error',
        message: error instanceof Error && error.message.includes('newer release')
          ? 'Опис оновлення ще недоступний.'
          : releaseNotesError(error),
      },
    });
  }).finally(() => {
    if (requestId === releaseNotesRequestId) releaseNotesAbortController = null;
  });
}

function markUpdateAvailable(worker: ServiceWorker | null) {
  if (!worker || !navigator.serviceWorker.controller) return;

  const workerChanged = waitingWorker !== worker;
  waitingWorker = worker;
  if (snapshot.updateAvailable && !workerChanged) return;

  releaseNotesRequestId += 1;
  releaseNotesAbortController?.abort();
  releaseNotesAbortController = null;
  emit({ updateAvailable: true, releaseNotes: { status: 'idle' } });
  loadPwaReleaseNotes();
}

function watchRegistration(nextRegistration: ServiceWorkerRegistration) {
  markUpdateAvailable(nextRegistration.waiting);

  nextRegistration.addEventListener('updatefound', () => {
    const worker = nextRegistration.installing;
    if (!worker) return;

    worker.addEventListener('statechange', () => {
      if (worker.state === 'installed') {
        markUpdateAvailable(nextRegistration.waiting ?? worker);
      }
    });
  });
}

function checkForUpdate() {
  if (!registration || !navigator.onLine) return;
  void registration.update().catch(error => {
    console.warn('PWA update check failed', error);
  });
}

export function initializePwaUpdates() {
  if (initialized || !import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  initialized = true;

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!reloadRequested || reloadStarted) return;
    reloadStarted = true;
    window.location.reload();
  });

  const baseUrl = new URL(import.meta.env.BASE_URL, window.location.origin);
  const swUrl = new URL('sw.js', baseUrl).href;

  void navigator.serviceWorker.register(swUrl, { scope: baseUrl.pathname }).then(
    nextRegistration => {
      registration = nextRegistration;
      watchRegistration(nextRegistration);
      checkForUpdate();

      window.addEventListener('focus', checkForUpdate);
      window.addEventListener('online', checkForUpdate);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') checkForUpdate();
      });
    },
    error => {
      console.error('PWA service worker registration failed', error);
    },
  );
}

export function usePwaUpdate() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function applyPwaUpdate() {
  if (snapshot.isUpdating) return;

  const worker = registration?.waiting ?? waitingWorker;
  if (!worker) {
    checkForUpdate();
    return;
  }

  emit({ isUpdating: true });
  reloadRequested = true;

  try {
    worker.postMessage({ type: 'SKIP_WAITING' });
  } catch (error) {
    reloadRequested = false;
    emit({ isUpdating: false });
    console.error('Failed to activate PWA update', error);
    return;
  }

  window.setTimeout(() => {
    if (reloadRequested && !reloadStarted) window.location.reload();
  }, 8000);
}

initializePwaUpdates();

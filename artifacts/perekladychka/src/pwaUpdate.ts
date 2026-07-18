import { useSyncExternalStore } from 'react';

type PwaUpdateState = {
  updateAvailable: boolean;
  isUpdating: boolean;
};

const listeners = new Set<() => void>();

let snapshot: PwaUpdateState = {
  updateAvailable: false,
  isUpdating: false,
};

let registration: ServiceWorkerRegistration | null = null;
let waitingWorker: ServiceWorker | null = null;
let initialized = false;
let reloadRequested = false;
let reloadStarted = false;

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

function markUpdateAvailable(worker: ServiceWorker | null) {
  if (!worker || !navigator.serviceWorker.controller) return;
  waitingWorker = worker;
  emit({ updateAvailable: true });
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

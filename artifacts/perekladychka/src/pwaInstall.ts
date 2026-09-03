import { useSyncExternalStore } from 'react';

type BeforeInstallPromptChoice = {
  outcome: 'accepted' | 'dismissed';
  platform: string;
};

type BeforeInstallPromptEvent = Event & {
  platforms: string[];
  userChoice: Promise<BeforeInstallPromptChoice>;
  prompt: () => Promise<void>;
};

export type PwaInstallState = {
  status: 'available' | 'installed' | 'unavailable';
  isInstalling: boolean;
};

export type PwaInstallResult = 'accepted' | 'dismissed' | 'installed' | 'unavailable';

const listeners = new Set<() => void>();

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let initialized = false;
let standaloneQuery: MediaQueryList | null = null;

let snapshot: PwaInstallState = {
  status: 'unavailable',
  isInstalling: false,
};

function emit(next: Partial<PwaInstallState>) {
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

function isStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false;
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
    || navigatorWithStandalone.standalone === true;
}

function updateInstalledState() {
  if (isStandaloneMode()) {
    deferredPrompt = null;
    emit({ status: 'installed', isInstalling: false });
  } else if (snapshot.status === 'installed') {
    emit({ status: deferredPrompt ? 'available' : 'unavailable', isInstalling: false });
  }
}

export function initializePwaInstallPrompt() {
  if (initialized || typeof window === 'undefined') return;
  initialized = true;

  if (isStandaloneMode()) {
    snapshot = { status: 'installed', isInstalling: false };
  }

  standaloneQuery = window.matchMedia('(display-mode: standalone)');
  standaloneQuery.addEventListener('change', updateInstalledState);

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    if (!isStandaloneMode()) emit({ status: 'available', isInstalling: false });
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    emit({ status: 'installed', isInstalling: false });
  });
}

export function usePwaInstall() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export async function installPwa(): Promise<PwaInstallResult> {
  if (isStandaloneMode()) {
    emit({ status: 'installed', isInstalling: false });
    return 'installed';
  }

  const prompt = deferredPrompt;
  if (!prompt || snapshot.isInstalling) return 'unavailable';

  emit({ isInstalling: true });

  try {
    await prompt.prompt();
    const choice = await prompt.userChoice;
    deferredPrompt = null;

    if (choice.outcome === 'accepted') {
      emit({ status: 'installed', isInstalling: false });
      return 'accepted';
    }

    emit({ status: 'unavailable', isInstalling: false });
    return 'dismissed';
  } catch (error) {
    console.warn('Failed to open PWA install prompt', error);
    emit({ status: deferredPrompt ? 'available' : 'unavailable', isInstalling: false });
    return 'unavailable';
  }
}

initializePwaInstallPrompt();

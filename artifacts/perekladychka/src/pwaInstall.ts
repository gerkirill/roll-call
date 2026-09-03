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
  status: 'available' | 'installed' | 'manual';
  isInstalling: boolean;
};

export type PwaInstallResult = 'accepted' | 'dismissed' | 'installed' | 'manual';

export type PwaInstallInstructions = {
  intro: string;
  steps: string[];
};

const listeners = new Set<() => void>();

let deferredPrompt: BeforeInstallPromptEvent | null = null;
let initialized = false;
let standaloneQuery: MediaQueryList | null = null;

let snapshot: PwaInstallState = {
  status: 'manual',
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
    emit({ status: deferredPrompt ? 'available' : 'manual', isInstalling: false });
  }
}

export function getPwaInstallInstructions(): PwaInstallInstructions {
  if (typeof window === 'undefined') {
    return {
      intro: 'Скористайтеся командою встановлення в меню браузера.',
      steps: ['Відкрийте меню браузера.', 'Оберіть «Встановити додаток» або «Додати на головний екран».'],
    };
  }

  const userAgent = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(userAgent)
    || (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  const isFirefox = /Firefox|FxiOS/.test(userAgent);

  if (isIos) {
    return {
      intro: 'Встановлення на iPhone та iPad доступне через меню поширення.',
      steps: [
        'Натисніть кнопку «Поширити» (Share) та виберіть «На початковий екран» (Add to Home Screen).',
      ],
    };
  }

  if (isFirefox) {
    return {
      intro: 'Firefox не дозволяє сторінці самостійно відкрити системне встановлення.',
      steps: [
        'Відкрийте меню Firefox.',
        'Оберіть «Встановити» або «Додати на головний екран».',
        'Підтвердьте встановлення.',
      ],
    };
  }

  return {
    intro: 'Браузер не надав сторінці прямий доступ до системного встановлення.',
    steps: [
      'Відкрийте меню браузера.',
      'Оберіть «Встановити додаток» або «Додати на головний екран».',
      'Підтвердьте встановлення.',
    ],
  };
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
  if (!prompt || snapshot.isInstalling) return 'manual';

  emit({ isInstalling: true });

  try {
    await prompt.prompt();
    const choice = await prompt.userChoice;
    deferredPrompt = null;

    if (choice.outcome === 'accepted') {
      emit({ status: 'installed', isInstalling: false });
      return 'accepted';
    }

    emit({ status: 'manual', isInstalling: false });
    return 'dismissed';
  } catch (error) {
    console.warn('Failed to open PWA install prompt', error);
    emit({ status: deferredPrompt ? 'available' : 'manual', isInstalling: false });
    return 'manual';
  }
}

initializePwaInstallPrompt();

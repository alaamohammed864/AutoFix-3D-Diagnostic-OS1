// AutoFix 3D - Service Worker Registration & PWA Install Prompt Hook

export interface PWAInstallEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: PWAInstallEvent | null = null;
const installListeners = new Set<(canInstall: boolean) => void>();

export function isPWAInstallable(): boolean {
  return deferredPrompt !== null;
}

export function subscribeToPWAInstall(listener: (canInstall: boolean) => void): () => void {
  installListeners.add(listener);
  listener(deferredPrompt !== null);
  return () => installListeners.delete(listener);
}

export async function promptPWAInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) {
    return 'unavailable';
  }
  try {
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    installListeners.forEach(l => l(false));
    return choice.outcome;
  } catch (err) {
    console.error('PWA install prompt failed:', err);
    return 'dismissed';
  }
}

export function registerServiceWorker(): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e as PWAInstallEvent;
    installListeners.forEach(l => l(true));
  });

  window.addEventListener('appinstalled', () => {
    console.log('[AutoFix PWA] App was successfully installed');
    deferredPrompt = null;
    installListeners.forEach(l => l(false));
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[AutoFix PWA] ServiceWorker registered with scope:', registration.scope);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('[AutoFix PWA] New content is available; please refresh.');
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn('[AutoFix PWA] ServiceWorker registration failed:', error);
      });
  });
}

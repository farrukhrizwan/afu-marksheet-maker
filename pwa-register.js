// ============================================================
// PWA REGISTRATION SCRIPT - pwa-register.js
// ============================================================

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // FIX: Remove the leading slash from 'sw.js' so it stays in your project folder
    navigator.serviceWorker
      .register('sw.js') 
      .then(registration => {
        console.log('[PWA] Service Worker registered. Scope:', registration.scope);

        // Check for updates every 60 minutes
        setInterval(() => {
          registration.update();
        }, 1000 * 60 * 60);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                if (confirm('New version available! Reload to update?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch(error => {
        console.error('[PWA] Registration failed:', error);
      });
  });
}

// ---- INSTALL PROMPT LOGIC ----
let deferredPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('[PWA] Install prompt ready');

  // Ensure you have an element with id="pwa-install-btn" in your HTML
  const installButton = document.getElementById('pwa-install-btn');
  if (installButton) {
    installButton.style.display = 'inline-block';

    installButton.onclick = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`[PWA] User ${outcome} the install prompt`);
        deferredPrompt = null;
        installButton.style.display = 'none';
      }
    };
  }
});

window.addEventListener('appinstalled', () => {
  console.log('[PWA] Successfully installed!');
  deferredPrompt = null;
  const btn = document.getElementById('pwa-install-btn');
  if (btn) btn.style.display = 'none';
});

// ---- MODE DETECTION ----
window.addEventListener('DOMContentLoaded', () => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  const mode = isStandalone ? 'standalone' : 'browser';
  console.log(`[PWA] Display mode: ${mode}`);
});

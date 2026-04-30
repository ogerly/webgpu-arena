// installId.js
// Erzeugt eine anonyme, zufällige ID für dieses Gerät/Installation.
// Keine personenbezogenen Daten, kein Fingerprinting.

const INSTALL_ID_KEY = 'os_arena_install_id';

/**
 * Holt die bestehende Installations-ID oder erzeugt eine neue.
 * @returns {string}
 */
export function getOrCreateInstallId() {
  let id = localStorage.getItem(INSTALL_ID_KEY);
  
  if (!id) {
    // Erzeuge eine zufällige UUID (v4)
    id = crypto.randomUUID ? crypto.randomUUID() : 'os-' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem(INSTALL_ID_KEY, id);
  }
  
  return id;
}

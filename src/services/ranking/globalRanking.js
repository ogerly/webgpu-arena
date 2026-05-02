// globalRanking.js
// Umgestellt auf direkten fetch-Aufruf ohne Supabase-Client (Sicherheit)
import { getOrCreateInstallId } from './installId.js';
import { state } from '../../state.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

/**
 * Sendet ein Benchmark-Ergebnis an das globale Leaderboard.
 * @param {Object} result 
 */
export async function submitToGlobalRanking(result) {
  const consent = localStorage.getItem('os_arena_ranking_consent');
  if (consent !== 'granted') {
    return { error: 'No consent given' };
  }

  if (!supabaseUrl) {
    console.warn("Supabase URL nicht konfiguriert.");
    return { error: 'Supabase URL not configured' };
  }

  const payload = {
    install_id: getOrCreateInstallId(),
    model_id: result.modelId,
    model_name: result.modelName,
    tokens_per_second: result.tokensPerSecond,
    total_time_ms: result.totalTimeMs,
    benchmark_version: '1.0.0',
    app_version: '1.1.0',
    device_class: 'desktop',
    browser: navigator.userAgent.split(' ').pop(),
    os: navigator.platform,
    webgpu_supported: !!navigator.gpu,
    webgpu_vendor: state.systemInfo?.gpuVendor || 'unknown',
    webgpu_adapter: state.systemInfo?.gpuAdapter || 'unknown'
  };

  try {
    console.log(`Sende POST an: ${supabaseUrl}/functions/v1/submit-ranking`);
    const response = await fetch(`${supabaseUrl}/functions/v1/submit-ranking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log("Response Status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Fehler Details:", errorData);
      throw new Error(errorData.message || errorData.error || `HTTP Error ${response.status}`);
    }

    const data = await response.json();
    return { data };
  } catch (err) {
    console.error("Fehler beim Upload des Rankings:", err);
    return { error: err.message };
  }
}

/**
 * Holt das globale Leaderboard aus der öffentlichen View via REST API.
 * Hinweis: Erfordert, dass die View ohne API-Key lesbar ist (Proxy oder Public Config).
 */
export async function fetchGlobalLeaderboard() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  if (!supabaseUrl) {
    console.warn("Supabase URL nicht konfiguriert.");
    return [];
  }

  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/get-leaderboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    
    return await response.json();
  } catch (err) {
    console.error("Fehler beim Abrufen des Leaderboards:", err);
    return [];
  }
}

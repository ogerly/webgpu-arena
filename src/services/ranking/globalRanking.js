// globalRanking.js
import { createClient } from '@supabase/supabase-js';
import { getOrCreateInstallId } from './installId.js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Client nur initialisieren, wenn Keys vorhanden sind
const supabase = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

/**
 * Sendet ein Benchmark-Ergebnis an das globale Leaderboard.
 * @param {import('./rankingTypes').BenchmarkResult} result 
 */
export async function submitToGlobalRanking(result) {
  const consent = localStorage.getItem('os_arena_ranking_consent');
  if (consent !== 'granted') {
    return { error: 'No consent given' };
  }

  if (!supabase) {
    console.warn("Supabase nicht konfiguriert.");
    return { error: 'Supabase not configured' };
  }

  const payload = {
    install_id: getOrCreateInstallId(),
    model_id: result.modelId,
    model_name: result.modelName,
    tokens_per_second: result.tokensPerSecond,
    total_time_ms: result.totalTimeMs,
    benchmark_version: '1.0.0',
    app_version: '1.1.0',
    device_class: 'desktop', // Hier könnte man noch Logik zur Erkennung einbauen
    browser: navigator.userAgent.split(' ').pop(),
    os: navigator.platform,
    webgpu_supported: !!navigator.gpu
  };

  try {
    // Aufruf der Edge Function (WICHTIG: Name muss exakt wie in Supabase sein)
    const { data, error } = await supabase.functions.invoke('os-arena-ranking-handler', {
      body: payload
    });

    if (error) throw error;
    return { data };
  } catch (err) {
    console.error("Fehler beim Upload des Rankings:", err);
    return { error: err.message };
  }
}

/**
 * Holt das globale Leaderboard aus der öffentlichen View.
 */
export async function fetchGlobalLeaderboard() {
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('leaderboard_public')
      .select('*')
      .order('avg_tps', { ascending: false });

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Fehler beim Abrufen des Leaderboards:", err);
    return [];
  }
}

import fs from 'fs';
import { resolve } from 'path';

// Lade .env Datei manuell (ohne dotenv Abhängigkeit)
const envPath = resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1].trim()] = match[2].trim();
    }
  });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;

async function runE2ETest() {
  console.log('🚀 Starte Supabase E2E Integrationstest (NO-KEY Architektur)...\n');

  if (!supabaseUrl) {
    console.error('❌ FEHLER: VITE_SUPABASE_URL fehlt in der .env Datei.');
    process.exit(1);
  }

  const payload = {
    install_id: 'test-install-id-999',
    model_id: 'test-e2e-model',
    model_name: 'E2E Test Model',
    tokens_per_second: (Math.random() * 50 + 20).toFixed(2), // Zufälliger TPS Wert
    total_time_ms: 1000,
    benchmark_version: '1.0.0',
    device_class: 'server',
    browser: 'NodeJS',
    os: 'Windows',
    webgpu_supported: false,
    webgpu_vendor: 'test',
    webgpu_adapter: 'test adapter'
  };

  console.log('1️⃣  Teste Edge Function (Schreiben in die DB)...');
  const functionUrl = `${supabaseUrl}/functions/v1/submit-ranking`;
  
  try {
    const res = await fetch(functionUrl, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const text = await res.text();
    
    if (res.ok) {
      console.log('✅ Edge Function (submit-ranking) erfolgreich aufgerufen. Antwort:', text);
    } else {
      console.error(`❌ FEHLER bei der Edge Function (Status ${res.status}):`);
      console.error(text);
      console.log('\n💡 HINWEIS: Ist die Funktion deployt und WURDE SIE OHNE JWT VERIFICATION DEPLOYT?');
      console.log('Führe aus:');
      console.log('   npx supabase functions deploy submit-ranking --no-verify-jwt');
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Netzwerkfehler beim Aufruf der Edge Function:', err.message);
  }

  console.log('\n2️⃣  Teste REST API über Edge Function (Lesen aus der View `leaderboard_public`)...');
  const viewUrl = `${supabaseUrl}/functions/v1/get-leaderboard`;

  try {
    const res2 = await fetch(viewUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const text2 = await res2.text();

    if (res2.ok) {
      console.log('✅ Leaderboard (get-leaderboard) erfolgreich geladen!');
      try {
        const data = JSON.parse(text2);
        console.table(data);
        const testModelEntry = data.find(m => m.model_id === 'test-e2e-model');
        if (testModelEntry) {
          console.log('\n🎉 ERFOLG: Der Test-Eintrag ("test-e2e-model") wurde im Leaderboard gefunden!');
        } else {
          console.log('\n⚠️ HINWEIS: Test-Eintrag noch nicht im Leaderboard. Eventuell cache oder delay?');
        }
      } catch(e) {
        console.log('Daten:', text2);
      }
    } else {
      console.error(`❌ FEHLER beim Abrufen des Leaderboards (Status ${res2.status}):`);
      console.error(text2);
      console.log('\n💡 HINWEIS: Ist die Funktion deployt?');
      console.log('   npx supabase functions deploy get-leaderboard --no-verify-jwt');
    }
  } catch (err) {
    console.error('❌ Netzwerkfehler beim Abrufen des Leaderboards:', err.message);
  }
}

runE2ETest();

// supabase/functions/submit-ranking/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '' // WICHTIG: Service Role nutzen für Schreibzugriff
    )

    const payload = await req.json()
    const { 
      install_id, 
      model_id, 
      model_name, 
      tokens_per_second, 
      total_time_ms,
      benchmark_version 
    } = payload

    // 1. Validierung
    if (!install_id || !model_id || !tokens_per_second || tokens_per_second <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 2. Anonymisierung (Hash mit Salt)
    const salt = Deno.env.get('RANKING_SALT') ?? 'default_salt_please_change'
    const encoder = new TextEncoder()
    const data = encoder.encode(install_id + salt)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const install_id_hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    // 3. Rate Limiting (Check letzte Stunde)
    const { count, error: countError } = await supabase
      .from('benchmark_results')
      .select('*', { count: 'exact', head: true })
      .eq('install_id_hash', install_id_hash)
      .gt('created_at', new Date(Date.now() - 3600000).toISOString())

    if (count !== null && count >= 10) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Max 10 per hour.' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // 4. In Datenbank schreiben
    const { error: insertError } = await supabase
      .from('benchmark_results')
      .insert({
        benchmark_version: benchmark_version || '1.0.0',
        model_id,
        model_name,
        tokens_per_second,
        total_time_ms,
        install_id_hash,
        device_class: payload.device_class,
        browser: payload.browser,
        os: payload.os,
        webgpu_supported: payload.webgpu_supported,
        webgpu_vendor: payload.webgpu_vendor,
        webgpu_adapter: payload.webgpu_adapter
      })

    if (insertError) throw insertError

    return new Response(JSON.stringify({ message: 'Ranking submitted successfully' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

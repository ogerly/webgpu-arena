# LTM: Sicherheits-Architektur "No-Key Frontend"

**Datum:** 30. April 2026

## Kontext
Die OS-Arena ist eine statische PWA, die auf GitHub Pages gehostet wird. Ursprünglich wurde der Supabase-Client direkt im Frontend mit einem Anon-Key genutzt. Dies birgt Risiken für Spam und Missbrauch der Datenbank.

## Entscheidung
Es wurde entschieden, **keine API-Keys** (auch keine Anon-Keys) im Frontend-Code zu belassen.

## Implementierung
1. **Direct Fetch**: Statt des Supabase-SDKs wird die native `fetch` API verwendet.
2. **Edge Function Gatekeeper**: Alle Schreib- und Lesezugriffe (für sensitive Daten) erfolgen über Supabase Edge Functions.
3. **Auth-Delegation**: Die Edge Function validiert CORS-Origins und Payloads, bevor sie (mit ihrem internen Service Role Key) auf die Datenbank zugreift.

## Fazit für zukünftige Sprints
Bei jeder neuen Integration eines externen Dienstes (z.B. Analytics, Cloud-Storage) ist das "Gatekeeper-Prinzip" anzuwenden, um das Frontend key-frei zu halten.

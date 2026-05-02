# WP-012: Bug Report - WebGPU Shader Module

## Problembeschreibung
Auf schwächeren Rechnern kommt folgende Fehlermeldung im Browser (z.B. Chrome):

```text
Fehler: [Invalid ShaderModule (unlabeled)] is invalid due to a previous error.
- While validating compute stage ([Invalid ShaderModule (unlabeled)], entryPoint: "index_kernel").
```

Das ist ein klassischer Stolperstein in der Welt von WebGPU. Die Fehlermeldung ist ein wenig kryptisch, weil sie ein Folgefehler ist: Das ShaderModule ist ungültig, weil bei seiner Erstellung bereits etwas schiefgelaufen ist.

## Schlachtplan zur Fehlerbehebung

### 1. Den eigentlichen Fehler finden
Die Meldung `Invalid ShaderModule [...] due to a previous error` besagt nur, dass die Pipeline nicht erstellt werden konnte, weil der Shader-Code (WGSL) fehlerhaft war. Der eigentliche Fehler wurde vorher in die Konsole ausgegeben.

* Öffne die DevTools (F12) im Browser.
* Suche nach einer Meldung, die mit `WGSL validation error` beginnt.
* WebGPU ist hier sehr präzise und zeigt meistens genau die Zeile und den Grund (z. B. ein vergessenes Semikolon oder ein Typ-Mismatch).

### 2. Häufige Ursachen für `index_kernel` Fehler
Da der EntryPoint `index_kernel` heißt, wird vermutlich mit Arrays oder Puffern gearbeitet. Prüfe folgende Punkte im WGSL-Code:

* **Speicher-Layout:** Stimmen die `@group(X) @binding(Y)` Deklarationen mit dem `GPUBindGroupLayout` im JavaScript/TypeScript überein?
* **Buffer-Typen:** Wenn in einen Buffer geschrieben wird, muss er im Shader als `storage, read_write` deklariert sein.
* **Array-Indizes:** WGSL ist streng. Ein Zugriff auf `my_array[i]` erfordert oft, dass `i` ein `u32` (unsigned integer) ist. Falls `i` ein `i32` ist, muss umgewandelt werden: `my_array[u32(i)]`.

### 3. Debugging-Trick: `getCompilationInfo()`
Wenn die Konsole nicht hilft, können die Fehlermeldungen direkt vom Shader-Objekt abgefragt werden:

```javascript
const shaderModule = device.createShaderModule({
  code: deinWgslCode
});

// Füge dies nach der Erstellung hinzu:
const info = await shaderModule.getCompilationInfo();
if (info.messages.length > 0) {
  for (const message of info.messages) {
    console.error(`WGSL Fehler: ${message.message} in Zeile ${message.lineNum}`);
  }
}
```

### 4. Struktur eines gültigen Compute-Shaders
Stelle sicher, dass das Shader-Gerüst in etwa so aussieht:

* **Workgroup Size:** Steht `@compute @workgroup_size(x, y, z)` über der Funktion?
* **EntryPoint Name:** Wurde im JavaScript-Teil beim Erstellen der `computePipeline` wirklich exakt `"index_kernel"` als `entryPoint` angegeben? (Groß-/Kleinschreibung beachten!).

**Ein kurzer Check:** Wurden kürzlich Änderungen an den Bindings (Layouts) oder der Struktur der Daten-Buffer vorgenommen?

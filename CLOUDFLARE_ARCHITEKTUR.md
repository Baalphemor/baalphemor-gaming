# BAALPHEMOR GAMING — Cloudflare R2 Asset-CDN & Hub-Architektur (`baalphemor-gaming.de` & `auritan.de`)

**Status (05.11.2026):** ✅ **Cloudflare R2 Bucket `baalphemor-gaming-assets` aktiv & synchronisiert (`2.152 Dateien / 419 MB`)** | ✅ **Vite Slim-Build & Vercel-Backup-Bremse aktiv**

---

## 1. Architektur-Überblick (0 € Traffic / Zero Egress)

Unter dem Dach **`BAALPHEMOR GAMING`** ([baalphemor-gaming.de](https://baalphemor-gaming.de)) werden alle 4 eigenständigen Spiele (*Auritan: Vanguard*, *Auritan: Grid of Fate*, *Auritan: Broadside* [Maritime Flottenschlachten], *Auritan: Empires*) sowie Begleit-Tools über eine zweigeteilte Architektur ausgeliefert:

1. **Schwere 3D-/Grafik-/Video-/Audio-Assets (`~419 MB` -> Cloudflare R2 Bucket `baalphemor-gaming-assets`):**
   * Liegen im Cloudflare-Account (`7f60be7529a42d9552952da2f050849d`) im eigenen Bucket **`baalphemor-gaming-assets`** mit aktivierter WebGL-CORS-Freigabe (`GET/HEAD`, `Access-Control-Allow-Origin: *`, `Cache-Control: public, max-age=31536000, immutable`).
   * **0,00 € Egress-Kosten:** Egal wie viele Spieler gleichzeitig `.glb`-Modelle, Hex-Tiles oder Cutscenes laden.
   * **Inkrementeller Sync-Befehl:** `npm run sync:r2` (in `H:\Auritan\Auritan`, Skript `scripts/sync_r2_assets.py`) lädt nur neue/geänderte Assets in Sekunden nach.
2. **Ultraleichter Web- & Spiel-Client (`~15 MB` statt `430 MB` -> Slim-Build):**
   * Sobald beim Cloud-Build die Umgebungsvariable **`VITE_ASSET_CDN_URL`** gesetzt ist (z. B. `https://cdn.baalphemor-gaming.de` oder die R2-Public-URL `https://pub-xxxx.r2.dev`), lagert `scripts/auritan-cdn-build-plugin.js` die schweren Ordner (`models`, `tiles`, `cutscenes`, `items`, `portraits`, `ui`, `patreon`, `branding`) automatisch aus `dist/` aus und verdrahtet `fetch`, `XHR`, Three.js-TextureLoader (`crossOrigin="anonymous"`), CSS-URLs und `_redirects` direkt auf das R2-CDN.
   * Lokal am PC (`npm run dev`) bleibt ohne `VITE_ASSET_CDN_URL` alles zu 100 % offline-fähig aus `public/`.
3. **Git-Backup-Bremse für Vercel (`vercel.json`):**
   * Tägliche Git-Sicherungen (`chore(save): Abendsicherung ...`) werden durch `ignoreCommand` automatisch übersprungen (`0 MB` Deployment-Storage-Verbrauch).
   * Nur Commits mit **`[deploy]`** oder **`[release]`** in der Commit-Nachricht lösen einen Cloud-Build auf Vercel aus.

---

## 2. Einmalige 3-Klick-Freischaltung im Browser (Abschluss-Checkliste)

### Schritt 1: Öffentlichen Lesezugriff für `baalphemor-gaming-assets` in Cloudflare aktivieren
1. Im [Cloudflare Dashboard](https://dash.cloudflare.com/) links auf **R2 Object Storage** $\rightarrow$ Bucket **`baalphemor-gaming-assets`** $\rightarrow$ Tab **Settings** klicken.
2. **Variante A (Sofort ohne DNS-Umzug bei one.com):** Unter **Public Development URL (`r2.dev`)** auf **Allow Access** klicken und die angezeigte URL (`https://pub-xxxxxxxx.r2.dev`) kopieren.
3. **Variante B (Eigene Subdomain `cdn.baalphemor-gaming.de`):** Falls `baalphemor-gaming.de` über Cloudflare-DNS verwaltet wird, unter **Custom Domains** $\rightarrow$ **Connect Domain** `cdn.baalphemor-gaming.de` eintragen.

### Schritt 2: Spiel-Hub unter `BAALPHEMOR GAMING` verbinden (Cloudflare Pages oder Vercel)
* **Empfohlen — Cloudflare Pages (`play.baalphemor-gaming.de` / `vanguard.baalphemor-gaming.de`):**
  1. **Workers & Pages $\rightarrow$ Create $\rightarrow$ Pages $\rightarrow$ Connect to Git** $\rightarrow$ Repository `Baalphemor/auritan` wählen.
  2. Build Command: `npm run build` | Output Directory: `dist`.
  3. Environment Variable setzen: `VITE_ASSET_CDN_URL` = `<Deine URL aus Schritt 1>`.
  4. Bei `one.com` DNS einen `CNAME`-Eintrag `play` (bzw. `vanguard`) auf `<projektname>.pages.dev` setzen.

### Schritt 3: Altes Vercel-Team `baalphemor-auritan` aufräumen & umbenennen
1. Auf [vercel.com/dashboard](https://vercel.com/dashboard) im Team **`baalphemor-auritan`** unter **Settings $\rightarrow$ General** den Team-Namen/Slug kostenlos auf **`baalphemor-gaming`** ändern.
2. Im Projekt `auritan` unter **Settings $\rightarrow$ Environment Variables** ebenfalls `VITE_ASSET_CDN_URL` eintragen.
3. Unter **Deployments** die alten ~16 historischen 430-MB-Deployments löschen (oder unter *Settings $\rightarrow$ Security & Privacy / Retention* begrenzen) $\rightarrow$ der **Deployment Storage fällt sofort von 75 % auf < 2 %**!

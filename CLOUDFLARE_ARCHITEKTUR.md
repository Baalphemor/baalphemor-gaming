# Cloudflare-Skalierungs-Architektur für `auritan.de` & `baalphemor-gaming.de`

Beide Portale sind bereits technisch so vorbereitet (`_headers`, statische Asset-Trennung, Git-Anbindung), dass sie bei steigendem Traffic, größeren 3D-Assets (`.glb`, Texturen, Audio) und zukünftigen Spiel-Releases nahtlos über **Cloudflare** betrieben werden können.

---

## 1. Warum Cloudflare für beide Spiele-Seiten ideal ist
* **0 € Traffic-/Bandbreiten-Kosten (Zero Egress):**
  * **Cloudflare Pages** bietet unbegrenzte Bandbreite für die Webseiten und WebGL-Frontends.
  * **Cloudflare R2** (den du bereits erfolgreich für das *Band-Portal* einsetzt!) berechnet **0,00 € für ausgehenden Traffic (Egress)** — selbst wenn tausende Spieler gleichzeitig große 3D-Miniaturen (`.glb`), Karten-Texturen und Soundtracks im Browser laden.
* **Globales Edge-Caching (`_headers` bereits integriert):**
  * Die Datei `_headers` im Projektstamm weist das Cloudflare-CDN automatisch an, Bilder, `.glb`-3D-Modelle und `.wasm`-Dateien mit maximaler Geschwindigkeit (`max-age=31536000, immutable`) direkt vom nächstgelegenen Serverknoten auszuliefern.

---

## 2. 2-Stufen-Plan für den Wechsel auf Cloudflare

### Stufe A: Aktuelle Pre-Launch-Phase (Sofort einsatzbereit)
* Beide Seiten (`auritan.de` & `baalphemor-gaming.de`) sind leichtgewichtig und laufen kostenfrei mit direktem Git-Deploy (`Baalphemor/auritan-landingpage` und `Baalphemor/baalphemor-gaming`).
* **Optionaler 1-Klick-Umzug auf Cloudflare Pages jederzeit möglich:**
  1. Im Cloudflare-Dashboard unter **Workers & Pages → Create → Pages → Connect to Git** die beiden Repositories `Baalphemor/auritan-landingpage` und `Baalphemor/baalphemor-gaming` auswählen.
  2. Custom Domains `auritan.de` bzw. `baalphemor-gaming.de` verbinden.

### Stufe B: Alpha-Phase ab 2027 (Große 3D-Assets & Hoher Spieler-Traffic)
* Sobald die spielbaren Three.js-/WebGL-Builds für *Auritan: Grid of Fate*, *Auritan: Broadside*, *Auritan: Empires* und *Auritan: Vanguard* live gehen:
  1. **Frontend & Spiel-Engine:** Laufen über **Cloudflare Pages** (`baalphemor-gaming.de` / `auritan.de`).
  2. **Große 3D-Modelle, Texturen & Audio-Pakete (> 25 MB pro Datei / mehrere GB gesamt):** Liegen in einem eigenen **Cloudflare R2 Bucket** (`baalphemor-gaming-assets`) unter der Subdomain `cdn.baalphemor-gaming.de` — mit **0 € Traffic-Kosten** bei beliebig vielen Spielern.

# SPEC: BAALPHEMOR GAMING — 3-Säulen-Portal & Miniaturen-Schmiede

> **Stand:** 13.11.2026 | **Sprache zum Start:** 100 % Deutsch (DACH-Fokus, authentischer Gründer-Auftritt; spätere Internationalisierung vorbereitet)  
> **Ziel-Domains & Pfade:** `baalphemor-gaming.de` (`H:\Auritan\Auritan\marketing\baalphemor-gaming\`) + lokaler RTX-4080-Schmiede-Worker (`H:\3D-Modelle\miniaturen_schmiede\` & `H:\3D-Modelle\tts_forge_prototype\`)

---

## 1. Neue 3-Säulen-Struktur auf `baalphemor-gaming.de`

Die Startseite von **BAALPHEMOR GAMING** wird aufgeräumt, persönlich und komplett auf Deutsch in **drei klar getrennte Erlebnis-Welten** gegliedert:

| Bereich auf der Startseite | Positionierung & Tonfall | Inhalte |
| :--- | :--- | :--- |
| **1. Mein Herzens- & Langzeitprojekt** | Episch, tiefgründig, jahrelange Weltenschöpfung | **Die Welt von Auritan** (*Auritan: Vanguard*, *Grid of Fate*, *Seuchenwacht*, Lore & Playtests) |
| **2. Kleinere Spielereien für zwischendurch** | Ehrlich, direkt spielbar, experimentierfreudig | Eigenständige kompakte Spiele & Projekte (u. a. **Maritime Flottenschlachten** als eigenständiges Spiel, WC3-Erkundung, kompakte Action-Titel) |
| **3. Die große virtuelle Tabletop-Schmiede** | Praktischer Problemlöser von einem echten Tabletop-Nerd für Spieler & Spielleiter | **Phase 1:** All-VTT-Konverter & Digitaler Malkasten (TTS + Foundry VTT 3D + 2D-Token)<br>**Phase 2:** Eigener modularer Charakter-Baukasten (Druck-STL + VTT-Zwilling) |

---

## 2. Authentisches Gründer-Video & Shorts-Konzept („Vor der echten Vitrine“)

Direkt im Bereich **Tabletop-Schmiede** (und optional kompakt auf der Startseite) wird ein ehrliches, sympathisches **60–75-Sekunden-Gründervideo** eingebettet – ohne Hochglanz-Agentursprech, gefilmt direkt vor Michaels echter Miniaturen-Vitrine.

### Leitfaden / Sprechtext-Gerüst (Frei & natürlich eingesprochen)
1. **Einstieg vor der Vitrine (0–15 Sek.):**
   *„Hey Leute, ich bin Baal von BAALPHEMOR. Viele kennen mich über Musik, Fotografie und Videoproduktion – aber privat bin ich seit Jahren vor allem eins: ein riesiger Tabletop- und Rollenspiel-Nerd.“* *(Kamera-Schwenk über die echten bemalten Miniaturen in der Vitrine).*
2. **Das echte eigene Ärgernis (15–35 Sek.):**
   *„Ich spiele nicht nur physisch am Tisch, sondern auch viel digital. Und dabei hat mich eine Sache immer wahnsinnig gemacht: Du kaufst oder baust dir coole digitale Figuren oder 3D-Druckdateien – und dann hängst du in einem einzigen System fest, die Datei sprengt dir wegen Millionen Polygonen den Spieltisch, ist komplett farblos grau, oder dir gefällt das alte Farbschema deiner Figur nicht mehr.“*
3. **Die Lösung aus der eigenen Werkstatt (35–60 Sek.):**
   *„Aus genau diesem Frust baue ich an meiner eigenen digitalen Miniaturen-Schmiede – und öffne die jetzt auch für euch: Ihr gebt eure Figuren rein und bekommt sie sauber aufbereitet für Tabletop Simulator, für Foundry VTT in 3D und sogar direkt als 2D-Token zurück. Auf Wunsch im edlen Schatten-Wash oder komplett neu nach euren Wunschfarben umgefärbt.“* *(Kurze Einblendung des Vorher/Nachher-Drachen & Ritters).*
4. **Einladung / Call-to-Action (60–75 Sek.):**
   *„Ladet euch unten kostenlos die Beispiel-Figuren für euren Spieltisch runter – oder schickt eure erste Heldengruppe direkt durch den Schmiedeofen!“*

### Kanal-Verteilung (gemäß fester Kanal-Struktur)
* **Homepage (`baalphemor-gaming.de`):** Direkt eingebettetes Hauptvideo (`-pix_fmt yuv420p -movflags +faststart`, selbst gehostet über das kostenlose Cloudflare-R2-CDN `baalphemor-gaming-assets` ohne YouTube-Werbeeinblendungen!).
* **`[5]` Baalphemor Gaming (`@Baalphemorgaming`):** Hauptkanal für Vorher/Nachher-Shorts (*„70-MB-STL → fertige Figur in Tabletop Simulator & Foundry VTT“*).
* **`[6]` BAALPHEMOR Hauptkanal (`@baalphemor`):** Einmaliges persönliches Gründer-/Making-of-Video (*„Warum ich neben Konzertfilmen jetzt eine digitale Tabletop-Schmiede gebaut habe“*), ohne die Musik-Abonnenten mit Dauer-Posts zu fluten.
* *(`[4]` Auritan bleibt zu 100 % frei für reine Balurea-Lore & Hörbücher.)*

---

## 3. Prüfung des Zahlungssystems: Stripe vs. Systemwechsel (Lemon Squeezy)

Abgleich mit dem heutigen D2C-Audit (`H:\Cinderbane\docs\D2C_RELEASE_AUDIT.md`) für die konkrete Mechanik der Tabletop-Schmiede (**Einmalzahlung + Münz-Tresor + individuelle 72h/+48h-Umbauaufträge**):

| Prüfpunkt | **Stripe direkt** *(wie in `BandPortal` vorhanden)* | **Lemon Squeezy** *(Merchant of Record, wie für `Cinderbane` geprüft)* |
| :--- | :--- | :--- |
| **Gebühren bei 5,49 € – 13,49 € Warenkörben** | ✅ **Sehr günstig:** `1,5 % + 0,25 €` (EU-Karten/Apple Pay/Google Pay/SEPA) → nur **~0,33 €** bei einem 5,49-€-Münzbeutel (~6 %). | ⚠️ **Deutlich teurer bei Kleinpaketen:** `5 % + 0,50 USD` (+ ggf. 1,5 % PayPal/Währung) → **~0,75–0,90 €** Abzug (~14–16 %). |
| **Erlaubnis für „Wunschfarben-Service“ & Münz-Guthaben** | ✅ **100 % erlaubt:** Sowohl individuelle Digital-Dienstleistungen (72h/+48h Umbau) als auch Prepaid-Münzpakete & Aktionscodes sind problemlos zulässig. | ❌ **AGB-Risiko bei Auftragsarbeit:** *Merchant-of-Record*-Plattformen erlauben fertige Software-Downloads (*wie Cinderbane!*), lehnen aber individuelle Auftrags-Dienstleistungen (*Bespoke Services*) und eigene Wallet-Währungen oft in der Prüfung ab. |
| **Steuer-Aufwand beim DACH-Start (`§ 19 UStG`)** | ✅ **Null Zusatzbürokratie zum Start:** In Deutschland greift dein `§ 19 UStG`-Status; für gelegentliche Käufer aus Österreich/EU gilt bis **10.000 € Netto/Jahr** Auslands-B2C-Umsatz offiziell das Ursprungslandprinzip (§ 3a Abs. 5 UStG = kein EU-OSS nötig!). | ✅ Führt weltweit Steuern automatisch ab – dieser Vorteil wird aber erst relevant, wenn wir später international >10.000 €/Jahr außerhalb Deutschlands umsetzen. |
| **Auszahlungs-Kette** | ✅ Kostenlose Euro-Auszahlung auf **N26 Business Standard** → saubere *Privatentnahme* auf **Trade Republic**. | ✅ SEPA-Auszahlung ab 50 USD Mindestbetrag auf **N26 Business Standard**. |

### Klare Empfehlung zum Zahlungssystem
1. **Für die Tabletop-Schmiede (Start auf Deutsch):** **Bei Stripe bleiben!** Du sparst bei kleinen 5,49-€- bis 13,49-€-Münzbeuteln mehr als die Hälfte der Gebühren, hast null AGB-Probleme wegen der +48h-Wunschfarben-Handarbeit, kannst deinen bewährten `stripe_service.js`-Code aus `BandPortal` direkt wiederverwenden und zahlst sauber auf dein **N26 Business Standard**-Konto aus.
2. **Späterer Internationaler Ausbau (>10.000 € EU/Weltweit):** Entweder *Stripe Tax + EU-OSS* zuschalten oder reine Selbstbedienungs-Pakete (Phase-2-Baukasten ohne Handarbeit) über *Lemon Squeezy* spiegeln.

---

## 4. Wo kommen die ersten echten Kunden her? (Beta-Deal & Foren-Fahrplan)

Da deine bestehenden Hauptkanäle stark auf Musik & Live-Produktion ausgerichtet sind, holen wir uns die ersten **20–30 echten Spielleiter & Wargamer** gezielt dort ab, wo sie täglich nach genau dieser Lösung suchen – über einen **ehrlichen Beta-Tauschdeal** statt platter Werbung:

### Der „Beta-Schmiede-Deal“ (Wird in Foren nicht als Werbung gelöscht!)
> **Angebot:** *„Ich suche **15 Spielleiter / Tabletop-Spieler** für den geschlossenen Beta-Test meiner deutschen VTT-Miniaturen-Schmiede. Ihr schickt mir bis zu **5 eigene STL-Figuren** (gerne auch schwierige Monster oder einen Helden mit Wunschfarben!) – ich baue sie euch **komplett kostenlos** für Tabletop Simulator, Foundry VTT (3D) und als 2D-Token um. Im Gegenzug füllt ihr mir nach dem Testen einen kurzen 4-Fragen-Feedbackbogen aus.“*

**Was dir diese 15 Beta-Tester einbringen:**
1. **Bis zu 75 echte Kunden-STLs aus freier Wildbahn**, mit denen wir jedes denkbare Sonderformat abhärten, bevor der erste zahlende Kunde kommt.
2. **Echte Vorher/Nachher-Beispiele & Kunden-Zitate** (*Social Proof*) für `baalphemor-gaming.de`.
3. **Mundpropaganda direkt in den Spielrunden:** Jeder Spielleiter zeigt seine neuen 3D-Figuren am Wochenende sofort 4–5 Mitspielern am virtuellen Tisch!
4. **Dankeschön-Gutschein:** Jeder Beta-Tester bekommt nach abgegebenem Feedback z. B. einen Aktionscode über `300 Bonus-Münzen` zum offiziellen Start.

### Die besten konkreten Anlaufstellen (DACH zuerst, danach International)

| Plattform / Community | Zielgruppe | Wie man dort postet (ohne Moderatoren-Ärger) |
| :--- | :--- | :--- |
| **1. Deutsche Foundry-VTT-Community (Discord & Forum)** | Extrem technikaffine deutsche Spielleiter (DSA, D&D, Pathfinder), nutzen oft *3D Canvas* & 2D-Tokens | Im Showcase-/Community-Projekte-Kanal Vorher/Nachher-Bild zeigen + 10 kostenlose Beta-Plätze für `.glb` & 2D-Tokens vergeben. |
| **2. Tanelorn-Forum (`tanelorn.net`) & Orkenspalter-Forum** | Größte klassische deutschsprachige Pen-&-Paper-Foren | Im Bereich *Virtuelle Spieltische / Eigene Projekte* persönlich vorstellen („Bin Fotograf & Rollenspieler, baue gerade ein Werkzeug...“). |
| **3. GW-Fanworld & TabletopWelt (`tabletopwelt.de`)** | Tausende deutsche Wargamer & 3D-Drucker-Besitzer mit Terabytes an gekauften Patreon-STLs | Fokus auf: *„Eure gekauften 3D-Druck-Armeen endlich ruckelfrei in Tabletop Simulator Probespielen & digital umfärben“*. |
| **4. Deutsche Pen-&-Paper-Subreddits & Discords** *(z. B. `r/DnDDeutsch`, `r/PenAndPaperDE`, große LFG-Server)* | Junge Online-Spielleiter auf Roll20, Foundry VTT & TTS | Kurzes 15-Sekunden-GIF (Graue STL → Farbiger Ritter/Drache) + Aufruf für kostenlose Beta-Tester. |
| **5. Später International (`r/tabletopsimulator`, `r/FoundryVTT`, `r/PrintedMinis`)** | Weltweiter Massenmarkt | Sobald die englische Sprachumschaltung steht: Vorher/Nachher-Showcase im wöchentlichen *Self-Promo/Creation*-Thread. |

---

## 5. Technischer Lieferumfang pro Auftrag („All-VTT-Paket“)

Jeder Durchlauf von `tts_forge_pipeline.py` erzeugt vollautomatisch ein geordnetes Kunden-ZIP (`<figur>_ALL_VTT_PAKET.zip`):
1. `01_Tabletop_Simulator/` → `<slug>_SavedObject.json`, `<slug>_mesh.obj` (<16k Tris), `<slug>_collider.obj` (<180 Tris), 2K `diffuse.png` & `normal.png`.
2. `02_FoundryVTT_3D/` → `<slug>_foundry_vtt_3d.glb` (kompakte Einzeldatei inkl. PBR-Texturen für *Foundry VTT 3D Canvas*, *Tabletop Playground* & eigene Game-Engines).
3. `03_2D_Token_VTT/` → `<slug>_token_2d.webp` (`1024x1024` mit transparentem Hintergrund für 2D-Foundry VTT, Roll20 & Owlbear Rodeo).
4. `LIESMICH_ANLEITUNG.txt` → Kurze deutsche 3-Schritte-Einbauhilfe (markenrechtskonform formuliert).

### Preis- & Schutz-Regeln im Shop (Zusammenfassung)
* **Basis-Anker:** `1 Münze = 1 Cent` (`100 Münzen = 1,00 €`), Münzen verfallen nicht, Aktionscodes unterstützt.
* **Checkout-Wahlfreiheit:** Passgenaue **Einmal-Direktzahlung** (ab `2,99 €` Mindestwarenkorb) *oder* **Münz-Beutel mit Sofort-Rabatt** (`10 %` beim 1.500er Heldengruppen-Paket bis `25,5 %` beim 20.000er Armee-Tresor).
* **Zeitschutz für Michael:**
  * Bis 15 Figuren: Richtwert **bis zu 72 Std.** (*Wunschfarben: + 48 Std.*).
  * Großaufträge (ab 16 Figuren / Großpakete): Automatischer Staffel-Hinweis (*+24–48 Std. je weitere 25 Figuren*) + Teillieferung möglich.
  * **1-Klick Auslastungs-Ampel** oben im Shop (🟢 Frei | 🟡 Hohe Auslastung | 🔴 Dreh-/Festival-Pause).

---

## Handoff

* **Fertiggestellt & Verifiziert (12.11.2026):**
  * **Hauptportal (`index.html` & `style.css`):** Vollständig in die 3 deutschen Hauptsäulen gegliedert (*1. Langzeitprojekt Auritan: Vanguard*, *2. Kleinere Spielereien für zwischendurch* mit *Maritime Flottenschlachten* strikt als eigenständigem Spiel, *3. Virtuelle Tabletop-Schmiede [BETA]*).
  * **Schmiede-Unterseite & Live-3D-Erschaffungsmodul (`schmiede/index.html`, `schmiede/schmiede.css`, `schmiede/schmiede.js`):**
    * Durchgängig als **BETA** gekennzeichnet (Header-Badge, durchgängiges `.forge-beta-ribbon`, Hero- & Baukasten-Badges).
    * **100 % lokales DSGVO-konformes WebGL/Three.js-Studio** mit 4 interaktiven Modulen: (1) *Tabletop-Marker & Tokens* zum Live-Beschriften (inkl. Feuer-Symbol, Spielleiter-Schild, Totenkopf, Obelisk, Schild, Sci-Fi-Bake), (2) *Landmarken & Flaggen mit Wappen & Spruchband*, (3) *Maßgeschneiderte Schreibtische, Bücher-/Rüstungsschränke & Sci-Fi-Kommandotische/Spinde*, (4) *Figuren-Baukasten-Vorschau* (Mensch, Zwerg, Elf, Oger, Löwenkopf-Krieger, Sci-Fi-Gardist).
    * **Echter Client-Direktexport:** Kostenloser `.STL`-Download (exakter Millimeter-Maßstab + Z-up für Slicer), `.GLB`-Download (kompatibel mit Foundry VTT 3D) und `.PNG`-Schnappschuss.
    * **Münz- & Direktzahlungs-Rechner + Großauftrags-Schutz:** Einmalzahlung vs. nicht verfallende Münzpakete (`600` bis `20.000` Münzen), Aktionscodes (`SCHMIEDESTART` / `BAAL10` / `AURITAN`), `bis 72 Std.` (+48 Std. Wunschfarben) sowie automatische Wellen-Warnung ab `>15` Figuren.
    * **Gratis-Musterpaket (`BAALPHEMOR_Muster_Ritter_All_VTT.zip`) & 15-Plätze-Beta-Formular** an `https://www.band-portal.de/api/waitlist` + `localStorage`-Backup angebunden.
  * **0-Token Pre-Flight Linter (`scripts/portal_lint.mjs`):** Prüft JS-Syntax, lokale HTML-Links/Assets, DOM-IDs, Markenkanon (`BAALPHEMOR`, `Miniaturen-Schmiede`, eigenständige Flottenschlachten) und ES-Modul-`DOMContentLoaded`-Sicherheit (`Exit Code 0`).
* **Update & Gesamt-Konsolidierung (13.11.2026):**
  * Durchgängige Umbenennung auf **`Miniaturen-Schmiede`** über alle Seiten, Metadaten, Formulare und Linter-Regeln.
  * Neuer Tab **„1. Eigene Datei prüfen & umbauen (360°)“** mit lokalem `.STL`/`.OBJ`/`.GLB`-Viewer (DSGVO-konform im Browser) + schlanker Fokus auf die **3 vollautomatischen Standard-Transformationen** (*All-VTT & Wunschfarben*, *Living-Miniature-Atmung*, *Dual-STL mit frontfreien Auto-Baumstützen*).
  * Lokale 1-Klick-Auftrags-Werkbank unter `H:\3D-Modelle\miniaturen_schmiede\` (`miniaturen_schmiede_auftrag.py`, `Miniaturen_Schmiede_Auftrag_Starten.cmd`, `SPEC.md`, `AGENTS.md`, `BEDIENUNGSANLEITUNG_BAAL.md`) inkl. interner 72h-Reserve für Monster/Spinnen/Scans (`--groesse auto`, `--sockel_abschneiden`, `--ki_scan_fix` & Colab-A100 `MoCapAnything V2`) fest eingerichtet; eigene Spiel-Exporte nachrangig geparkt.
* **Nächste optionale Ausbauschritte:**
  1. Vorstellungsvideo („Baal vor der Miniaturen-Vitrine“) drehen und in `assets/schmiede/` hinterlegen.
  2. Erste 15 Gratis-Beta-Tester über Tanelorn, Drachenzwinge, deutschen Foundry-VTT-Discord und TabletopWelt einladen.
  3. Nach Beta-Feedback: Stripe-Checkout (`Stripe -> N26 Business Standard -> Privatentnahme Trade Republic`) live schalten und sukzessive eigene Blender-Einzelteile in den Figuren-Baukasten einspeisen.

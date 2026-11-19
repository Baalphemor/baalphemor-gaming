#!/usr/bin/env node
// ========================================================
// BAALPHEMOR GAMING — 0-Token Pre-Flight Portal & Schmiede Linter
// Prüft Links, DOM-IDs, Markenkanon & ES-Module DOMContentLoaded-Races
// ========================================================

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

let errors = 0;
function fail(msg) {
  console.error(`❌ [FAIL] ${msg}`);
  errors++;
}
function pass(msg) {
  console.log(`✅ [OK]   ${msg}`);
}

// 1. JS Syntax Check
for (const relJs of ['script.js', 'schmiede/schmiede.js', 'vtt/owlbear/baalphemor-vault/vault.js']) {
  const fullJs = path.join(ROOT, relJs);
  try {
    execFileSync(process.execPath, ['--check', fullJs], { stdio: 'pipe' });
    pass(`Syntax gültig: ${relJs}`);
  } catch (err) {
    fail(`Syntaxfehler in ${relJs}: ${err.message}`);
  }
}

// 2. HTML Asset- & Link-Integrität + Markenkanon + SL-Supporter-Liste Migration
if (fs.existsSync(path.join(ROOT, 'loyalitaet'))) {
  fail('Veralteter Ordner "loyalitaet/" existiert noch auf baalphemor-gaming (muss entfernt sein; Umzug nach baalphemor.de/supporter-liste/)');
} else {
  pass('Alte Unterseite loyalitaet/ sauber entfernt (Umzug nach baalphemor.de/supporter-liste/)');
}

for (const relHtml of ['index.html', 'schmiede/index.html', 'datenschutz/index.html', 'impressum/index.html']) {
  const fullHtml = path.join(ROOT, relHtml);
  if (!fs.existsSync(fullHtml)) {
    fail(`HTML-Datei fehlt: ${relHtml}`);
    continue;
  }
  const html = fs.readFileSync(fullHtml, 'utf8');
  const dir = path.dirname(fullHtml);
  const refs = [...html.matchAll(/(?:src|href)=["']([^"'#?]+)(?:[?#][^"']*)?["']/g)].map((m) => m[1]);
  let missingCount = 0;
  for (const r of refs) {
    if (!r || /^(https?:|mailto:|tel:|javascript:)/.test(r)) continue;
    let target = path.resolve(dir, r);
    if (r.endsWith('/')) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) {
      fail(`${relHtml}: totes Ziel "${r}" (${target})`);
      missingCount++;
    }
  }
  if (missingCount === 0) pass(`${relHtml}: alle ${refs.length} lokalen Links & Assets vorhanden`);

  // In-Page-Anker-Integrität (keine toten #hash-Sprungziele im aktiven DOM)
  const activeHtml = html.replace(/<!--[\s\S]*?-->/g, '');
  const pageIds = new Set([...activeHtml.matchAll(/\bid=["']([^"']+)["']/g)].map((m) => m[1]));
  const hashTargets = [...new Set([...activeHtml.matchAll(/href=["']#([^"']+)["']/g)].map((m) => m[1]))];
  const brokenHashes = hashTargets.filter((h) => !pageIds.has(h));
  if (brokenHashes.length > 0) {
    fail(`${relHtml}: tote In-Page-Anker gefunden: #${brokenHashes.join(', #')}`);
  }

  // Markenkanon-Check (keine STT-Varianten im sichtbaren Text, kein "Minispiel" bei Flottenschlachten)
  const visibleText = activeHtml.replace(/<[^>]+>/g, ' ');
  if (/\b(Balfomor|Balvemor|Balfemor|Balphamor)\b/i.test(visibleText)) {
    fail(`${relHtml}: fehlerhafte Markenschreibweise gefunden (Pflicht: BAALPHEMOR)`);
  }
  if (/Flottenschlachten[\s\S]{0,160}Minispiel/i.test(visibleText)) {
    fail(`${relHtml}: Maritime Flottenschlachten dürfen niemals als Minispiel bezeichnet werden`);
  }
  if (/Tabletop-Schmiede/i.test(visibleText)) {
    fail(`${relHtml}: Veralteter Name "Tabletop-Schmiede" gefunden (Pflicht: Miniaturen-Schmiede)`);
  }
  if (/loyalitaet/i.test(html)) {
    fail(`${relHtml}: Veralteter Link auf "loyalitaet" gefunden (Pflicht: https://www.baalphemor.de/supporter-liste/)`);
  }
  if (/discord/i.test(html)) {
    fail(`${relHtml}: Veralteter Discord-Verweis gefunden`);
  }
  if (/(?:portal-signup-form|lead-capture-section|PRE-LAUNCH VORMERKUNG|#alpha\b|#rigging-box\b)/i.test(html)) {
    fail(`${relHtml}: Veraltete Portal-Warteschlange / Pre-Launch-Vormerkung gefunden (muss entfernt sein)`);
  }
}

const rootScriptJs = fs.readFileSync(path.join(ROOT, 'script.js'), 'utf8');
if (/(?:portal-signup-form|baalphemor_gaming_leads|syncHistoricalLeads)/i.test(rootScriptJs)) {
  fail('script.js enthält noch veralteten Portal-Warteschlangen-Code');
} else {
  pass('script.js: Portal-Warteschlange sauber entfernt');
}

// 3. DOM-ID Abgleich zwischen schmiede/index.html und schmiede/schmiede.js
const schmiedeHtml = fs.readFileSync(path.join(ROOT, 'schmiede/index.html'), 'utf8');
const schmiedeJs = fs.readFileSync(path.join(ROOT, 'schmiede/schmiede.js'), 'utf8');
const htmlIds = new Set([...schmiedeHtml.matchAll(/id=["']([^"']+)["']/g)].map((m) => m[1]));
const jsIds = [...new Set([...schmiedeJs.matchAll(/getElementById\(["']([^"']+)["']\)/g)].map((m) => m[1]))];
const missingIds = jsIds.filter((id) => !htmlIds.has(id));
if (missingIds.length > 0) {
  fail(`schmiede.js referenziert fehlende DOM-IDs: ${missingIds.join(', ')}`);
} else {
  pass(`schmiede.js: alle ${jsIds.length} DOM-IDs in schmiede/index.html verifiziert`);
}

// 4. ES-Module DOMContentLoaded Race-Guard (diagnosing-bugs Regel)
if (
  schmiedeJs.includes("addEventListener('DOMContentLoaded'") &&
  !schmiedeJs.includes('document.readyState')
) {
  fail(
    'schmiede.js nutzt addEventListener("DOMContentLoaded") in einem ES-Modul ohne document.readyState-Guard (Race bei großen Three.js-Sub-Imports!)'
  );
} else {
  pass('schmiede.js: ES-Modul Initialisierung ist gegen DOMContentLoaded-Race geschützt');
}

// 5. Foundry VTT Hub & Manifest-Integrität (vtt/)
const vttCatalogPath = path.join(ROOT, 'vtt/catalog.json');
if (!fs.existsSync(vttCatalogPath)) {
  fail('vtt/catalog.json fehlt (VTT-Asset-Hub nicht initialisiert)');
} else {
  try {
    const catalog = JSON.parse(fs.readFileSync(vttCatalogPath, 'utf8'));
    pass(`vtt/catalog.json gültig (${(catalog.packages || []).length} registrierte VTT-Pakete)`);
    for (const pkg of catalog.packages || []) {
      const modJsonPath = path.join(ROOT, 'vtt/foundry/modules', pkg.id, 'module.json');
      if (!fs.existsSync(modJsonPath)) {
        fail(`Foundry-Manifest fehlt für ${pkg.id}: ${modJsonPath}`);
        continue;
      }
      const modJson = JSON.parse(fs.readFileSync(modJsonPath, 'utf8'));
      if (modJson.id !== pkg.id) {
        fail(`Manifest-ID-Mismatch in ${modJsonPath}: erwartet "${pkg.id}", gefunden "${modJson.id}"`);
      }
      if (modJson.title && modJson.title.length > 64) {
        fail(`Foundry-Titel in ${modJsonPath} überschreitet 64 Zeichen (${modJson.title.length})`);
      }
      const expectedManifestUrl = `https://baalphemor-gaming.de/vtt/foundry/modules/${pkg.id}/module.json`;
      if (modJson.manifest !== expectedManifestUrl) {
        fail(`Manifest-URL-Mismatch in ${modJsonPath}: erwartet "${expectedManifestUrl}", gefunden "${modJson.manifest}"`);
      }
      if (!modJson.protected) {
        const expectedZipRel = `vtt/foundry/modules/${pkg.id}/releases/v${modJson.version}/${pkg.id}-v${modJson.version}.zip`;
        const fullZipPath = path.join(ROOT, expectedZipRel);
        if (!fs.existsSync(fullZipPath)) {
          fail(`Öffentliches Foundry-Release-ZIP fehlt: ${expectedZipRel}`);
        } else {
          pass(`Foundry-Modul bereit: ${pkg.id} v${modJson.version} (${(fs.statSync(fullZipPath).size / (1024 * 1024)).toFixed(2)} MiB)`);
        }
      } else {
        pass(`Geschütztes Foundry-Manifest bereit: ${pkg.id} v${modJson.version} (protected=true)`);
      }
    }

    // 5b. Fantasy Grounds Starter .mod & Owlbear Rodeo 2.0 Vault Extension prüfen
    const fgStarterMod = path.join(ROOT, 'vtt/fantasygrounds/releases/v1.1.0/BAALPHEMOR_Hogrur_5E_Starter_v1.1.0.mod');
    if (!fs.existsSync(fgStarterMod)) {
      fail('Fantasy Grounds Starter .mod fehlt unter vtt/fantasygrounds/releases/v1.1.0/');
    } else {
      pass(`Fantasy Grounds Starter .mod bereit (${(fs.statSync(fgStarterMod).size / (1024 * 1024)).toFixed(2)} MiB)`);
    }

    const obrVaultDir = path.join(ROOT, 'vtt/owlbear/baalphemor-vault');
    const obrManifestPath = path.join(obrVaultDir, 'manifest.json');
    if (!fs.existsSync(obrManifestPath)) {
      fail('Owlbear Rodeo Vault manifest.json fehlt');
    } else {
      const obrMan = JSON.parse(fs.readFileSync(obrManifestPath, 'utf8'));
      if (obrMan.manifest_version !== 1 || !obrMan.action?.popover) {
        fail('Owlbear Rodeo manifest.json hat ungültiges Schema');
      } else if (obrMan.description && obrMan.description.length > 128) {
        fail(`Owlbear Rodeo manifest.json description überschreitet 128 Zeichen (${obrMan.description.length})`);
      } else {
        pass(`Owlbear Rodeo Vault Extension bereit: "${obrMan.name}" v${obrMan.version} (desc=${(obrMan.description || '').length}/128)`);
      }
      const vaultJs = fs.readFileSync(path.join(obrVaultDir, 'vault.js'), 'utf8');
      if (vaultJs.includes('DOMContentLoaded') && !vaultJs.includes('document.readyState')) {
        fail('vault.js nutzt DOMContentLoaded ohne document.readyState-Guard');
      }
      const pIndex = JSON.parse(fs.readFileSync(path.join(obrVaultDir, 'packs_index.json'), 'utf8'));
      for (const entry of (pIndex.packs || []).filter((p) => !p.disabled)) {
        const packDir = path.join(obrVaultDir, 'packs', entry.id);
        const packData = JSON.parse(fs.readFileSync(path.join(packDir, 'pack.json'), 'utf8'));
        if (packData.sfxSample && !fs.existsSync(path.join(packDir, packData.sfxSample))) {
          fail(`Owlbear Pack ${entry.id}: fehlende SFX-Datei ${packData.sfxSample}`);
        }
        for (const loc of Object.values(packData.locales || {})) {
          for (const act of loc.actors || []) {
            for (const relKey of ['tokenTopDown', 'tokenRound', 'portrait']) {
              if (act[relKey] && !fs.existsSync(path.join(packDir, act[relKey]))) {
                fail(`Owlbear Pack ${entry.id}: fehlendes Asset ${act[relKey]}`);
              }
            }
          }
        }
        pass(`Owlbear Vault Pack verifiziert: ${entry.id} (DE/EN/ES/FR Assets komplett)`);
      }
    }

    const headersTxt = fs.readFileSync(path.join(ROOT, '_headers'), 'utf8');
    if (!headersTxt.includes('owlbear.rodeo')) {
      fail('_headers erlaubt kein Iframe-Embedding für owlbear.rodeo (Pflicht für Owlbear Rodeo Extensions!)');
    } else {
      pass('_headers: Owlbear Rodeo Iframe-Freigabe & VTT-CORS aktiv');
    }
  } catch (err) {
    fail(`Fehler beim Prüfen von vtt/catalog.json: ${err.message}`);
  }
}

if (errors > 0) {
  console.error(`\n🛑 Portal-Linter fehlgeschlagen mit ${errors} Fehler(n).`);
  process.exit(1);
}
console.log('\n🟢 Alle 0-Token Pre-Flight-Prüfungen bestanden (Exit Code 0).');

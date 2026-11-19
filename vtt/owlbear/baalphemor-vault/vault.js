/**
 * BAALPHEMOR GAMING — Multi-Pack 5E Token & Statblock Vault for Owlbear Rodeo 2.0
 * Unterstützt DE / EN / ES / FR und skaliert 512x512 Large-Tokens automatisch auf 2x2 Felder (dpi: 256).
 * Neue Pakete (z. B. Grolme, Riese & Skelettriese, Der Offizier, Auritan) werden dynamisch über packs_index.json geladen.
 */

const UI_STRINGS = {
  de: {
    tabActors: '2×2 Tokens & Werte',
    tabRules: 'Spezies & Arsenal',
    spawnTopDown: '+ 2×2 Top-Down setzen',
    spawnRing: '+ 2×2 Ring-Token',
    details: 'Werteblock & Aktionen einblenden',
    obrLive: '🟢 Verbunden mit Owlbear Rodeo — 1-Klick 2×2 Spawn aktiv',
    obrPreview: 'Vorschau-Modus (in Owlbear Rodeo öffnet ein Klick den 2×2-Karten-Spawn)',
    spawnedMsg: (n) => `${n} (2×2 Groß) auf die Karte gesetzt!`,
    previewMsg: (n) => `Vorschau: Im aktiven Owlbear-Rodeo-Raum wird „${n}“ direkt als 2×2-Token platziert.`
  },
  en: {
    tabActors: '2×2 Tokens & Stats',
    tabRules: 'Species & Arsenal',
    spawnTopDown: '+ Spawn 2×2 Top-Down',
    spawnRing: '+ 2×2 Ring Token',
    details: 'Show Statblock & Actions',
    obrLive: '🟢 Connected to Owlbear Rodeo — 1-Click 2×2 Spawn ready',
    obrPreview: 'Browser Preview (inside Owlbear Rodeo, click spawns 2×2 tokens onto the map)',
    spawnedMsg: (n) => `Spawned ${n} (2×2 Large) onto the scene!`,
    previewMsg: (n) => `Preview mode: Inside Owlbear Rodeo, "${n}" spawns directly at 2×2 grid size.`
  },
  es: {
    tabActors: 'Fichas 2×2 y Estad.',
    tabRules: 'Especie y Arsenal',
    spawnTopDown: '+ Colocar 2×2 Cenital',
    spawnRing: '+ Ficha Anillo 2×2',
    details: 'Mostrar bloque de estadísticas',
    obrLive: '🟢 Conectado a Owlbear Rodeo — Despliegue 2×2 activo',
    obrPreview: 'Modo vista previa (en Owlbear Rodeo coloca la ficha 2×2 en el mapa)',
    spawnedMsg: (n) => `¡${n} (2×2 Grande) añadido al mapa!`,
    previewMsg: (n) => `Vista previa: En Owlbear Rodeo se coloca «${n}» en tamaño 2×2.`
  },
  fr: {
    tabActors: 'Jetons 2×2 & Stats',
    tabRules: 'Espèce & Arsenal',
    spawnTopDown: '+ Placer 2×2 Vue Dessus',
    spawnRing: '+ Jeton Anneau 2×2',
    details: 'Afficher profil et actions',
    obrLive: '🟢 Connecté à Owlbear Rodeo — Placement 2×2 actif',
    obrPreview: 'Mode aperçu (dans Owlbear Rodeo, place le jeton 2×2 sur la carte)',
    spawnedMsg: (n) => `${n} (2×2 Grande taille) placé sur la carte !`,
    previewMsg: (n) => `Aperçu : Dans Owlbear Rodeo, « ${n} » est placé directement en 2×2.`
  }
};

let OBR = null;
let buildImage = null;
let obrReady = false;

let packsIndex = [];
let activePackId = null;
let activePackData = null;
let activeLang = 'de';
let activeTab = 'actors';
let currentAudio = null;

function modStr(score) {
  const m = Math.floor((Number(score || 10) - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
}

function resolvePackAssetUrl(packId, relPath) {
  return new URL(`packs/${packId}/${relPath}`, window.location.href).href;
}

async function tryConnectOwlbearSdk() {
  const isEmbedded = window.self !== window.top || window.location.search.includes('obrref');
  if (!isEmbedded) return;
  try {
    const sdk = await import('https://esm.sh/@owlbear-rodeo/sdk@3.0.2');
    OBR = sdk.default;
    buildImage = sdk.buildImage;
    OBR.onReady(() => {
      obrReady = true;
      updateStatusBanner();
    });
  } catch (err) {
    console.warn('[BAALPHEMOR Vault] Owlbear SDK konnte nicht geladen werden:', err);
  }
}

function updateStatusBanner() {
  const el = document.getElementById('obr-status');
  if (!el) return;
  const t = UI_STRINGS[activeLang] || UI_STRINGS.en;
  if (obrReady) {
    el.textContent = t.obrLive;
    el.classList.add('live');
  } else {
    el.textContent = t.obrPreview;
    el.classList.remove('live');
  }
}

async function spawnTokenOnMap(actor, relTokenPath) {
  const t = UI_STRINGS[activeLang] || UI_STRINGS.en;
  const fullUrl = resolvePackAssetUrl(activePackId, relTokenPath);
  const gridCfg = activePackData?.gridCells || { imagePx: 512, obrDpi: 256 };

  if (!obrReady || !OBR || !buildImage) {
    const el = document.getElementById('obr-status');
    if (el) el.textContent = t.previewMsg(actor.name);
    return;
  }

  let spawnPos = { x: 0, y: 0 };
  try {
    const w = await OBR.viewport.getWidth();
    const h = await OBR.viewport.getHeight();
    spawnPos = await OBR.viewport.inverseTransformPoint({ x: w / 2, y: h / 2 });
  } catch (_) {
    // Fallback auf Szenen-Ursprung
  }

  const px = Number(gridCfg.imagePx || 512);
  const dpi = Number(gridCfg.obrDpi || 256); // 512px / 256 dpi = exakt 2x2 Felder (Large)!
  const item = buildImage(
    {
      width: px,
      height: px,
      url: fullUrl,
      mime: 'image/png'
    },
    {
      dpi,
      offset: { x: px / 2, y: px / 2 }
    }
  )
    .layer('CHARACTER')
    .position(spawnPos)
    .name(actor.name)
    .plainText(`${actor.name} (AC ${actor.ac} · HP ${actor.hp})`)
    .textItemType('LABEL')
    .build();

  await OBR.scene.items.addItems([item]);
  await OBR.notification.show(t.spawnedMsg(actor.name), 'SUCCESS');
}

function renderVault() {
  const container = document.getElementById('vault-content');
  if (!container || !activePackData) return;
  const t = UI_STRINGS[activeLang] || UI_STRINGS.en;
  const loc = activePackData.locales?.[activeLang] || activePackData.locales?.en;
  if (!loc) return;

  document.getElementById('pack-heading').textContent = loc.title;
  document.getElementById('tab-lbl-actors').textContent = t.tabActors;
  document.getElementById('tab-lbl-rules').textContent = t.tabRules;

  if (activePackData.upgradeLinks?.patreon) {
    document.getElementById('link-patreon').href = activePackData.upgradeLinks.patreon;
  }
  if (activePackData.upgradeLinks?.itchVtt) {
    document.getElementById('link-itch').href = activePackData.upgradeLinks.itchVtt;
  }

  container.innerHTML = '';

  if (activeTab === 'actors') {
    for (const actor of loc.actors || []) {
      const card = document.createElement('article');
      card.className = 'actor-card';

      const previewUrl = resolvePackAssetUrl(activePackId, actor.tokenTopDown);
      const abHtml = Object.entries(actor.abilities || {})
        .map(([k, v]) => `<div><strong>${k}</strong>${v} (${modStr(v)})</div>`)
        .join('');

      const featHtml = (actor.features || [])
        .map((f) => `<p><strong>${f.name}:</strong> ${f.desc}</p>`)
        .join('');

      card.innerHTML = `
        <div class="actor-top">
          <img class="token-preview" src="${previewUrl}" alt="${actor.name}" loading="lazy" />
          <div class="actor-meta">
            <h2>${actor.name}</h2>
            <div class="stat-badges">
              <span>AC ${actor.ac}</span>
              <span>HP ${actor.hp}</span>
              <span>CR ${actor.cr}</span>
              <span>2×2 Large</span>
              <span>${actor.speed}</span>
            </div>
          </div>
        </div>
        <div class="ability-strip">${abHtml}</div>
        <div class="spawn-row">
          <button type="button" class="btn-spawn" data-role="topdown">${t.spawnTopDown}</button>
          <button type="button" class="btn-spawn secondary" data-role="ring">${t.spawnRing}</button>
        </div>
        <details class="stat-drawer">
          <summary>${t.details}</summary>
          <div class="feature-list">${featHtml}</div>
        </details>
      `;

      card.querySelector('[data-role="topdown"]').addEventListener('click', () => {
        spawnTokenOnMap(actor, actor.tokenTopDown);
      });
      card.querySelector('[data-role="ring"]').addEventListener('click', () => {
        spawnTokenOnMap(actor, actor.tokenRound);
      });

      container.appendChild(card);
    }
  } else {
    for (const rule of loc.rules || []) {
      const rc = document.createElement('article');
      rc.className = 'rule-card';
      rc.innerHTML = `<h3>${rule.name}</h3><p>${rule.desc}</p>`;
      container.appendChild(rc);
    }
  }

  updateStatusBanner();
}

async function loadPack(packId) {
  activePackId = packId;
  const resp = await fetch(`packs/${packId}/pack.json`);
  if (!resp.ok) throw new Error(`Konnte packs/${packId}/pack.json nicht laden (${resp.status})`);
  activePackData = await resp.json();
  renderVault();
}

async function initVault() {
  tryConnectOwlbearSdk();

  document.querySelectorAll('#lang-bar button').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeLang = btn.dataset.lang;
      document.querySelectorAll('#lang-bar button').forEach((b) => b.classList.toggle('active', b === btn));
      renderVault();
    });
  });

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.toggle('active', b === btn));
      renderVault();
    });
  });

  document.getElementById('sfx-btn').addEventListener('click', () => {
    if (!activePackData?.sfxSample) return;
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    currentAudio = new Audio(resolvePackAssetUrl(activePackId, activePackData.sfxSample));
    currentAudio.volume = 0.85;
    currentAudio.play().catch(() => {});
  });

  const idxResp = await fetch('packs_index.json');
  const idxJson = await idxResp.json();
  packsIndex = idxJson.packs || [];

  const selectEl = document.getElementById('pack-select');
  selectEl.innerHTML = '';
  for (const p of packsIndex) {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.label;
    if (p.disabled) opt.disabled = true;
    selectEl.appendChild(opt);
  }
  selectEl.addEventListener('change', (e) => loadPack(e.target.value));

  const firstActive = packsIndex.find((p) => !p.disabled);
  if (firstActive) {
    await loadPack(firstActive.id);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVault);
} else {
  initVault();
}

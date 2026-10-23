// ========================================================
// BAALPHEMOR GAMING PORTAL (baalphemor-gaming.de)
// Style Switcher (Classic vs Modern Cockpit), Broadside Naval HUD Simulator,
// 2W12 Bell-Curve Simulator, Blueprint Modals & DSGVO Consent
// ========================================================

document.addEventListener('DOMContentLoaded', () => {

  // ========================================================
  // 1. UI STYLE (CLASSIC vs MODERN COCKPIT) & COLOR THEME SWITCHER
  // ========================================================
  const styleButtons = document.querySelectorAll('[data-set-style]');
  const themeDots = document.querySelectorAll('[data-set-theme]');

  function applyUiStyle(styleName) {
    const valid = styleName === 'modern' ? 'modern' : 'classic';
    document.body.setAttribute('data-ui-style', valid);
    styleButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-set-style') === valid);
    });
    try {
      localStorage.setItem('baalphemor_gaming_ui_style', valid);
    } catch (e) {}
  }

  function applyColorTheme(themeName) {
    const allowed = ['gold', 'nautical', 'crimson', 'cream'];
    const valid = allowed.includes(themeName) ? themeName : 'gold';
    document.body.setAttribute('data-color-theme', valid);
    themeDots.forEach(dot => {
      dot.classList.toggle('active', dot.getAttribute('data-set-theme') === valid);
    });
    try {
      localStorage.setItem('baalphemor_gaming_color_theme', valid);
    } catch (e) {}
  }

  try {
    const savedStyle = localStorage.getItem('baalphemor_gaming_ui_style');
    const savedTheme = localStorage.getItem('baalphemor_gaming_color_theme');
    if (savedStyle) applyUiStyle(savedStyle);
    if (savedTheme) applyColorTheme(savedTheme);
  } catch (e) {}

  styleButtons.forEach(btn => {
    btn.addEventListener('click', () => applyUiStyle(btn.getAttribute('data-set-style')));
  });

  themeDots.forEach(dot => {
    dot.addEventListener('click', () => applyColorTheme(dot.getAttribute('data-set-theme')));
  });

  // ========================================================
  // 2. DUAL SIMULATOR TABS (BROADSIDE vs 2W12)
  // ========================================================
  const simTabBtns = document.querySelectorAll('[data-sim-tab]');
  const panelBroadside = document.getElementById('sim-panel-broadside');
  const panelDice = document.getElementById('sim-panel-dice');

  function switchSimTab(tabKey) {
    simTabBtns.forEach(b => {
      const isTarget = b.getAttribute('data-sim-tab') === tabKey;
      b.classList.toggle('active', isTarget);
      b.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });
    if (panelBroadside && panelDice) {
      panelBroadside.style.display = tabKey === 'broadside' ? 'block' : 'none';
      panelDice.style.display = tabKey === 'dice' ? 'block' : 'none';
    }
  }

  simTabBtns.forEach(btn => {
    btn.addEventListener('click', () => switchSimTab(btn.getAttribute('data-sim-tab')));
  });

  document.querySelectorAll('[data-switch-sim]').forEach(link => {
    link.addEventListener('click', () => {
      switchSimTab(link.getAttribute('data-switch-sim'));
    });
  });

  // ========================================================
  // 3. AURITAN: BROADSIDE — INTERACTIVE NAVAL COMMAND HUD
  // ========================================================
  const stateBroadside = {
    shipClass: 'sail', // 'sail' | 'combustion'
    sailStage: 75,
    windAngle: 45,
    windLabel: 'NO (Raumschots)',
    combustion: 100,
    timeScale: 1.0,
    pose: 'Broadside',
    range: 'Medium',
    side: 'Both',
    subsystem: 'Decks & Geschütze',
    playerHull: 480,
    playerMaxHull: 500,
    repairMaterial: 140,
    enemyHull: 320,
    enemyMaxHull: 320,
    enemyCrew: 85,
    enemyFires: 0,
    isDriftingHulk: false
  };

  const logEl = document.getElementById('broadside-log');
  const speedReadout = document.getElementById('hud-speed-readout');
  const sailBox = document.getElementById('propulsion-sail-box');
  const combustionBox = document.getElementById('propulsion-combustion-box');
  const combustionVal = document.getElementById('combustion-val');
  const combustionBar = document.getElementById('combustion-bar');
  const playerHullVal = document.getElementById('player-hull-val');
  const playerHullBar = document.getElementById('player-hull-bar');
  const repairMatVal = document.getElementById('repair-mat-val');
  const enemyHpReadout = document.getElementById('enemy-hp-readout');
  const enemyHullBar = document.getElementById('enemy-hull-bar');
  const enemyCrewVal = document.getElementById('enemy-crew-val');
  const enemyFireVal = document.getElementById('enemy-fire-val');
  const enemyStateBadge = document.getElementById('enemy-state-badge');
  const combatActiveActions = document.getElementById('combat-active-actions');
  const driftingHulkActions = document.getElementById('drifting-hulk-actions');

  function logBroadside(msg) {
    if (logEl) logEl.innerHTML = msg;
  }

  function updateNavalTelemetry() {
    let baseKnots = 0;
    if (stateBroadside.shipClass === 'sail') {
      const windMultiplier = (stateBroadside.windAngle === 45 || stateBroadside.windAngle === 135) ? 1.2 : 0.9;
      baseKnots = ((stateBroadside.sailStage / 100) * 14 * windMultiplier);
    } else {
      baseKnots = 13.5;
    }
    if (speedReadout) {
      speedReadout.textContent = `${baseKnots.toFixed(1)} kn (${stateBroadside.timeScale === 0.15 ? 'NEAR_PAUSE 15%' : '1.0x'})`;
    }
    if (playerHullVal) playerHullVal.textContent = `${stateBroadside.playerHull} / ${stateBroadside.playerMaxHull} HP`;
    if (playerHullBar) playerHullBar.style.width = `${Math.round((stateBroadside.playerHull / stateBroadside.playerMaxHull) * 100)}%`;
    if (repairMatVal) repairMatVal.textContent = `${stateBroadside.repairMaterial} Einh.`;
    if (combustionVal) combustionVal.textContent = `${stateBroadside.combustion} %`;
    if (combustionBar) combustionBar.style.width = `${stateBroadside.combustion}%`;

    if (enemyHpReadout) enemyHpReadout.textContent = `${stateBroadside.enemyHull} / ${stateBroadside.enemyMaxHull} HP`;
    if (enemyHullBar) enemyHullBar.style.width = `${Math.round((stateBroadside.enemyHull / stateBroadside.enemyMaxHull) * 100)}%`;
    if (enemyCrewVal) enemyCrewVal.textContent = `${stateBroadside.enemyCrew} Matrosen`;
    if (enemyFireVal) enemyFireVal.textContent = `${stateBroadside.enemyFires}`;
  }

  // Ship Class Switch (Sail vs Combustion)
  document.querySelectorAll('[data-ship-class]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cls = btn.getAttribute('data-ship-class');
      stateBroadside.shipClass = cls;
      document.querySelectorAll('[data-ship-class]').forEach(b => b.classList.toggle('active', b === btn));
      if (sailBox && combustionBox) {
        sailBox.style.display = cls === 'sail' ? 'block' : 'none';
        combustionBox.style.display = cls === 'combustion' ? 'block' : 'none';
      }
      updateNavalTelemetry();
      logBroadside(cls === 'sail'
        ? '⛵ <strong>Flaggschiff „Sturm von Balurea“ aktiv:</strong> Steuerung über 5 Segelstufen (0–100 %) und dynamische Windrose.'
        : '⚙️ <strong>Arkan-Kreuzer „Eisenfaust“ aktiv:</strong> Unabhängig vom Wind! Nutze den Combustion-Gauge für Nachbrenner-Sprints und Not-Rückwärtsschub.');
    });
  });

  // Time Scale Switch (1.0x vs 0.15x NEAR_PAUSE)
  document.querySelectorAll('[data-timescale]').forEach(btn => {
    btn.addEventListener('click', () => {
      stateBroadside.timeScale = parseFloat(btn.getAttribute('data-timescale'));
      document.querySelectorAll('[data-timescale]').forEach(b => b.classList.toggle('active', b === btn));
      updateNavalTelemetry();
      logBroadside(stateBroadside.timeScale < 1
        ? '⏳ <strong>Taktische Zeitlupe (NEAR_PAUSE = 0.15x) aktiviert:</strong> Die Schlacht läuft in Zeitlupe weiter — perfekte Kontrolle für Breitseiten-Vektoren und Ziel-Subsysteme!'
        : '▶ <strong>Echtzeit-Gefechtstempo (1.0x) aktiv.</strong>');
    });
  });

  // 5 Sail Stages
  document.querySelectorAll('[data-sail]').forEach(btn => {
    btn.addEventListener('click', () => {
      stateBroadside.sailStage = parseInt(btn.getAttribute('data-sail'), 10);
      document.querySelectorAll('[data-sail]').forEach(b => b.classList.toggle('active', b === btn));
      updateNavalTelemetry();
      logBroadside(`⛵ <strong>Segelstufe auf ${stateBroadside.sailStage} % gesetzt:</strong> ${stateBroadside.sailStage === 25 ? 'Enger Wenderadius für präzise Artillerie-Duelle!' : stateBroadside.sailStage >= 75 ? 'Hohe Fahrt für Flankenmanöver!' : 'Ausgewogene Gefechtsfahrt.'}`);
    });
  });

  // Wind Shift Button
  const windBtn = document.getElementById('btn-shift-wind');
  const windArrow = document.getElementById('wind-arrow');
  const windBonusText = document.getElementById('wind-bonus-text');
  const windDirections = [
    { angle: 45, name: 'NO (Raumschots)', bonus: '+20 % Segelschub · Optimale Breitseiten-Lage' },
    { angle: 135, name: 'SO (Achterlicher Wind)', bonus: '+25 % Höchstgeschwindigkeit vor dem Wind' },
    { angle: 225, name: 'SW (Am Wind)', bonus: '-10 % Tempo · Kreuzen gegen die Dünung' },
    { angle: 315, name: 'NW (Steife Brise)', bonus: '+15 % Schub · Krängung erhöht Reichweite' }
  ];
  let windIdx = 0;

  if (windBtn) {
    windBtn.addEventListener('click', () => {
      windIdx = (windIdx + 1) % windDirections.length;
      const w = windDirections[windIdx];
      stateBroadside.windAngle = w.angle;
      if (windArrow) windArrow.style.transform = `rotate(${w.angle}deg)`;
      if (windBonusText) windBonusText.textContent = w.bonus;
      updateNavalTelemetry();
      logBroadside(`🌬️ <strong>Wind dreht auf ${w.name}:</strong> ${w.bonus}`);
    });
  }

  // Combustion Afterburner & Retro-Burn
  const btnAfterburner = document.getElementById('btn-afterburner');
  const btnRetroburn = document.getElementById('btn-retroburn');

  if (btnAfterburner) {
    btnAfterburner.addEventListener('click', () => {
      if (stateBroadside.combustion < 30) {
        logBroadside('⚠️ <strong>Combustion-Speicher zu niedrig!</strong> Kurz abkühlen lassen.');
        return;
      }
      stateBroadside.combustion = Math.max(0, stateBroadside.combustion - 35);
      updateNavalTelemetry();
      logBroadside('🚀 <strong>Nachbrenner gezündet (+60 % Schub):</strong> Die „Eisenfaust“ bricht mit voller Dampfkraft in die feindliche Flanke durch!');
    });
  }

  if (btnRetroburn) {
    btnRetroburn.addEventListener('click', () => {
      if (stateBroadside.combustion < 25) {
        logBroadside('⚠️ <strong>Nicht genug Druck für Not-Rückwärtsschub!</strong>');
        return;
      }
      stateBroadside.combustion = Math.max(0, stateBroadside.combustion - 25);
      updateNavalTelemetry();
      logBroadside('⚓ <strong>Not-Rückwärtsschub ausgelöst:</strong> Schaufelräder schlagen rückwärts — das Schiff bremst abrupt vor dem Riff ab!');
    });
  }

  // Hull Repair via repairMaterial
  const btnUseRepair = document.getElementById('btn-use-repair');
  if (btnUseRepair) {
    btnUseRepair.addEventListener('click', () => {
      if (stateBroadside.repairMaterial < 35) {
        logBroadside('⚠️ <strong>Nicht genug <code>repairMaterial</code>!</strong> Plündere ein <code>DriftingHulk</code>-Wrack.');
        return;
      }
      stateBroadside.repairMaterial -= 35;
      stateBroadside.playerHull = Math.min(stateBroadside.playerMaxHull, stateBroadside.playerHull + 45);
      stateBroadside.combustion = Math.min(100, stateBroadside.combustion + 30);
      updateNavalTelemetry();
      logBroadside('🔧 <strong>Zimmerleute im Einsatz (-35 <code>repairMaterial</code>):</strong> Rumpf-Sektoren um +45 HP abgedichtet!');
    });
  }

  // 3 BFGA2 Engagement Switches
  document.querySelectorAll('.bfga-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.getAttribute('data-switch');
      const val = btn.getAttribute('data-val');
      stateBroadside[group] = val;
      document.querySelectorAll(`.bfga-btn[data-switch="${group}"]`).forEach(b => b.classList.toggle('active', b === btn));
      logBroadside(`🧭 <strong>Gefechts-Schalter aktualisiert:</strong> Ausrichtung <em>${stateBroadside.pose}</em> · Distanz <em>${stateBroadside.range}</em> · Feuerseite <em>${stateBroadside.side}</em>.`);
    });
  });

  // 4 Targetable Subsystems
  document.querySelectorAll('.subsys-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      stateBroadside.subsystem = btn.getAttribute('data-subsys');
      document.querySelectorAll('.subsys-btn').forEach(b => b.classList.toggle('active', b === btn));
      logBroadside(`🎯 <strong>Feuerleitstand visiert Subsystem an:</strong> <em>${stateBroadside.subsystem}</em>.`);
    });
  });

  function triggerDriftingHulkState() {
    stateBroadside.isDriftingHulk = true;
    stateBroadside.enemyHull = 0;
    if (enemyStateBadge) {
      enemyStateBadge.textContent = 'DRIFTING HULK (WRACK)';
      enemyStateBadge.style.background = 'rgba(232, 194, 122, 0.25)';
      enemyStateBadge.style.color = '#e8c27a';
    }
    if (combatActiveActions) combatActiveActions.style.display = 'none';
    if (driftingHulkActions) driftingHulkActions.style.display = 'block';
    updateNavalTelemetry();
    logBroadside('⚓ <strong>GEGNER MANÖVRIERUNFÄHIG (<code>DriftingHulk</code>)!</strong> Die „Schwarze Pest“ treibt als physisches Hindernis im Meer. Entscheide jetzt: <strong>Wrack plündern</strong> für <code>repairMaterial</code> oder per <strong>Prisen-Kommando</strong> kapern!');
  }

  // Fire Broadside Action
  const btnFireBroadside = document.getElementById('btn-fire-broadside');
  if (btnFireBroadside) {
    btnFireBroadside.addEventListener('click', () => {
      if (stateBroadside.isDriftingHulk) return;
      const baseDmg = stateBroadside.pose === 'Broadside' ? 95 : 55;
      const rangeBonus = stateBroadside.range === 'Close' ? 25 : stateBroadside.range === 'Medium' ? 15 : 5;
      const totalDmg = baseDmg + rangeBonus + Math.floor(Math.random() * 20);

      stateBroadside.enemyHull = Math.max(0, stateBroadside.enemyHull - totalDmg);
      stateBroadside.enemyCrew = Math.max(12, stateBroadside.enemyCrew - Math.floor(totalDmg / 9));
      if (Math.random() > 0.4) stateBroadside.enemyFires += 1;
      stateBroadside.playerHull = Math.max(120, stateBroadside.playerHull - 14);
      stateBroadside.combustion = Math.min(100, stateBroadside.combustion + 15);

      if (stateBroadside.enemyHull <= 0) {
        triggerDriftingHulkState();
      } else {
        updateNavalTelemetry();
        logBroadside(`💥 <strong>Donnernde Breitseite (${stateBroadside.side} / ${stateBroadside.range})!</strong> <strong>-${totalDmg} HP</strong> Treffer auf <em>${stateBroadside.subsystem}</em> der „Schwarzen Pest“!`);
      }
    });
  }

  // Ram Attack Action
  const btnRamAttack = document.getElementById('btn-ram-attack');
  if (btnRamAttack) {
    btnRamAttack.addEventListener('click', () => {
      if (stateBroadside.isDriftingHulk) return;
      const ramDmg = stateBroadside.pose === 'Prow' ? 145 : 85;
      stateBroadside.enemyHull = Math.max(0, stateBroadside.enemyHull - ramDmg);
      stateBroadside.playerHull = Math.max(100, stateBroadside.playerHull - 28);
      stateBroadside.enemyCrew = Math.max(10, stateBroadside.enemyCrew - 18);

      if (stateBroadside.enemyHull <= 0) {
        triggerDriftingHulkState();
      } else {
        updateNavalTelemetry();
        logBroadside(`🔱 <strong>Rammsporn-Einschlag!</strong> Massiver kinetischer Aufprall verursacht <strong>-${ramDmg} Rumpfschaden</strong> und Leckagen beim Gegner!`);
      }
    });
  }

  // Salvage vs Prize Crew on DriftingHulk
  const btnSalvageHulk = document.getElementById('btn-salvage-hulk');
  const btnPrizeCrew = document.getElementById('btn-prize-crew');

  function respawnNewEnemy(afterMsg) {
    stateBroadside.isDriftingHulk = false;
    stateBroadside.enemyHull = stateBroadside.enemyMaxHull;
    stateBroadside.enemyCrew = 85;
    stateBroadside.enemyFires = 0;
    if (enemyStateBadge) {
      enemyStateBadge.textContent = 'NEUES ZIEL IN SICHT';
      enemyStateBadge.style.background = 'rgba(239, 68, 68, 0.18)';
      enemyStateBadge.style.color = '#f87171';
    }
    if (combatActiveActions) combatActiveActions.style.display = 'grid';
    if (driftingHulkActions) driftingHulkActions.style.display = 'none';
    updateNavalTelemetry();
    logBroadside(afterMsg);
  }

  if (btnSalvageHulk) {
    btnSalvageHulk.addEventListener('click', () => {
      stateBroadside.repairMaterial += 75;
      respawnNewEnemy('🪵 <strong>Wrack erfolgreich geplündert (+75 <code>repairMaterial</code> & Beutegold)!</strong> Ein weiteres feindliches Kriegsschiff läuft am Horizont ein.');
    });
  }

  if (btnPrizeCrew) {
    btnPrizeCrew.addEventListener('click', () => {
      respawnNewEnemy('⚔️ <strong>Prisen-Kommando erfolgreich!</strong> Die „Schwarze Pest“ wurde gekapert und segelt nun unter dem Banner deiner Flotte! Nächstes Feindschiff gesichtet.');
    });
  }

  // ========================================================
  // 4. AURITAN: GRID OF FATE — 2W12 BELL CURVE SIMULATOR
  // ========================================================
  const rollBtn = document.getElementById('roll-action-btn');
  const die1Box = document.getElementById('die-1');
  const die2Box = document.getElementById('die-2');
  const die1Val = document.getElementById('die-1-val');
  const die2Val = document.getElementById('die-2-val');
  const totalVal = document.getElementById('dice-total-val');
  const outcome8 = document.getElementById('outcome-8');
  const outcome12 = document.getElementById('outcome-12');
  const outcome14 = document.getElementById('outcome-14');

  function rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
  }

  function evaluateDefense(sum, vt, isCrit, isFumble) {
    const hit = sum >= vt;
    const margin = sum - vt;
    const eg = hit ? Math.floor(Math.max(0, margin) / 4) : 0;
    let statusText = hit ? '✅ Probe Gelingt' : '❌ Abgewehrt';
    let statusClass = hit ? 'is-hit' : 'is-miss';
    let hint = '';

    if (isFumble) {
      statusText = '☠️ Patzer (Doppel-1)';
      statusClass = 'is-miss';
      hint = 'Dramatischer Fehlschlag!';
    } else if (isCrit) {
      statusText = '💥 Kritischer Triumph (Doppel-12)';
      statusClass = 'is-hit';
      hint = 'Maximale Wirkung & Durchschlag!';
    } else if (hit) {
      if (eg >= 2) hint = '⚔️ Verheerender Durchschlag (+2 EG Bonusschaden)!';
      else if (eg === 1) hint = '⚔️ Starker Treffer (+1 EG Zusatzwirkung)';
      else hint = '🗡️ Regulärer Treffer (volle Grundwirkung)';
    } else {
      if (margin >= -2) hint = '🛡️ Knappe Parade (Streiftreffer-Grundwirkung)';
      else hint = '🛡️ Klinge gleitet an schwerer Rüstung ab';
    }

    const marginDisplay = margin >= 0 ? `+${margin}` : `${margin}`;
    return `
      <div class="outcome-status ${statusClass}">${statusText}</div>
      <div class="outcome-margin">Wurf <strong>${sum}</strong> vs VT ${vt} (Differenz: ${marginDisplay})</div>
      <div class="outcome-eg">
        <span class="eg-number">${hit ? (eg > 0 ? '+' + eg : '0') : '0'}</span>
        <span class="eg-text">Erfolgsgrad${eg === 1 ? '' : 'e'} (EG)</span>
      </div>
      <div class="outcome-hint">${hint}</div>
    `;
  }

  if (rollBtn) {
    rollBtn.addEventListener('click', () => {
      rollBtn.disabled = true;
      die1Box.classList.add('is-rolling');
      die2Box.classList.add('is-rolling');

      const rollInterval = setInterval(() => {
        die1Val.textContent = rollDie(12);
        die2Val.textContent = rollDie(12);
      }, 60);

      setTimeout(() => {
        clearInterval(rollInterval);
        const d1 = rollDie(12);
        const d2 = rollDie(12);
        const sum = d1 + d2;
        const isCrit = d1 === 12 && d2 === 12;
        const isFumble = d1 === 1 && d2 === 1;

        die1Val.textContent = d1;
        die2Val.textContent = d2;
        totalVal.textContent = sum;

        die1Box.classList.remove('is-rolling');
        die2Box.classList.remove('is-rolling');

        if (outcome8) outcome8.innerHTML = evaluateDefense(sum, 8, isCrit, isFumble);
        if (outcome12) outcome12.innerHTML = evaluateDefense(sum, 12, isCrit, isFumble);
        if (outcome14) outcome14.innerHTML = evaluateDefense(sum, 14, isCrit, isFumble);
        rollBtn.disabled = false;
      }, 550);
    });
  }

  // ========================================================
  // 5. GAME ARCHITECTURE BLUEPRINT MODALS
  // ========================================================
  const gameBlueprints = {
    'grid-of-fate': {
      title: '⚔️ Auritan: Grid of Fate — System-Architektur',
      html: `
        <h4>1. Die 2W12-Glockenkurve & Erfolgsgrade (EG)</h4>
        <p>Während ein klassischer W20 eine flache Zufallsverteilung (5 % pro Zahl) erzeugt, nutzt <strong>Auritan: Grid of Fate</strong> <code>2W12 + Fertigkeit vs. Verteidigung (VT)</code>. Der Erwartungswert liegt stabil bei 13. Jede volle <strong>4 Punkte Überhang</strong> über der Ziel-VT erzeugt <strong>+1 Erfolgsgrad (EG)</strong> für Durchschlag, Blutung oder Schildbruch.</p>
        <h4>2. Die 7-Hex-Rose & Kanten-Topologie</h4>
        <p>Bewegung, Sichtlinien (LoS), Flankenwinkel und Schildwälle werden auf einem echten 3D-Hex-Gitter berechnet. Gefolgsleute und Kriegshunde agieren über taktische Direktiven (<em>Schutzgarde</em>, <em>Flankenjagd</em>, <em>Durchbruch</em>).</p>
        <h4>3. Karawanen-Expeditionen & Tavernen-Zuflucht</h4>
        <p>Zwischen den Missionen verwaltest du im <em>Goldenen Greif</em> Vorräte, Wundheilung, Moral und Ausrüstung deines Trupps.</p>
        <div style="margin-top:18px;">
          <a href="https://auritan.de" target="_blank" rel="noopener" class="btn-primary btn-sm">Zur offiziellen Seite auritan.de ➔</a>
        </div>
      `
    },
    'broadside': {
      title: '⚓ Auritan: Broadside — BFGA2 Flottentaktik-Blueprint',
      html: `
        <h4>1. Eigenständiges Seekriegs-Hauptspiel unter BAALPHEMOR GAMING</h4>
        <p><strong>Auritan: Broadside</strong> verbindet das gefeierte Kommandobrücken-Gefühl aus <em>Battlefleet Gothic: Armada 2</em> mit maritimer Dark-Fantasy-Artillerie, Rammsporn-Physik und Segel-/Dampfantrieb.</p>
        <h4>2. Die 3 Gefechts-Schalter & Dualer Antrieb</h4>
        <ul>
          <li><strong>3 Engagement-Switches pro Schiff:</strong> <em>Broadside vs. Prow</em> (Breitseite oder Ramm-Jagd), <em>Close / Medium / Long Range</em> sowie <em>Backbord / Steuerbord / Beide</em>.</li>
          <li><strong>Segelschiffe:</strong> 5 diskrete Segelstufen (<code>0% / 25% / 50% / 75% / 100%</code>) gekoppelt an den dynamischen Windwinkel.</li>
          <li><strong>Ruder- & Arkan-Dampfschiffe:</strong> Windunabhängiger <strong>Combustion-Gauge</strong> für Nachbrenner-Sprints und Not-Rückwärtsschub.</li>
        </ul>
        <h4>3. 4 Krit-Subsysteme, repairMaterial & DriftingHulk-Wracks</h4>
        <p>Zerschieße gezielt <em>Deck/Türme</em>, <em>Takelage/Antrieb</em>, <em>Ruderanlage</em> oder <em>Feuerleitstand</em>. Gesunkene oder entvölkerte Schiffe bleiben als physische <code>DriftingHulk</code>-Wracks im Gefecht: Nutze sie als Deckung gegen feindliche Salven, plündere sie für <code>repairMaterial</code> oder schicke ein Prisen-Kommando zur Übernahme!</p>
      `
    },
    'empires': {
      title: '🏰 Auritan: Empires — Hex-4X & Regiment-Blueprint',
      html: `
        <h4>1. Organisches Hex-Stadtwachstum (HexVolume)</h4>
        <p>Inspiriert von <em>Fallen Enchantress: Legendary Heroes</em> wachsen Städte in <strong>Auritan: Empires</strong> organisch Hex für Hex über die strategische Weltkarte. Jedes erschlossene Hex besitzt ein Bau-Volumen (<code>HexVolume = 6 bis 10 Punkte</code>) für Schmieden, Befestigungen oder Arkantürme.</p>
        <h4>2. Dynamischer Frühwarn-Sichtradius</h4>
        <p>Mit jedem ausgebauten Stadt-Hex und Wachturm wächst der strategische Aufklärungsradius deiner Provinz, sodass feindliche Invasionsheere frühzeitig erkannt und abgefangen werden können.</p>
        <h4>3. Semi-Modularer Regiment-Baukasten (Dawn of War Anker)</h4>
        <p>Statt einzelner Klone rüstest du ganze Regimenter über <strong>4 bis 6+ Upgrade-Slots</strong> (Waffen, Rüstung, Banner, Kriegsgerät) aus, weist einen <strong>Offizier / Kommandanten</strong> zu (der neue Formationen & Spezialbefehle freischaltet) und führst sie über <strong>5+ Veteranen-Ränge</strong> in die 3D-Taktikschlacht.</p>
      `
    },
    'realms-of-war': {
      title: '🛡️ Auritan: Realms of War — WC3 Hero-RTS Blueprint',
      html: `
        <h4>1. Helden-Zentrum mit 6-Slot-Taktik-Inventar</h4>
        <p>Inspiriert von <em>Warcraft III</em> und <em>SpellForce</em> führst du 1–3 benannte Helden durch düstere Provinzen, räumst Creep-Camps, steigst Stufen auf (3 Grundfähigkeiten + Ultimate ab Stufe 6) und nutzt 6 aktive Artefakt-Slots.</p>
        <h4>2. Zweistufiger Fog of War & Tag-/Nacht-Mechanik</h4>
        <p>Unentdecktes Terrain bleibt tiefschwarz; bereits erkundetes Gebiet außerhalb der aktuellen Sichtweite zeigt die Topografie als abgedunkelte Erinnerung. Nachts sinkt die reguläre Sichtweite um 25 % und Monster-Lager schlafen.</p>
      `
    }
  };

  const blueprintModal = document.getElementById('modal-game-blueprint');
  const blueprintTitle = document.getElementById('modal-blueprint-title');
  const blueprintBody = document.getElementById('modal-blueprint-body');

  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('is-open');
    if (!document.querySelector('.modal-overlay.is-open')) {
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('.game-detail-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-game');
      const data = gameBlueprints[key];
      if (data && blueprintTitle && blueprintBody) {
        blueprintTitle.textContent = data.title;
        blueprintBody.innerHTML = data.html;
        openModal('modal-game-blueprint');
      }
    });
  });

  document.querySelectorAll('.modal-trigger').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = trigger.getAttribute('data-modal');
      if (targetId) openModal(targetId);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(modal => {
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(modal));
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.is-open').forEach(m => closeModal(m));
    }
  });

  // ========================================================
  // 6. MOBILE MENU & PLAYTESTER LEAD CAPTURE
  // ========================================================
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (mobileBtn && mobileDrawer) {
    mobileBtn.addEventListener('click', () => mobileDrawer.classList.toggle('is-open'));
    mobileDrawer.querySelectorAll('.mobile-link').forEach(l => {
      l.addEventListener('click', () => mobileDrawer.classList.remove('is-open'));
    });
  }

  const portalSignupForm = document.getElementById('portal-signup-form');
  const portalEmailInput = document.getElementById('portal-email-input');
  const portalFeedback = document.getElementById('portal-lead-feedback');

  if (portalSignupForm && portalEmailInput && portalFeedback) {
    portalSignupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = portalEmailInput.value.trim();
      if (!email) return;

      const selectedGames = Array.from(portalSignupForm.querySelectorAll('input[name="game_interest"]:checked'))
        .map(cb => cb.value);

      try {
        const raw = localStorage.getItem('baalphemor_gaming_leads');
        const list = raw ? JSON.parse(raw) : [];
        list.push({
          email,
          games: selectedGames,
          timestamp: new Date().toISOString(),
          source: 'baalphemor-gaming.de'
        });
        localStorage.setItem('baalphemor_gaming_leads', JSON.stringify(list));
      } catch (err) {}

      const gamesText = selectedGames.length > 0 ? selectedGames.join(', ') : 'Gesamtes BAALPHEMOR GAMING Portfolio';
      portalFeedback.innerHTML = `🎮 <strong>Vormerkung gespeichert:</strong> Deine Adresse (<em>${email}</em>) ist für Playtests & Updates vorgemerkt (<strong>${gamesText}</strong>).`;
      portalFeedback.style.display = 'block';
      portalEmailInput.value = '';
    });
  }

  // ========================================================
  // 7. COOKIE CONSENT BANNER
  // ========================================================
  const cookieBanner = document.getElementById('cookie-banner');
  const btnNecessary = document.getElementById('cookie-necessary-btn');
  const btnAcceptAll = document.getElementById('cookie-accept-all-btn');
  const btnOpenCookie = document.getElementById('open-cookie-settings-btn');

  function saveCookieChoice(choice) {
    try {
      localStorage.setItem('baalphemor_gaming_cookie_consent', JSON.stringify({
        choice,
        timestamp: new Date().toISOString()
      }));
    } catch (e) {}
    if (cookieBanner) cookieBanner.classList.remove('is-visible');
  }

  try {
    const existing = localStorage.getItem('baalphemor_gaming_cookie_consent');
    if (!existing && cookieBanner) {
      cookieBanner.classList.add('is-visible');
    }
  } catch (e) {}

  if (btnNecessary) btnNecessary.addEventListener('click', () => saveCookieChoice('necessary'));
  if (btnAcceptAll) btnAcceptAll.addEventListener('click', () => saveCookieChoice('all'));
  if (btnOpenCookie) {
    btnOpenCookie.addEventListener('click', (e) => {
      e.preventDefault();
      if (cookieBanner) cookieBanner.classList.add('is-visible');
    });
  }
});

// ========================================================
// BAALPHEMOR GAMING — MINIATUREN-SCHMIEDE & 3D-ERSCHAFFUNGSMODUL
// 100 % Lokales Three.js ES-Modul · Marker, Flaggen, Möbel & Figuren-Vorschau
// Inkl. echtem .STL- (mm-Maßstab) & .GLB-Direktexport, Münzrechner & Beta-API
// ========================================================

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { STLExporter } from 'three/addons/exporters/STLExporter.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const WAITLIST_API_URL = 'https://www.band-portal.de/api/waitlist';

// Farb- & Oberflächen-Paletten für alle 4 Baukasten-Kategorien
const PALETTES = {
  glutrot: {
    label: 'Glutrot, Schmiedeeisen & Messing',
    base: 0x1d1b1a,
    baseRim: 0x3a322c,
    primary: 0xa62119,
    secondary: 0x303238,
    accent: 0xd9a84e,
    wood: 0x4b301d,
    glow: 0xff5e1a,
    clothBg: '#6e1410',
    clothTrim: '#e5b85c',
    clothInk: '#fff3d6',
    roughness: 0.45,
    metalness: 0.35,
  },
  sundrop: {
    label: 'Edles Knochen-Sundrop',
    base: 0x1c1916,
    baseRim: 0x4a3e31,
    primary: 0xd8c39e,
    secondary: 0x9b825c,
    accent: 0xe6c887,
    wood: 0x7d6546,
    glow: 0xffd27d,
    clothBg: '#bfa67a',
    clothTrim: '#4a3822',
    clothInk: '#261b0e',
    roughness: 0.58,
    metalness: 0.12,
  },
  blau_rot: {
    label: 'Königsblau, Karmesinrot & Gold',
    base: 0x181a20,
    baseRim: 0x353b4a,
    primary: 0x1e4ea8,
    secondary: 0xa81c24,
    accent: 0xebbd52,
    wood: 0x543622,
    glow: 0x5ca4ff,
    clothBg: '#183b82',
    clothTrim: '#f0c35b',
    clothInk: '#ffffff',
    roughness: 0.4,
    metalness: 0.38,
  },
  eiche_eisen: {
    label: 'Dunkle Eiche, Leder & Eisenbeschlag',
    base: 0x191613,
    baseRim: 0x362d25,
    primary: 0x5c3a21,
    secondary: 0x3c4047,
    accent: 0xc59a4a,
    wood: 0x4a2e19,
    glow: 0xff9d2e,
    clothBg: '#3e2918',
    clothTrim: '#c59a4a',
    clothInk: '#f5e6c8',
    roughness: 0.65,
    metalness: 0.22,
  },
  arkan_cyan: {
    label: 'Sci-Fi Titanstahl & Holo-Cyan',
    base: 0x111722,
    baseRim: 0x24364d,
    primary: 0x2c394b,
    secondary: 0x1a2433,
    accent: 0x00e5ff,
    wood: 0x243040,
    glow: 0x00f0ff,
    clothBg: '#0d2538',
    clothTrim: '#00e5ff',
    clothInk: '#d6fcff',
    roughness: 0.32,
    metalness: 0.62,
  },
  giftgruen: {
    label: 'Seuchen-/Giftgrün & Dunkelbronze',
    base: 0x151a14,
    baseRim: 0x2f3b2b,
    primary: 0x3b6e28,
    secondary: 0x2d2b26,
    accent: 0x998242,
    wood: 0x3b3123,
    glow: 0x7cff36,
    clothBg: '#25421b',
    clothTrim: '#b59c52',
    clothInk: '#e8ffd9',
    roughness: 0.52,
    metalness: 0.28,
  },
  roh_grau: {
    label: 'Unbemaltes Rein-Clay / Harz-Grau (Qualitäts-Check)',
    base: 0x5e6268,
    baseRim: 0x6c7077,
    primary: 0x82878f,
    secondary: 0x737880,
    accent: 0x9499a1,
    wood: 0x7b8087,
    glow: 0xaab0b8,
    clothBg: '#767b82',
    clothTrim: '#9da3ab',
    clothInk: '#232629',
    roughness: 0.55,
    metalness: 0.06,
  },
  original_tex: {
    label: 'Original-Textur behalten (bei .GLB)',
    base: 0x1c1916,
    baseRim: 0x4a3e31,
    primary: 0xd8c39e,
    secondary: 0x9b825c,
    accent: 0xe6c887,
    wood: 0x7d6546,
    glow: 0xffd27d,
    clothBg: '#bfa67a',
    clothTrim: '#4a3822',
    clothInk: '#261b0e',
    roughness: 0.5,
    metalness: 0.1,
  },
};

const COIN_PACKS = [
  { id: 'pack_600', name: 'Schnupper-Beutel (600 Münzen · 8,5 % Rabatt)', coins: 600, eur: 5.49, discountPct: 8.5 },
  { id: 'pack_1500', name: 'Heldengruppen-Beutel (1.500 Münzen · 10 % Rabatt)', coins: 1500, eur: 13.49, discountPct: 10.0 },
  { id: 'pack_5000', name: 'Schlachtzug-Truhe (5.000 Münzen · 16 % Rabatt)', coins: 5000, eur: 41.99, discountPct: 16.0 },
  { id: 'pack_20000', name: 'Armee-Schatzkammer (20.000 Münzen · 25,5 % Rabatt)', coins: 20000, eur: 149.00, discountPct: 25.5 },
];

// ========================================================
// HILFSFUNKTIONEN FÜR PROZEDURALE TEXTUREN (BESCHRIFTUNG & WAPPEN)
// ========================================================
function createPlaqueTexture(rawText, pal, isSciFi = false) {
  const text = (rawText || '').trim().toUpperCase() || 'MARKER';
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 160;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = isSciFi ? '#071826' : pal.clothBg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = isSciFi ? '#00f0ff' : pal.clothTrim;
  ctx.lineWidth = 10;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 2;
  ctx.strokeRect(22, 22, canvas.width - 44, canvas.height - 44);

  // Nieten in den Ecken
  const rivets = [
    [30, 30], [canvas.width - 30, 30],
    [30, canvas.height - 30], [canvas.width - 30, canvas.height - 30],
  ];
  ctx.fillStyle = isSciFi ? '#00f0ff' : pal.clothTrim;
  for (const [rx, ry] of rivets) {
    ctx.beginPath();
    ctx.arc(rx, ry, 6, 0, Math.PI * 2);
    ctx.fill();
  }

  const fontSize = text.length > 12 ? 42 : (text.length > 8 ? 52 : 64);
  ctx.font = `700 ${fontSize}px "Oswald", "Cinzel", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.75)';
  ctx.shadowBlur = 8;
  ctx.fillStyle = isSciFi ? '#d8ffff' : pal.clothInk;
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 + 3);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function drawEmblemIcon(ctx, cx, cy, emblem, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (emblem === 'swords') {
    // Gekreuzte Schwerter + Lorbeerkranz
    ctx.beginPath();
    ctx.moveTo(-65, 65); ctx.lineTo(65, -65);
    ctx.moveTo(-45, 25); ctx.lineTo(-25, 45);
    ctx.moveTo(65, 65); ctx.lineTo(-65, -65);
    ctx.moveTo(45, 25); ctx.lineTo(25, 45);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 5, 84, 0.25 * Math.PI, 0.75 * Math.PI);
    ctx.stroke();
  } else if (emblem === 'lion') {
    // Stilisiertes Wappen-Löwenhaupt mit Krone
    ctx.beginPath();
    ctx.moveTo(-48, -52);
    ctx.lineTo(-32, -82);
    ctx.lineTo(0, -60);
    ctx.lineTo(32, -82);
    ctx.lineTo(48, -52);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 6, 56, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-18, -4, 7, 0, Math.PI * 2);
    ctx.arc(18, -4, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-22, 28);
    ctx.quadraticCurveTo(0, 46, 22, 28);
    ctx.stroke();
  } else if (emblem === 'skull_crown') {
    ctx.beginPath();
    ctx.arc(0, -8, 46, Math.PI, 0, false);
    ctx.lineTo(34, 36);
    ctx.lineTo(14, 36);
    ctx.lineTo(14, 54);
    ctx.lineTo(-14, 54);
    ctx.lineTo(-14, 36);
    ctx.lineTo(-34, 36);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-16, -6, 10, 0, Math.PI * 2);
    ctx.arc(16, -6, 10, 0, Math.PI * 2);
    ctx.fill();
  } else if (emblem === 'flame_chalice') {
    ctx.beginPath();
    ctx.moveTo(-44, 24);
    ctx.quadraticCurveTo(0, 68, 44, 24);
    ctx.lineTo(-44, 24);
    ctx.fill();
    ctx.fillRect(-10, 42, 20, 32);
    ctx.fillRect(-34, 70, 68, 12);
    ctx.beginPath();
    ctx.moveTo(0, -78);
    ctx.bezierCurveTo(42, -32, 34, 14, 0, 18);
    ctx.bezierCurveTo(-34, 14, -42, -32, 0, -78);
    ctx.fill();
  } else if (emblem === 'star_wing') {
    // Sci-Fi Sternenemblem
    for (let i = 0; i < 8; i++) {
      const ang = (i * Math.PI) / 4;
      const len = i % 2 === 0 ? 76 : 36;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(ang) * len, Math.sin(ang) * len);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Zwergische Schutzrune / Schild
    ctx.beginPath();
    ctx.moveTo(0, -76);
    ctx.lineTo(64, -32);
    ctx.lineTo(44, 52);
    ctx.lineTo(0, 82);
    ctx.lineTo(-44, 52);
    ctx.lineTo(-64, -32);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -48); ctx.lineTo(0, 52);
    ctx.moveTo(-34, -8); ctx.lineTo(34, -8);
    ctx.stroke();
  }

  ctx.restore();
}

function createBannerTexture(emblem, mottoRaw, pal, isSciFi = false) {
  const motto = (mottoRaw || '').trim().toUpperCase() || 'AURITAN';
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 768;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = isSciFi ? '#071c2c' : pal.clothBg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (isSciFi) {
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.16)';
    ctx.lineWidth = 2;
    for (let y = 0; y < canvas.height; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  ctx.strokeStyle = isSciFi ? '#00f0ff' : pal.clothTrim;
  ctx.lineWidth = 18;
  ctx.strokeRect(24, 24, canvas.width - 48, canvas.height - 48);

  ctx.lineWidth = 4;
  ctx.strokeRect(46, 46, canvas.width - 92, canvas.height - 92);

  drawEmblemIcon(ctx, canvas.width / 2, 300, emblem, isSciFi ? '#00f0ff' : pal.clothTrim);

  // Spruchband
  ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
  ctx.fillRect(62, 500, canvas.width - 124, 96);
  ctx.strokeStyle = isSciFi ? '#00f0ff' : pal.clothTrim;
  ctx.lineWidth = 5;
  ctx.strokeRect(62, 500, canvas.width - 124, 96);

  const fontSize = motto.length > 11 ? 40 : 52;
  ctx.font = `700 ${fontSize}px "Cinzel", "Oswald", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = isSciFi ? '#e0ffff' : pal.clothInk;
  ctx.fillText(motto, canvas.width / 2, 550);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// ========================================================
// HAUPT-INITIALISIERUNG (ES-MODUL-SICHER GEGEN DOMCONTENTLOADED-RACE)
// ========================================================
function initSchmiede() {
  const canvas = document.getElementById('forge-3d-canvas');
  if (!canvas) return;

  // Zustand des 3D-Baukastens & Kundendatei-Inspektors
  const state = {
    activeTab: 'kundendatei',
    autoSpin: true,
    wireframe: false,
    promoBonusPct: 0,
    promoCodeName: '',
    customerModel: null,
  };

  // Three.js Renderer, Szene & Kamera
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    preserveDrawingBuffer: true,
    alpha: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(38, 1.4, 0.1, 100);
  camera.position.set(0, 2.35, 4.35);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.set(0, 0.78, 0);
  controls.minDistance = 1.8;
  controls.maxDistance = 9.0;
  controls.maxPolarAngle = Math.PI * 0.49;

  // Beleuchtung (Warmes Schmiede-Keylight + kühles Rimlight)
  const hemiLight = new THREE.HemisphereLight(0xfff4dc, 0x1c1e29, 0.95);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xfff0d4, 2.1);
  keyLight.position.set(3.6, 5.8, 3.8);
  keyLight.castShadow = true;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.near = 0.5;
  keyLight.shadow.camera.far = 18;
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x6da8ff, 1.05);
  rimLight.position.set(-4.2, 3.2, -3.5);
  scene.add(rimLight);

  const warmFill = new THREE.PointLight(0xff8c3b, 0.75, 10);
  warmFill.position.set(-2.2, 1.1, 2.5);
  scene.add(warmFill);

  // Studio-Drehteller (bleibt außerhalb der Export-Gruppe!)
  const studioStageGroup = new THREE.Group();
  const stageDisc = new THREE.Mesh(
    new THREE.CylinderGeometry(2.35, 2.5, 0.06, 64),
    new THREE.MeshStandardMaterial({ color: 0x121115, roughness: 0.85, metalness: 0.15 })
  );
  stageDisc.position.y = -0.03;
  stageDisc.receiveShadow = true;
  studioStageGroup.add(stageDisc);

  const stageRing = new THREE.Mesh(
    new THREE.RingGeometry(1.92, 1.97, 64),
    new THREE.MeshBasicMaterial({ color: 0x5c4928, side: THREE.DoubleSide })
  );
  stageRing.rotation.x = -Math.PI / 2;
  stageRing.position.y = 0.002;
  studioStageGroup.add(stageRing);
  scene.add(studioStageGroup);

  // Reine Werkstück-Gruppe (exakt diese wird als .STL / .GLB exportiert!)
  const workpieceGroup = new THREE.Group();
  workpieceGroup.name = 'BAALPHEMOR_Schmiede_Werkstueck';
  scene.add(workpieceGroup);

  function resizeViewport() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const w = Math.max(280, Math.floor(rect.width));
    const h = 450;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resizeViewport();
  window.addEventListener('resize', resizeViewport);

  // Hilfsfunktionen zum sauberen Aufräumen alter Meshes/Texturen
  function clearGroup(group) {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child.children && child.children.length) clearGroup(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((m) => {
          if (m.map) m.map.dispose();
          m.dispose();
        });
      }
    }
  }

  function makeMat(color, pal, opts = {}) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: opts.roughness !== undefined ? opts.roughness : pal.roughness,
      metalness: opts.metalness !== undefined ? opts.metalness : pal.metalness,
      emissive: opts.emissive !== undefined ? opts.emissive : 0x000000,
      emissiveIntensity: opts.emissiveIntensity || 0,
      wireframe: state.wireframe,
      map: opts.map || null,
      side: opts.doubleSided ? THREE.DoubleSide : THREE.FrontSide,
    });
  }

  function buildWargameBase(shape, radiusUnits, pal) {
    const baseGroup = new THREE.Group();
    const segs = shape === 'hex' ? 6 : (shape === 'octagon' ? 8 : 48);
    const rotY = shape === 'hex' ? Math.PI / 6 : (shape === 'octagon' ? Math.PI / 8 : 0);

    const lowerLip = new THREE.Mesh(
      new THREE.CylinderGeometry(radiusUnits * 0.95, radiusUnits, 0.11, segs),
      makeMat(pal.base, pal, { roughness: 0.72, metalness: 0.15 })
    );
    lowerLip.position.y = 0.055;
    lowerLip.rotation.y = rotY;
    lowerLip.castShadow = true;
    lowerLip.receiveShadow = true;
    baseGroup.add(lowerLip);

    const upperTop = new THREE.Mesh(
      new THREE.CylinderGeometry(radiusUnits * 0.86, radiusUnits * 0.94, 0.05, segs),
      makeMat(pal.baseRim, pal, { roughness: 0.65, metalness: 0.22 })
    );
    upperTop.position.y = 0.135;
    upperTop.rotation.y = rotY;
    upperTop.castShadow = true;
    upperTop.receiveShadow = true;
    baseGroup.add(upperTop);

    return baseGroup;
  }

  // ========================================================
  // GENERATOR 1: TABLETOP-MARKER & MISSIONS-TOKENS
  // ========================================================
  function buildMarkerModel(pal) {
    const symbol = document.getElementById('marker-symbol').value;
    const baseShape = document.getElementById('marker-base-shape').value;
    const labelText = document.getElementById('marker-label-text').value;
    const sizeMm = parseInt(document.getElementById('marker-size-mm').value, 10) || 32;
    const isSciFi = symbol === 'scifi_beacon' || document.getElementById('ctrl-color-scheme').value === 'arkan_cyan';

    const scaleRatio = sizeMm / 32;
    const root = new THREE.Group();
    const radius = 0.72 * scaleRatio;

    const base = buildWargameBase(baseShape, radius, pal);
    root.add(base);

    // Beschriftete Front-Plakette am Sockel (schräg zum Spieler geneigt)
    const plaqueTex = createPlaqueTexture(labelText, pal, isSciFi);
    const plaqueHolder = new THREE.Group();
    plaqueHolder.position.set(0, 0.23, radius * 0.76);
    plaqueHolder.rotation.x = -0.45;

    const plaqueBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.86 * scaleRatio, 0.27 * scaleRatio, 0.07),
      makeMat(pal.accent, pal, { metalness: 0.55, roughness: 0.35 })
    );
    plaqueBack.castShadow = true;
    plaqueHolder.add(plaqueBack);

    const plaqueFace = new THREE.Mesh(
      new THREE.PlaneGeometry(0.81 * scaleRatio, 0.235 * scaleRatio),
      makeMat(0xffffff, pal, {
        map: plaqueTex,
        roughness: 0.35,
        metalness: 0.1,
        emissive: isSciFi ? 0x004455 : 0x000000,
        emissiveIntensity: isSciFi ? 0.5 : 0,
      })
    );
    plaqueFace.position.z = 0.038;
    plaqueHolder.add(plaqueFace);
    root.add(plaqueHolder);

    // 3D-Aufsatz je nach gewähltem Marker-Symbol
    const topper = new THREE.Group();
    topper.position.y = 0.16;

    if (symbol === 'fire') {
      // Holzscheite / Glutbett + mehrschichtige 3D-Flammenzungen
      for (let i = 0; i < 3; i++) {
        const log = new THREE.Mesh(
          new THREE.CylinderGeometry(0.07, 0.08, 0.68 * scaleRatio, 10),
          makeMat(pal.wood, pal, { roughness: 0.85 })
        );
        log.position.y = 0.08;
        log.rotation.z = Math.PI / 2;
        log.rotation.y = (i * Math.PI) / 3;
        log.castShadow = true;
        topper.add(log);
      }

      const flameSpecs = [
        { r: 0.31, h: 1.15, x: 0, z: 0, tiltX: 0.06, tiltZ: -0.05, col: pal.primary, glow: 0.35 },
        { r: 0.22, h: 0.86, x: -0.18, z: 0.08, tiltX: -0.12, tiltZ: 0.22, col: pal.accent, glow: 0.45 },
        { r: 0.20, h: 0.78, x: 0.19, z: -0.06, tiltX: 0.14, tiltZ: -0.24, col: pal.glow, glow: 0.55 },
        { r: 0.15, h: 0.58, x: 0.04, z: 0.16, tiltX: 0.2, tiltZ: 0.05, col: pal.accent, glow: 0.5 },
      ];
      for (const f of flameSpecs) {
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry(f.r * scaleRatio, f.h * scaleRatio, 14),
          makeMat(f.col, pal, {
            emissive: pal.glow,
            emissiveIntensity: document.getElementById('ctrl-color-scheme').value === 'roh_grau' ? 0 : f.glow,
            roughness: 0.32,
          })
        );
        cone.position.set(f.x * scaleRatio, (f.h * 0.48) * scaleRatio, f.z * scaleRatio);
        cone.rotation.set(f.tiltX, 0, f.tiltZ);
        cone.castShadow = true;
        topper.add(cone);
      }
    } else if (symbol === 'label_sign') {
      // Großer beidseitig lesbarer Spielleiter-Aufsteller
      const postL = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.065, 1.08, 12),
        makeMat(pal.secondary, pal, { metalness: 0.5 })
      );
      postL.position.set(-0.42 * scaleRatio, 0.54, 0);
      postL.castShadow = true;
      const postR = postL.clone();
      postR.position.x = 0.42 * scaleRatio;
      topper.add(postL, postR);

      const board = new THREE.Mesh(
        new THREE.BoxGeometry(1.02 * scaleRatio, 0.52, 0.09),
        makeMat(pal.wood, pal)
      );
      board.position.set(0, 0.78, 0);
      board.castShadow = true;
      topper.add(board);

      const bigFaceFront = new THREE.Mesh(
        new THREE.PlaneGeometry(0.94 * scaleRatio, 0.44),
        makeMat(0xffffff, pal, { map: plaqueTex, roughness: 0.35 })
      );
      bigFaceFront.position.set(0, 0.78, 0.048);
      const bigFaceBack = bigFaceFront.clone();
      bigFaceBack.position.z = -0.048;
      bigFaceBack.rotation.y = Math.PI;
      topper.add(bigFaceFront, bigFaceBack);
    } else if (symbol === 'skull') {
      // Totenkopf / Fluch- & Verwundungs-Totem auf Felssockel
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.32 * scaleRatio, 0),
        makeMat(pal.secondary, pal, { roughness: 0.82 })
      );
      rock.position.y = 0.2;
      rock.scale.set(1.2, 0.75, 1.0);
      rock.castShadow = true;
      topper.add(rock);

      const cranium = new THREE.Mesh(
        new THREE.SphereGeometry(0.30 * scaleRatio, 20, 18),
        makeMat(pal.primary, pal, { roughness: 0.48 })
      );
      cranium.position.set(0, 0.62, 0);
      cranium.scale.set(0.92, 1.05, 1.04);
      cranium.castShadow = true;
      topper.add(cranium);

      const jaw = new THREE.Mesh(
        new THREE.BoxGeometry(0.30 * scaleRatio, 0.22 * scaleRatio, 0.28 * scaleRatio),
        makeMat(pal.primary, pal, { roughness: 0.52 })
      );
      jaw.position.set(0, 0.39, 0.11 * scaleRatio);
      jaw.castShadow = true;
      topper.add(jaw);

      const eyeMat = makeMat(0x111111, pal, {
        emissive: pal.glow,
        emissiveIntensity: document.getElementById('ctrl-color-scheme').value === 'roh_grau' ? 0 : 0.85,
      });
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.065 * scaleRatio, 12, 12), eyeMat);
      eyeL.position.set(-0.11 * scaleRatio, 0.58, 0.25 * scaleRatio);
      const eyeR = eyeL.clone();
      eyeR.position.x = 0.11 * scaleRatio;
      topper.add(eyeL, eyeR);
    } else if (symbol === 'obelisk') {
      // Arkaner Missionsziel-Obelisk
      const plinth = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32 * scaleRatio, 0.42 * scaleRatio, 0.22, 6),
        makeMat(pal.secondary, pal)
      );
      plinth.position.y = 0.11;
      plinth.castShadow = true;
      topper.add(plinth);

      const shaft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14 * scaleRatio, 0.26 * scaleRatio, 1.05, 4),
        makeMat(pal.primary, pal, {
          metalness: 0.4,
          roughness: 0.25,
          emissive: pal.glow,
          emissiveIntensity: document.getElementById('ctrl-color-scheme').value === 'roh_grau' ? 0 : 0.22,
        })
      );
      shaft.position.y = 0.74;
      shaft.rotation.y = Math.PI / 4;
      shaft.castShadow = true;
      topper.add(shaft);

      const tip = new THREE.Mesh(
        new THREE.ConeGeometry(0.198 * scaleRatio, 0.28, 4),
        makeMat(pal.accent, pal, { metalness: 0.65, roughness: 0.25 })
      );
      tip.position.y = 1.40;
      tip.rotation.y = Math.PI / 4;
      tip.castShadow = true;
      topper.add(tip);
    } else if (symbol === 'shield') {
      // Wappenschild-Marker
      const stake = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.06, 1.18, 10),
        makeMat(pal.wood, pal)
      );
      stake.position.set(0, 0.56, -0.08);
      stake.rotation.x = 0.14;
      stake.castShadow = true;
      topper.add(stake);

      const shieldBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42 * scaleRatio, 0.22 * scaleRatio, 0.78, 6),
        makeMat(pal.primary, pal)
      );
      shieldBody.scale.set(1.0, 1.0, 0.24);
      shieldBody.position.set(0, 0.64, 0.04);
      shieldBody.castShadow = true;
      topper.add(shieldBody);

      const boss = new THREE.Mesh(
        new THREE.SphereGeometry(0.14 * scaleRatio, 16, 16),
        makeMat(pal.accent, pal, { metalness: 0.7, roughness: 0.25 })
      );
      boss.position.set(0, 0.66, 0.12);
      topper.add(boss);
    } else {
      // Sci-Fi Energie- & Sektor-Bake
      const emitterBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.38 * scaleRatio, 0.45 * scaleRatio, 0.26, 8),
        makeMat(pal.secondary, pal, { metalness: 0.65, roughness: 0.3 })
      );
      emitterBase.position.y = 0.13;
      topper.add(emitterBase);

      const core = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16 * scaleRatio, 0.16 * scaleRatio, 0.95, 16),
        makeMat(pal.accent, pal, {
          emissive: pal.glow,
          emissiveIntensity: document.getElementById('ctrl-color-scheme').value === 'roh_grau' ? 0 : 0.75,
          roughness: 0.18,
        })
      );
      core.position.y = 0.68;
      topper.add(core);

      for (let r = 0; r < 3; r++) {
        const torus = new THREE.Mesh(
          new THREE.TorusGeometry(0.28 * scaleRatio, 0.035, 10, 24),
          makeMat(pal.primary, pal, { metalness: 0.7, roughness: 0.25 })
        );
        torus.rotation.x = Math.PI / 2;
        torus.position.y = 0.42 + r * 0.28;
        topper.add(torus);
      }
    }

    root.add(topper);

    const symSelect = document.getElementById('marker-symbol');
    const symName = symSelect.options[symSelect.selectedIndex].text.replace(/^[^\s]+\s/, '');
    return {
      mesh: root,
      targetY: 0.68,
      camDist: 3.6,
      mmReferenceRadius: radius,
      targetBaseMm: sizeMm,
      summary: `Marker: ${symName} („${(labelText || 'MARKER').toUpperCase()}“, ${sizeMm} mm)`,
      coins: 150,
    };
  }

  // ========================================================
  // GENERATOR 2: LANDMARKEN & WAPPEN-FLAGGEN
  // ========================================================
  function buildFlagModel(pal) {
    const style = document.getElementById('flag-style').value;
    const emblem = document.getElementById('flag-emblem').value;
    const motto = document.getElementById('flag-motto').value;
    const windPct = parseInt(document.getElementById('flag-wind').value, 10) || 45;
    const isSciFi = style === 'scifi_holo' || document.getElementById('ctrl-color-scheme').value === 'arkan_cyan';

    const root = new THREE.Group();
    const base = buildWargameBase(isSciFi ? 'octagon' : 'round', 0.85, pal);
    root.add(base);

    // Gestufter Steinsockel / Pylon-Fuß
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.44, 0.28, 8),
      makeMat(pal.secondary, pal, { roughness: 0.7 })
    );
    plinth.position.y = 0.28;
    plinth.castShadow = true;
    root.add(plinth);

    // Haupt-Fahnenstange
    const poleHeight = 2.45;
    const pole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.048, 0.062, poleHeight, 14),
      makeMat(isSciFi ? pal.secondary : pal.wood, pal, { metalness: isSciFi ? 0.68 : 0.2 })
    );
    pole.position.y = 0.2 + poleHeight / 2;
    pole.castShadow = true;
    root.add(pole);

    // Speerspitze / Ordensknauf oben
    const finial = new THREE.Mesh(
      new THREE.ConeGeometry(0.11, 0.30, 8),
      makeMat(pal.accent, pal, { metalness: 0.72, roughness: 0.25 })
    );
    finial.position.y = 0.2 + poleHeight + 0.14;
    finial.castShadow = true;
    root.add(finial);

    // Wasserfestes 3D-Fahnentuch (BoxGeometry mit Unterteilungen für echte Druck-Wandstärke + Windwelle)
    const bannerTex = createBannerTexture(emblem, motto, pal, isSciFi);
    const clothW = style === 'war_standard' ? 1.18 : 0.96;
    const clothH = style === 'war_standard' ? 0.92 : 1.38;
    const clothGeo = new THREE.BoxGeometry(clothW, clothH, 0.045, 22, 22, 1);

    const posAttr = clothGeo.attributes.position;
    const windAmp = (windPct / 100) * 0.22;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);
      const normX = (vx + clothW / 2) / clothW;
      const wave = Math.sin(normX * Math.PI * 2.1 + vy * 1.4) * windAmp * (style === 'war_standard' ? normX : 0.35 + normX * 0.65);
      posAttr.setZ(i, vz + wave);
    }
    clothGeo.computeVertexNormals();

    const sideMat = makeMat(pal.accent, pal, { metalness: 0.45, roughness: 0.4 });
    const faceMat = makeMat(0xffffff, pal, {
      map: bannerTex,
      roughness: isSciFi ? 0.2 : 0.62,
      metalness: isSciFi ? 0.3 : 0.08,
      emissive: isSciFi ? 0x004d66 : 0x000000,
      emissiveIntensity: isSciFi ? 0.55 : 0,
    });

    const clothMesh = new THREE.Mesh(clothGeo, [sideMat, sideMat, sideMat, sideMat, faceMat, faceMat]);
    clothMesh.castShadow = true;

    if (style === 'cross_banner') {
      const crossbar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, clothW + 0.26, 12),
        makeMat(pal.accent, pal, { metalness: 0.65, roughness: 0.3 })
      );
      crossbar.rotation.z = Math.PI / 2;
      crossbar.position.set(0, 2.36, 0.08);
      crossbar.castShadow = true;
      root.add(crossbar);

      clothMesh.position.set(0, 1.64, 0.09);
    } else {
      clothMesh.position.set(clothW / 2 + 0.04, 1.92, 0);
      if (style === 'scifi_holo') {
        const emitterBar = new THREE.Mesh(
          new THREE.BoxGeometry(clothW + 0.08, 0.08, 0.10),
          makeMat(pal.secondary, pal, { metalness: 0.75, roughness: 0.25 })
        );
        emitterBar.position.set(clothW / 2 + 0.02, 2.40, 0);
        root.add(emitterBar);
      }
    }
    root.add(clothMesh);

    return {
      mesh: root,
      targetY: 1.32,
      camDist: 4.8,
      mmReferenceRadius: 0.85,
      targetBaseMm: 40,
      summary: `Landmarke: Flagge „${(motto || 'AURITAN').toUpperCase()}“ (${windPct} % Wind)`,
      coins: 150,
    };
  }

  // ========================================================
  // GENERATOR 3: SCHREIBTISCHE, SCHRÄNKE & SCI-FI-MÖBEL
  // ========================================================
  function buildFurnitureModel(pal) {
    const type = document.getElementById('furn-type').value;
    const widthPct = parseInt(document.getElementById('furn-width').value, 10) || 100;
    const levels = parseInt(document.getElementById('furn-height').value, 10) || 3;
    const clutter = parseInt(document.getElementById('furn-clutter').value, 10);

    const wScale = widthPct / 100;
    const root = new THREE.Group();

    const woodMat = makeMat(pal.wood, pal, { roughness: 0.68, metalness: 0.12 });
    const ironMat = makeMat(pal.secondary, pal, { roughness: 0.42, metalness: 0.58 });
    const brassMat = makeMat(pal.accent, pal, { roughness: 0.3, metalness: 0.72 });
    const primaryMat = makeMat(pal.primary, pal);

    if (type === 'scholar_desk') {
      const deskW = 1.65 * wScale;
      const deskD = 0.88;
      const deskH = 0.82;

      // Tischplatte
      const top = new THREE.Mesh(new THREE.BoxGeometry(deskW, 0.09, deskD), woodMat);
      top.position.y = deskH;
      top.castShadow = true;
      top.receiveShadow = true;
      root.add(top);

      // Linker & Rechter Schubladen-Korpus
      const pedW = Math.min(0.42, deskW * 0.27);
      for (const side of [-1, 1]) {
        const ped = new THREE.Mesh(new THREE.BoxGeometry(pedW, deskH - 0.06, deskD * 0.88), woodMat);
        ped.position.set(side * (deskW / 2 - pedW / 2 - 0.05), (deskH - 0.06) / 2, 0);
        ped.castShadow = true;
        root.add(ped);

        for (let d = 0; d < 3; d++) {
          const handle = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 10), brassMat);
          handle.position.set(ped.position.x, 0.20 + d * 0.22, deskD * 0.45);
          root.add(handle);
        }
      }

      // Optionaler Sekretär-Aufsatz (über Stufen-Regler 2..5)
      if (levels >= 3) {
        const hutchH = 0.22 + (levels - 2) * 0.13;
        const hutch = new THREE.Mesh(new THREE.BoxGeometry(deskW * 0.94, hutchH, 0.26), woodMat);
        hutch.position.set(0, deskH + 0.045 + hutchH / 2, -deskD * 0.32);
        hutch.castShadow = true;
        root.add(hutch);
      }

      // Tisch-Ausstattung (Folianten, Schriftrolle, Kerze)
      if (clutter >= 25) {
        const mapScroll = new THREE.Mesh(
          new THREE.BoxGeometry(deskW * 0.38, 0.02, 0.42),
          makeMat(0xdcc89e, pal, { roughness: 0.78, metalness: 0.02 })
        );
        mapScroll.position.set(0, deskH + 0.055, 0.08);
        mapScroll.rotation.y = 0.08;
        root.add(mapScroll);
      }
      if (clutter >= 50) {
        for (let b = 0; b < 3; b++) {
          const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.24, 0.065, 0.32),
            b % 2 === 0 ? primaryMat : brassMat
          );
          book.position.set(-deskW * 0.30, deskH + 0.08 + b * 0.068, 0.05);
          book.rotation.y = b * 0.18 - 0.1;
          book.castShadow = true;
          root.add(book);
        }
      }
      if (clutter >= 75) {
        const candle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.035, 0.042, 0.22, 12),
          makeMat(0xf0e4c8, pal, { roughness: 0.6 })
        );
        candle.position.set(deskW * 0.32, deskH + 0.15, 0.12);
        root.add(candle);

        const flame = new THREE.Mesh(
          new THREE.ConeGeometry(0.035, 0.11, 10),
          makeMat(0xffaa22, pal, { emissive: 0xff6600, emissiveIntensity: 0.9 })
        );
        flame.position.set(deskW * 0.32, deskH + 0.30, 0.12);
        root.add(flame);
      }
    } else if (type === 'scifi_desk') {
      // Sci-Fi Holo-Kommandotisch
      const deskW = 1.75 * wScale;
      const baseConsole = new THREE.Mesh(
        new THREE.CylinderGeometry(deskW * 0.46, deskW * 0.54, 0.76, 8),
        ironMat
      );
      baseConsole.scale.set(1.0, 1.0, 0.62);
      baseConsole.position.y = 0.38;
      baseConsole.castShadow = true;
      root.add(baseConsole);

      const topRim = new THREE.Mesh(
        new THREE.CylinderGeometry(deskW * 0.52, deskW * 0.48, 0.12, 8),
        primaryMat
      );
      topRim.scale.set(1.0, 1.0, 0.64);
      topRim.position.y = 0.82;
      topRim.castShadow = true;
      root.add(topRim);

      const holoMat = makeMat(0x00e5ff, pal, {
        emissive: 0x00c8ff,
        emissiveIntensity: document.getElementById('ctrl-color-scheme').value === 'roh_grau' ? 0 : 0.75,
        roughness: 0.15,
      });

      const holoWell = new THREE.Mesh(new THREE.CylinderGeometry(deskW * 0.32, deskW * 0.32, 0.04, 24), holoMat);
      holoWell.scale.set(1.0, 1.0, 0.6);
      holoWell.position.y = 0.88;
      root.add(holoWell);

      if (clutter >= 25) {
        const screenCount = Math.min(levels, 4);
        for (let s = 0; s < screenCount; s++) {
          const ang = ((s - (screenCount - 1) / 2) * 0.52);
          const screen = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.30, 0.03), holoMat);
          screen.position.set(Math.sin(ang) * (deskW * 0.38), 1.14, -Math.cos(ang) * 0.28);
          screen.rotation.y = -ang;
          screen.rotation.x = 0.18;
          root.add(screen);
        }
      }
      if (clutter >= 75) {
        const planet = new THREE.Mesh(new THREE.IcosahedronGeometry(0.18, 1), holoMat);
        planet.position.set(0, 1.18, 0.04);
        root.add(planet);
      }
    } else if (type === 'bookcase') {
      // Großer Folianten- & Bücherschrank
      const cabW = 1.42 * wScale;
      const cabH = 0.85 + levels * 0.34;
      const cabD = 0.52;

      const backWall = new THREE.Mesh(new THREE.BoxGeometry(cabW, cabH, 0.07), woodMat);
      backWall.position.set(0, cabH / 2, -cabD / 2 + 0.035);
      backWall.castShadow = true;
      root.add(backWall);

      for (const side of [-1, 1]) {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(0.09, cabH, cabD), woodMat);
        wall.position.set(side * (cabW / 2 - 0.045), cabH / 2, 0);
        wall.castShadow = true;
        root.add(wall);
      }

      const crown = new THREE.Mesh(new THREE.BoxGeometry(cabW + 0.12, 0.11, cabD + 0.08), woodMat);
      crown.position.set(0, cabH + 0.05, 0);
      crown.castShadow = true;
      root.add(crown);

      for (let l = 0; l <= levels; l++) {
        const sy = 0.08 + (l / levels) * (cabH - 0.14);
        const shelf = new THREE.Mesh(new THREE.BoxGeometry(cabW - 0.12, 0.06, cabD - 0.04), woodMat);
        shelf.position.set(0, sy, 0.01);
        shelf.castShadow = true;
        root.add(shelf);

        if (l < levels && clutter > 0) {
          const innerW = cabW - 0.26;
          const maxBooks = Math.max(2, Math.floor((innerW / 0.11) * (clutter / 100)));
          for (let b = 0; b < maxBooks; b++) {
            const bh = 0.19 + ((b * 7 + l * 3) % 5) * 0.022;
            const bMat = (b + l) % 3 === 0 ? primaryMat : ((b + l) % 3 === 1 ? brassMat : ironMat);
            const book = new THREE.Mesh(new THREE.BoxGeometry(0.082, bh, 0.28), bMat);
            const bx = -innerW / 2 + 0.06 + b * 0.105;
            if (bx < innerW / 2 - 0.04) {
              book.position.set(bx, sy + 0.03 + bh / 2, 0.02);
              book.castShadow = true;
              root.add(book);
            }
          }
        }
      }
    } else {
      // Massiver Rüstungs-/Doppelschrank ODER Sci-Fi Stase-/Waffenspind
      const isSciFiCab = type === 'scifi_locker';
      const cabW = 1.36 * wScale;
      const cabH = 0.95 + levels * 0.28;
      const cabD = 0.62;
      const bodyMat = isSciFiCab ? ironMat : woodMat;

      const body = new THREE.Mesh(new THREE.BoxGeometry(cabW, cabH, cabD), bodyMat);
      body.position.y = cabH / 2 + 0.06;
      body.castShadow = true;
      body.receiveShadow = true;
      root.add(body);

      // Standfüße
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const foot = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.10, 0.14), ironMat);
          foot.position.set(sx * (cabW / 2 - 0.1), 0.05, sz * (cabD / 2 - 0.1));
          root.add(foot);
        }
      }

      // Doppeltüren mit Beschlägen bzw. Sci-Fi-Energiekern
      for (const side of [-1, 1]) {
        const doorW = cabW * 0.44;
        const door = new THREE.Mesh(
          new THREE.BoxGeometry(doorW, cabH * 0.86, 0.05),
          isSciFiCab ? primaryMat : bodyMat
        );
        door.position.set(side * (doorW / 2 + 0.02), cabH / 2 + 0.06, cabD / 2 + 0.02);
        door.castShadow = true;
        root.add(door);

        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.22, 0.06), brassMat);
        handle.position.set(side * 0.09, cabH / 2 + 0.06, cabD / 2 + 0.06);
        root.add(handle);

        if (!isSciFiCab && clutter >= 25) {
          for (const hy of [-0.32, 0.32]) {
            const hinge = new THREE.Mesh(new THREE.BoxGeometry(doorW * 0.65, 0.055, 0.03), ironMat);
            hinge.position.set(side * (cabW * 0.28), cabH / 2 + 0.06 + hy * cabH, cabD / 2 + 0.045);
            root.add(hinge);
          }
        }
      }

      if (isSciFiCab && clutter >= 25) {
        const ledMat = makeMat(0x00f0ff, pal, {
          emissive: pal.glow,
          emissiveIntensity: document.getElementById('ctrl-color-scheme').value === 'roh_grau' ? 0 : 0.85,
        });
        for (let i = 0; i < levels; i++) {
          const strip = new THREE.Mesh(new THREE.BoxGeometry(cabW * 0.72, 0.045, 0.04), ledMat);
          strip.position.set(0, 0.34 + i * ((cabH - 0.45) / Math.max(1, levels - 1)), cabD / 2 + 0.055);
          root.add(strip);
        }
      }
    }

    const typeSel = document.getElementById('furn-type');
    const typeName = typeSel.options[typeSel.selectedIndex].text.replace(/^[^\s]+\s/, '');
    return {
      mesh: root,
      targetY: 0.86,
      camDist: 4.4,
      mmReferenceRadius: 0.8,
      targetBaseMm: 45,
      summary: `Möbel: ${typeName} (Breite ${widthPct} %, Stufe ${levels})`,
      coins: 150,
    };
  }

  // ========================================================
  // GENERATOR 4: FIGUREN-BAUKASTEN (VORSCHAU STUFEN 2 & 3)
  // ========================================================
  function buildCharacterModel(pal) {
    const bodyType = document.getElementById('char-body').value;
    const weapon = document.getElementById('char-weapon').value;
    const offhand = document.getElementById('char-offhand').value;
    const pose = document.getElementById('char-pose').value;

    const isOgre = bodyType === 'ogre';
    const isDwarf = bodyType === 'dwarf';
    const isElf = bodyType === 'elf';
    const isLion = bodyType === 'lionfolk';
    const isSciFi = bodyType === 'scifi_trooper';

    const root = new THREE.Group();
    const baseRadius = isOgre ? 0.92 : 0.72;
    root.add(buildWargameBase('round', baseRadius, pal));

    const armorMat = makeMat(pal.primary, pal, { metalness: 0.45, roughness: 0.38 });
    const clothMat = makeMat(pal.secondary, pal, { roughness: 0.68, metalness: 0.1 });
    const goldMat = makeMat(pal.accent, pal, { metalness: 0.72, roughness: 0.28 });
    const skinMat = makeMat(
      document.getElementById('ctrl-color-scheme').value === 'roh_grau'
        ? 0x82878f
        : (isOgre ? 0x8a9170 : (isLion ? 0xc89654 : 0xd9b391)),
      pal,
      { roughness: 0.65, metalness: 0.05 }
    );

    const fig = new THREE.Group();
    fig.position.y = 0.16;

    const heightMul = isDwarf ? 0.78 : (isElf ? 1.08 : (isOgre ? 1.32 : 1.0));
    const widthMul = isDwarf ? 1.18 : (isElf ? 0.86 : (isOgre ? 1.42 : (isLion ? 1.12 : 1.0)));

    // Beine & Stiefel
    for (const side of [-1, 1]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.11 * widthMul, 0.095 * widthMul, 0.66 * heightMul, 12),
        clothMat
      );
      const stride = pose === 'march' ? side * 0.11 : 0;
      leg.position.set(side * 0.16 * widthMul, 0.33 * heightMul, stride);
      leg.castShadow = true;
      fig.add(leg);
    }

    // Brustpanzer / Torso + Waffenrock
    const torso = new THREE.Mesh(
      new THREE.CylinderGeometry(0.26 * widthMul, 0.20 * widthMul, 0.64 * heightMul, 14),
      armorMat
    );
    torso.position.y = 0.94 * heightMul;
    torso.castShadow = true;
    fig.add(torso);

    const belt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.22 * widthMul, 0.25 * widthMul, 0.14, 14),
      goldMat
    );
    belt.position.y = 0.64 * heightMul;
    fig.add(belt);

    // Schulterpanzer
    for (const side of [-1, 1]) {
      const pauldron = new THREE.Mesh(
        new THREE.SphereGeometry(0.16 * widthMul, 14, 12),
        side === 1 ? armorMat : goldMat
      );
      pauldron.position.set(side * 0.31 * widthMul, 1.18 * heightMul, 0);
      pauldron.scale.set(1.0, 0.82, 1.05);
      pauldron.castShadow = true;
      fig.add(pauldron);
    }

    // Kopf je nach Volk
    const headY = 1.44 * heightMul;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17 * (isOgre ? 1.18 : 1.0), 18, 16), isSciFi ? armorMat : skinMat);
    head.position.y = headY;
    head.castShadow = true;
    fig.add(head);

    if (isLion) {
      const mane = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25, 1), goldMat);
      mane.position.set(0, headY + 0.02, -0.04);
      fig.add(mane);
      const snout = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.11, 0.15), skinMat);
      snout.position.set(0, headY - 0.03, 0.15);
      fig.add(snout);
    } else if (isDwarf) {
      const beard = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.36, 8), goldMat);
      beard.rotation.x = Math.PI;
      beard.position.set(0, headY - 0.20, 0.10);
      fig.add(beard);
    } else if (isSciFi) {
      const visor = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.08, 0.12),
        makeMat(0x00f0ff, pal, { emissive: pal.glow, emissiveIntensity: 0.8 })
      );
      visor.position.set(0, headY + 0.02, 0.13);
      fig.add(visor);

      const pack = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.44, 0.22), armorMat);
      pack.position.set(0, 1.02 * heightMul, -0.24);
      fig.add(pack);
    } else if (!isOgre) {
      const helm = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.16, 12), goldMat);
      helm.position.set(0, headY + 0.09, 0);
      fig.add(helm);
    }

    // Rechter Waffenarm + Hauptwaffe
    const armR = new THREE.Group();
    armR.position.set(0.34 * widthMul, 1.12 * heightMul, 0);
    armR.rotation.x = pose === 'heroic' ? -0.65 : (pose === 'guard' ? -0.35 : -0.9);
    const armMeshR = new THREE.Mesh(new THREE.CylinderGeometry(0.075 * widthMul, 0.065 * widthMul, 0.52 * heightMul, 10), armorMat);
    armMeshR.position.y = -0.22 * heightMul;
    armR.add(armMeshR);

    const wpn = new THREE.Group();
    wpn.position.set(0, -0.46 * heightMul, 0.06);
    wpn.rotation.x = Math.PI / 2.2;

    if (weapon === 'sword') {
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.95, 0.10), makeMat(0xcfd6e0, pal, { metalness: 0.8, roughness: 0.2 }));
      blade.position.y = 0.52;
      const guard = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.05, 0.30), goldMat);
      guard.position.y = 0.06;
      wpn.add(blade, guard);
    } else if (weapon === 'hammer' || weapon === 'axe') {
      const haft = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.035, 1.15, 8), makeMat(pal.wood, pal));
      haft.position.y = 0.48;
      const headBlk = new THREE.Mesh(
        weapon === 'hammer' ? new THREE.BoxGeometry(0.22, 0.22, 0.42) : new THREE.CylinderGeometry(0.24, 0.24, 0.07, 6),
        goldMat
      );
      headBlk.position.y = 0.96;
      if (weapon === 'axe') headBlk.rotation.z = Math.PI / 2;
      wpn.add(haft, headBlk);
    } else if (weapon === 'staff') {
      const staffPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.035, 1.45, 10), makeMat(pal.wood, pal));
      staffPole.position.y = 0.55;
      const orb = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.14, 0),
        makeMat(pal.accent, pal, { emissive: pal.glow, emissiveIntensity: 0.75 })
      );
      orb.position.y = 1.32;
      wpn.add(staffPole, orb);
    } else {
      // Sci-Fi Plasmagewehr
      const rifle = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.78, 0.18), armorMat);
      rifle.position.y = 0.34;
      const coil = new THREE.Mesh(
        new THREE.BoxGeometry(0.10, 0.32, 0.09),
        makeMat(0x00f0ff, pal, { emissive: pal.glow, emissiveIntensity: 0.85 })
      );
      coil.position.set(0, 0.42, 0.07);
      wpn.add(rifle, coil);
    }
    armR.add(wpn);
    fig.add(armR);

    // Linker Arm + Nebenhand / Rückenbanner
    const armL = new THREE.Group();
    armL.position.set(-0.34 * widthMul, 1.12 * heightMul, 0);
    armL.rotation.x = pose === 'guard' ? -0.75 : -0.35;
    const armMeshL = new THREE.Mesh(new THREE.CylinderGeometry(0.075 * widthMul, 0.065 * widthMul, 0.52 * heightMul, 10), armorMat);
    armMeshL.position.y = -0.22 * heightMul;
    armL.add(armMeshL);

    if (offhand === 'shield') {
      const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.20, 0.68, 6), clothMat);
      sh.scale.set(1.0, 1.0, 0.22);
      sh.position.set(-0.12, -0.32 * heightMul, 0.16);
      sh.rotation.z = 0.25;
      armL.add(sh);
    } else if (offhand === 'torch') {
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.55, 8), makeMat(pal.wood, pal));
      stick.position.set(0, -0.38 * heightMul, 0.22);
      stick.rotation.x = Math.PI / 3;
      const tFlame = new THREE.Mesh(
        new THREE.ConeGeometry(0.09, 0.24, 10),
        makeMat(0xff8800, pal, { emissive: 0xff5500, emissiveIntensity: 0.85 })
      );
      tFlame.position.set(0, -0.24 * heightMul, 0.46);
      armL.add(stick, tFlame);
    } else if (offhand === 'back_banner') {
      const bPole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.35, 8), goldMat);
      bPole.position.set(0, 1.65 * heightMul, -0.22);
      const bFlag = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.68, 0.03), clothMat);
      bFlag.position.set(0, 2.02 * heightMul, -0.22);
      fig.add(bPole, bFlag);
    }

    fig.add(armL);
    root.add(fig);

    const bodySel = document.getElementById('char-body');
    const bodyLabel = bodySel.options[bodySel.selectedIndex].text;
    const coinVal = isOgre ? 150 : 100;

    return {
      mesh: root,
      targetY: 0.92 * heightMul,
      camDist: isOgre ? 4.8 : 4.1,
      mmReferenceRadius: baseRadius,
      targetBaseMm: isOgre ? 40 : 32,
      summary: `Figur-Entwurf: ${bodyLabel}`,
      coins: coinVal,
    };
  }

  // ========================================================
  // KUNDENDATEI-INSPEKTOR (.STL, .OBJ, .GLB)
  // ========================================================
  function buildCustomerModel(pal, schemeKey) {
    if (!state.customerModel) {
      // Eingebaute Standard-Musterfigur (Ritter auf Base im Knochen-Sundrop Stil)
      const demo = buildCharacterModel(pal);
      const root = new THREE.Group();
      root.add(demo.mesh);

      const tris = countTriangles(root);
      const triEl = document.getElementById('cust-tri-count');
      if (triEl) triEl.textContent = `${tris.toLocaleString('de-DE')} Tris (VTT-ideal)`;
      const dimEl = document.getElementById('cust-dimensions');
      if (dimEl) dimEl.textContent = '1,0 : 0,9 : 1,4';
      const sizeEl = document.getElementById('cust-size-class');
      if (sizeEl) sizeEl.textContent = '🛡️ Standard (25–32 mm) · 100 Münzen';
      const verEl = document.getElementById('cust-vtt-verdict');
      if (verEl) {
        verEl.style.color = '#7ef2a6';
        verEl.textContent = 'Bereit für TTS & Foundry VTT';
      }

      return {
        mesh: root,
        summary: 'Muster-Miniatur (360°-Prüfung)',
        coins: 100,
        targetY: 0.88,
        camDist: 3.8,
        targetBaseMm: 32,
        mmReferenceRadius: 0.72,
      };
    }

    // Wenn eigene Datei geladen wurde:
    const root = new THREE.Group();
    const baseChoice = document.getElementById('cust-base-plate')?.value || 'round_stone';
    const baseRadius = 0.85;
    let baseY = 0;

    if (baseChoice === 'round_stone') {
      const b = buildWargameBase('round', baseRadius, pal);
      root.add(b);
      baseY = 0.16;
    } else if (baseChoice === 'hex_slate') {
      const b = buildWargameBase('hex', baseRadius, pal);
      root.add(b);
      baseY = 0.16;
    }

    const modelClone = state.customerModel.object.clone(true);
    modelClone.position.y += baseY;

    // Material-Zuweisung
    if (schemeKey === 'original_tex' && state.customerModel.hasTextures) {
      modelClone.traverse((node) => {
        if (node.isMesh) {
          node.castShadow = true;
          node.receiveShadow = true;
          if (state.wireframe && node.material) {
            const m = Array.isArray(node.material)
              ? node.material.map((mat) => { const c = mat.clone(); c.wireframe = true; return c; })
              : (() => { const c = node.material.clone(); c.wireframe = true; return c; })();
            node.material = m;
          }
        }
      });
    } else {
      const customMat = makeMat(
        schemeKey === 'original_tex' ? pal.primary : pal.primary,
        pal,
        {
          roughness: pal.roughness,
          metalness: pal.metalness,
        }
      );
      if (state.wireframe) customMat.wireframe = true;

      modelClone.traverse((node) => {
        if (node.isMesh) {
          node.material = customMat;
          node.castShadow = true;
          node.receiveShadow = true;
        }
      });
    }

    root.add(modelClone);

    const filename = state.customerModel.filename;
    const tris = state.customerModel.tris;
    const summary = `${filename} (${tris.toLocaleString('de-DE')} Tris)`;
    const coins = state.customerModel.coins || 100;

    return {
      mesh: root,
      summary,
      coins,
      targetY: 0.9 + baseY,
      camDist: 4.0,
      targetBaseMm: 32,
      mmReferenceRadius: baseRadius,
    };
  }

  function processLoadedModel(objGroup, filename, filetype) {
    const box = new THREE.Box3().setFromObject(objGroup);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetHeight = 1.75;
    const scaleFactor = targetHeight / (size.y > 0.05 ? size.y : maxDim);

    objGroup.position.x = -center.x * scaleFactor;
    objGroup.position.z = -center.z * scaleFactor;
    objGroup.position.y = -box.min.y * scaleFactor;
    objGroup.scale.setScalar(scaleFactor);

    const container = new THREE.Group();
    container.add(objGroup);

    const tris = countTriangles(container);

    const normX = size.x || 1;
    const ratioD = (size.z / normX).toFixed(1).replace('.', ',');
    const ratioH = (size.y / normX).toFixed(1).replace('.', ',');
    const dimStr = `1,0 : ${ratioD} : ${ratioH}`;

    let sizeClass, recommendedCategory, coins;
    if (tris > 150000 || size.y > size.x * 2.6) {
      sizeClass = '🐉 Koloss / Monster (>60 mm) · 250 Münzen';
      recommendedCategory = 'colossus';
      coins = 250;
    } else if (tris > 45000 || size.x > 1.25 * size.z) {
      sizeClass = '👹 Groß / Oger (40–50 mm) · 150 Münzen';
      recommendedCategory = 'large';
      coins = 150;
    } else {
      sizeClass = '🛡️ Standard (25–32 mm) · 100 Münzen';
      recommendedCategory = 'standard';
      coins = 100;
    }

    let verdict, verdictColor;
    if (tris <= 25000) {
      verdict = '✅ VTT-ideal für TTS & Foundry VTT (<25k Tris)';
      verdictColor = '#7ef2a6';
    } else if (tris <= 75000) {
      verdict = '⚠️ Mittlere Dichte — VTT-Optimierung empfohlen';
      verdictColor = 'var(--gold-bright)';
    } else {
      verdict = `🛑 High-Poly Druckdatei (${tris.toLocaleString('de-DE')} Tris) — Einschmelzung & Reduktion nötig!`;
      verdictColor = '#ffb3ad';
    }

    let hasTextures = false;
    objGroup.traverse((n) => {
      if (n.isMesh && n.material) {
        if (Array.isArray(n.material)) {
          if (n.material.some((m) => m && m.map)) hasTextures = true;
        } else if (n.material.map) {
          hasTextures = true;
        }
      }
    });

    state.customerModel = {
      object: container,
      rawSize: size,
      filename,
      filetype,
      tris,
      dimStr,
      sizeClass,
      recommendedCategory,
      coins,
      verdict,
      verdictColor,
      hasTextures,
    };

    const triEl = document.getElementById('cust-tri-count');
    if (triEl) triEl.textContent = `${tris.toLocaleString('de-DE')} Tris`;
    const dimEl = document.getElementById('cust-dimensions');
    if (dimEl) dimEl.textContent = dimStr;
    const sizeEl = document.getElementById('cust-size-class');
    if (sizeEl) sizeEl.textContent = sizeClass;
    const verEl = document.getElementById('cust-vtt-verdict');
    if (verEl) {
      verEl.style.color = verdictColor;
      verEl.textContent = verdict;
    }

    rebuildWorkpiece(true);
  }

  function handleLoadedGeometry(geometry, filename, filetype) {
    const pal = PALETTES[document.getElementById('ctrl-color-scheme')?.value || 'sundrop'] || PALETTES.sundrop;
    const mesh = new THREE.Mesh(geometry, makeMat(pal.primary, pal));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    const group = new THREE.Group();
    group.add(mesh);
    processLoadedModel(group, filename, filetype);
  }

  function handleLoadedObject(obj, filename, filetype) {
    processLoadedModel(obj, filename, filetype);
  }

  function handleLoadError(err, filename) {
    console.error('Fehler beim Laden von', filename, err);
    const verEl = document.getElementById('cust-vtt-verdict');
    if (verEl) {
      verEl.style.color = '#ff8888';
      verEl.textContent = `❌ Fehler beim Lesen von ${filename}`;
    }
  }

  // ========================================================
  // REBUILD & DREIECKS-ZÄHLER
  // ========================================================
  let currentBuildInfo = null;

  function countTriangles(obj) {
    let tris = 0;
    obj.traverse((node) => {
      if (node.isMesh && node.geometry) {
        const g = node.geometry;
        tris += g.index ? g.index.count / 3 : g.attributes.position.count / 3;
      }
    });
    return Math.round(tris);
  }

  function rebuildWorkpiece(resetCamera = false) {
    clearGroup(workpieceGroup);
    const schemeKey = document.getElementById('ctrl-color-scheme').value || 'sundrop';
    const pal = PALETTES[schemeKey] || PALETTES.sundrop;

    let built;
    if (state.activeTab === 'kundendatei') {
      built = buildCustomerModel(pal, schemeKey);
    } else if (state.activeTab === 'marker') {
      built = buildMarkerModel(pal);
    } else if (state.activeTab === 'flagge') {
      built = buildFlagModel(pal);
    } else if (state.activeTab === 'moebel') {
      built = buildFurnitureModel(pal);
    } else {
      built = buildCharacterModel(pal);
    }

    currentBuildInfo = built;
    workpieceGroup.add(built.mesh);

    const triCount = countTriangles(workpieceGroup);
    const triEl = document.getElementById('hud-tri-count');
    if (triEl) triEl.textContent = triCount.toLocaleString('de-DE');

    const summaryEl = document.getElementById('creator-item-summary');
    if (summaryEl) summaryEl.textContent = built.summary;

    const coinEl = document.getElementById('creator-coin-cost');
    if (coinEl) {
      if (state.activeTab === 'kundendatei') {
        coinEl.textContent = `${built.coins} Münzen (Richtwert)`;
      } else if (state.activeTab === 'figur') {
        coinEl.textContent = `ab ${built.coins} Münzen / Figur`;
      } else {
        coinEl.textContent = `${built.coins} Münzen / Set`;
      }
    }

    if (resetCamera) {
      controls.target.set(0, built.targetY, 0);
      camera.position.set(0, built.targetY + 1.35, built.camDist);
      controls.update();
    }
  }

  // ========================================================
  // TAB-WECHSEL & LIVE-CONTROLS VERKNÜPFEN
  // ========================================================
  const tabLabels = {
    kundendatei: 'Eigene Datei prüfen (360°)',
    marker: 'Tabletop-Marker & Tokens',
    flagge: 'Landmarken & Wappen-Flaggen',
    moebel: 'Schreibtische, Schränke & Sci-Fi',
    figur: 'Figuren-Baukasten (Vorschau)',
  };

  document.querySelectorAll('.creator-tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const nextTab = btn.getAttribute('data-tab');
      if (!nextTab) return;
      state.activeTab = nextTab;

      document.querySelectorAll('.creator-tab-btn').forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });

      ['kundendatei', 'marker', 'flagge', 'moebel', 'figur'].forEach((key) => {
        const panel = document.getElementById(`panel-${key}`);
        if (panel) panel.style.display = key === nextTab ? 'flex' : 'none';
      });

      const modeEl = document.getElementById('hud-active-mode');
      if (modeEl) modeEl.textContent = tabLabels[nextTab] || nextTab;

      rebuildWorkpiece(true);
    });
  });

  // Slider-Anzeigewerte live aktualisieren
  const sliderBindings = [
    ['marker-size-mm', 'val-marker-size', (v) => `${v} mm`],
    ['flag-wind', 'val-flag-wind', (v) => `${v} %`],
    ['furn-width', 'val-furn-width', (v) => `${v} %`],
    ['furn-height', 'val-furn-height', (v) => `${v} Ebenen`],
    ['furn-clutter', 'val-furn-clutter', (v) => `${v} %`],
  ];
  for (const [inputId, labelId, fmt] of sliderBindings) {
    const inp = document.getElementById(inputId);
    const lbl = document.getElementById(labelId);
    if (inp && lbl) {
      inp.addEventListener('input', () => {
        lbl.textContent = fmt(inp.value);
        rebuildWorkpiece(false);
      });
    }
  }

  // Alle übrigen Selects und Textfelder im Baukasten beobachten
  document.querySelectorAll('.creator-controls-panel select, .creator-controls-panel input[type="text"]').forEach((el) => {
    const evt = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, () => rebuildWorkpiece(false));
  });

  // Kundendatei-Loader (.STL / .OBJ / .GLB)
  const custFileInput = document.getElementById('cust-file-input');
  custFileInput?.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const filename = file.name;
    const ext = filename.split('.').pop().toLowerCase();
    const reader = new FileReader();

    const verEl = document.getElementById('cust-vtt-verdict');
    if (verEl) {
      verEl.style.color = 'var(--gold-bright)';
      verEl.textContent = `Lese ${filename}...`;
    }

    if (ext === 'stl') {
      reader.readAsArrayBuffer(file);
      reader.onload = (evt) => {
        try {
          const loader = new STLLoader();
          const geometry = loader.parse(evt.target.result);
          geometry.computeVertexNormals();
          geometry.center();
          handleLoadedGeometry(geometry, filename, 'stl');
        } catch (err) {
          handleLoadError(err, filename);
        }
      };
      reader.onerror = (err) => handleLoadError(err, filename);
    } else if (ext === 'obj') {
      reader.readAsText(file);
      reader.onload = (evt) => {
        try {
          const loader = new OBJLoader();
          const objGroup = loader.parse(evt.target.result);
          handleLoadedObject(objGroup, filename, 'obj');
        } catch (err) {
          handleLoadError(err, filename);
        }
      };
      reader.onerror = (err) => handleLoadError(err, filename);
    } else if (ext === 'glb' || ext === 'gltf') {
      reader.readAsArrayBuffer(file);
      reader.onload = (evt) => {
        try {
          const loader = new GLTFLoader();
          loader.parse(
            evt.target.result,
            '',
            (gltf) => {
              handleLoadedObject(gltf.scene, filename, 'glb');
            },
            (err) => handleLoadError(err, filename)
          );
        } catch (err) {
          handleLoadError(err, filename);
        }
      };
      reader.onerror = (err) => handleLoadError(err, filename);
    } else {
      alert('Unterstützte Dateiformate sind .stl, .obj, .glb und .gltf');
    }
  });

  document.getElementById('btn-cust-reset-demo')?.addEventListener('click', () => {
    state.customerModel = null;
    const fileInp = document.getElementById('cust-file-input');
    if (fileInp) fileInp.value = '';
    rebuildWorkpiece(true);
  });

  // ========================================================
  // TOOLBAR: KAMERA, DREHTELLER, GITTERNETZ & ECHTE DATEI-EXPORTE
  // ========================================================
  document.getElementById('btn-cam-reset')?.addEventListener('click', () => {
    if (!currentBuildInfo) return;
    workpieceGroup.rotation.y = 0;
    controls.target.set(0, currentBuildInfo.targetY, 0);
    camera.position.set(0, currentBuildInfo.targetY + 1.35, currentBuildInfo.camDist);
    controls.update();
  });

  const spinBtn = document.getElementById('btn-toggle-spin');
  spinBtn?.addEventListener('click', () => {
    state.autoSpin = !state.autoSpin;
    spinBtn.textContent = state.autoSpin ? '🔄 Drehteller: An' : '⏸️ Drehteller: Aus';
  });

  const wireBtn = document.getElementById('btn-toggle-wire');
  wireBtn?.addEventListener('click', () => {
    state.wireframe = !state.wireframe;
    wireBtn.textContent = state.wireframe ? '🎨 Vollmodell' : '🕸️ Gitternetz';
    rebuildWorkpiece(false);
  });

  function triggerBlobDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function makeSafeSlug() {
    const base = (currentBuildInfo?.summary || state.activeTab)
      .toLowerCase()
      .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    return `baalphemor_${base.slice(0, 38) || 'modell'}`;
  }

  // .STL-Export im exakten Millimeter-Maßstab für Slicer (Cura / PrusaSlicer / Bambu)
  document.getElementById('btn-export-stl')?.addEventListener('click', () => {
    if (!currentBuildInfo) return;
    const exporter = new STLExporter();
    const clone = workpieceGroup.clone(true);
    const mmFactor = (currentBuildInfo.targetBaseMm / 2) / (currentBuildInfo.mmReferenceRadius || 0.72);
    clone.scale.setScalar(mmFactor);
    // Three.js Y-up -> Slicer +Z-up ((0,+1,0) -> (0,0,+1))
    clone.rotation.set(Math.PI / 2, 0, 0);
    clone.updateMatrixWorld(true);

    const binaryStl = exporter.parse(clone, { binary: true });
    const blob = new Blob([binaryStl], { type: 'application/octet-stream' });
    triggerBlobDownload(blob, `${makeSafeSlug()}.stl`);
  });

  // .GLB-Export (kompatibel mit Foundry VTT 3D-Modulen & Blender)
  document.getElementById('btn-export-glb')?.addEventListener('click', () => {
    const exporter = new GLTFExporter();
    const clone = workpieceGroup.clone(true);
    clone.rotation.set(0, 0, 0);
    clone.updateMatrixWorld(true);

    exporter.parse(
      clone,
      (result) => {
        const blob = new Blob([result], { type: 'model/gltf-binary' });
        triggerBlobDownload(blob, `${makeSafeSlug()}.glb`);
      },
      (err) => console.error('GLB-Export-Fehler:', err),
      { binary: true }
    );
  });

  // .PNG-Schnappschuss
  document.getElementById('btn-export-png')?.addEventListener('click', () => {
    renderer.render(scene, camera);
    canvas.toBlob((blob) => {
      if (blob) triggerBlobDownload(blob, `${makeSafeSlug()}_vorschau.png`);
    }, 'image/png');
  });

  // Entwurf / Prüfung in Münz-Rechner & Anfrage übernehmen
  document.getElementById('btn-add-to-order')?.addEventListener('click', () => {
    if (!currentBuildInfo) return;

    if (state.activeTab === 'kundendatei') {
      const transformSel = document.getElementById('cust-target-transform');
      const transformLabel = transformSel ? transformSel.options[transformSel.selectedIndex].text : 'All-VTT Umbau';
      const baseSel = document.getElementById('cust-base-plate');
      const baseLabel = baseSel ? baseSel.options[baseSel.selectedIndex].text : 'Rund-Base';
      const modelName = state.customerModel ? state.customerModel.filename : 'Beispiel-Miniatur (360°-Prüfung)';
      const triCount = state.customerModel ? state.customerModel.tris : 15694;
      const sizeClass = state.customerModel ? state.customerModel.sizeClass : 'Standard (25–32 mm)';

      const line = `• Kundendatei-Auftrag: „${modelName}“ (${triCount.toLocaleString('de-DE')} Tris | ${sizeClass}) | Gewünschter Umbau: ${transformLabel} | Sockel: ${baseLabel}`;

      const notesEl = document.getElementById('beta-model-notes');
      if (notesEl) {
        notesEl.value = notesEl.value.trim() ? `${notesEl.value.trim()}\n${line}` : line;
      }

      const cat = state.customerModel ? state.customerModel.recommendedCategory : 'standard';
      if (cat === 'colossus') {
        const el = document.getElementById('qty-colossus');
        if (el) el.value = String((parseInt(el.value, 10) || 0) + 1);
      } else if (cat === 'large') {
        const el = document.getElementById('qty-large');
        if (el) el.value = String((parseInt(el.value, 10) || 0) + 1);
      } else {
        const el = document.getElementById('qty-standard');
        if (el) el.value = String((parseInt(el.value, 10) || 0) + 1);
      }

      const transVal = transformSel ? transformSel.value : '';
      if (transVal === 'living_mini' || transVal === 'full_package') {
        const animEl = document.getElementById('qty-living-anim');
        if (animEl) animEl.value = String((parseInt(animEl.value, 10) || 0) + 1);
      }
      if (transVal === 'vtt_to_stl' || transVal === 'full_package') {
        const suppEl = document.getElementById('qty-print-supports');
        if (suppEl) suppEl.value = String((parseInt(suppEl.value, 10) || 0) + 1);
      }
      if (transVal === 'custom_paint') {
        const paintEl = document.getElementById('qty-custom-paint');
        if (paintEl) paintEl.value = String((parseInt(paintEl.value, 10) || 0) + 1);
      }

      updateCoinCalculator();

      const orderMode = document.getElementById('beta-order-mode');
      if (orderMode) orderMode.value = 'Reguläre Auftrags-Vormerkung / Armee-Projekt';

      document.getElementById('beta-test')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const schemeSel = document.getElementById('ctrl-color-scheme');
    const schemeLabel = schemeSel.options[schemeSel.selectedIndex].text;
    const line = `• 3D-Baukasten-Entwurf: ${currentBuildInfo.summary} | Stil: ${schemeLabel}`;

    const notesEl = document.getElementById('beta-model-notes');
    if (notesEl) {
      notesEl.value = notesEl.value.trim()
        ? `${notesEl.value.trim()}\n${line}`
        : line;
    }

    const setQtyEl = document.getElementById('qty-baukasten-set');
    if (setQtyEl && state.activeTab !== 'figur') {
      setQtyEl.value = String((parseInt(setQtyEl.value, 10) || 0) + 1);
      updateCoinCalculator();
    }

    const orderMode = document.getElementById('beta-order-mode');
    if (orderMode) orderMode.value = '3D-Baukasten Wunsch (Marker / Flaggen / Möbel)';

    document.getElementById('beta-test')?.scrollIntoView({ behavior: 'smooth' });
  });

  // ========================================================
  // 4. MÜNZ- & DIREKTZAHLUNGS-RECHNER
  // ========================================================
  const qtyIds = [
    'qty-standard',
    'qty-large',
    'qty-colossus',
    'qty-custom-paint',
    'qty-living-anim',
    'qty-print-supports',
    'qty-baukasten-set',
  ];

  function updateCoinCalculator() {
    const qStd = Math.max(0, parseInt(document.getElementById('qty-standard')?.value, 10) || 0);
    const qLarge = Math.max(0, parseInt(document.getElementById('qty-large')?.value, 10) || 0);
    const qCol = Math.max(0, parseInt(document.getElementById('qty-colossus')?.value, 10) || 0);
    const qPaint = Math.max(0, parseInt(document.getElementById('qty-custom-paint')?.value, 10) || 0);
    const qAnim = Math.max(0, parseInt(document.getElementById('qty-living-anim')?.value, 10) || 0);
    const qSupports = Math.max(0, parseInt(document.getElementById('qty-print-supports')?.value, 10) || 0);
    const qSet = Math.max(0, parseInt(document.getElementById('qty-baukasten-set')?.value, 10) || 0);

    const totalFigures = qStd + qLarge + qCol;
    const totalWorkpieces = totalFigures + qSet;

    const totalCoins =
      qStd * 100 +
      qLarge * 150 +
      qCol * 250 +
      qPaint * 250 +
      qAnim * 150 +
      qSupports * 150 +
      qSet * 150;

    const directEur = totalCoins === 0 ? 0 : Math.max(2.99, totalCoins / 100);

    // Intelligente Münzpaket-Empfehlung (inkl. etwaigem Aktionscode-Bonus)
    const bonusMul = 1 + state.promoBonusPct / 100;
    let chosenPack = COIN_PACKS[0];
    let packMultiplier = 1;

    if (totalCoins > 0) {
      const fitting = COIN_PACKS.find((p) => Math.floor(p.coins * bonusMul) >= totalCoins);
      if (fitting) {
        chosenPack = fitting;
      } else {
        chosenPack = COIN_PACKS[COIN_PACKS.length - 1];
        packMultiplier = Math.ceil(totalCoins / Math.floor(chosenPack.coins * bonusMul));
      }
    }

    const totalPackCoins = Math.floor(chosenPack.coins * packMultiplier * bonusMul);
    const totalPackEur = chosenPack.eur * packMultiplier;
    const leftoverCoins = Math.max(0, totalPackCoins - totalCoins);
    const effPer100 = (totalPackEur / (totalPackCoins / 100)).toFixed(2).replace('.', ',');

    document.getElementById('calc-total-models').textContent = `${totalWorkpieces} ${totalWorkpieces === 1 ? 'Werkstück' : 'Werkstücke'}`;
    document.getElementById('calc-total-coins').textContent = `${totalCoins.toLocaleString('de-DE')} Münzen`;
    document.getElementById('calc-direct-eur').textContent = `${directEur.toFixed(2).replace('.', ',')} €`;
    document.getElementById('calc-pack-eur').textContent = `${totalPackEur.toFixed(2).replace('.', ',')} €`;

    const packLabelPrefix = packMultiplier > 1 ? `${packMultiplier}× ` : '';
    const promoSuffix = state.promoBonusPct > 0 ? ` + ${state.promoBonusPct} % Bonus (${state.promoCodeName})` : '';
    document.getElementById('calc-pack-name').textContent = `Empfehlung: ${packLabelPrefix}${chosenPack.name}${promoSuffix}`;
    document.getElementById('calc-pack-savings').innerHTML =
      `Effektiv nur <strong>${effPer100} €</strong> je 100 Münzen — und dir bleiben <strong>${leftoverCoins.toLocaleString('de-DE')} Münzen</strong> dauerhaft als Guthaben erhalten!`;

    // Bearbeitungszeit & Großauftrags-Schutzhinweis
    let timeParts = ['bis zu 72 Std. Regelzeit'];
    if (qPaint > 0) timeParts.push('+ 48 Std. (manuelle Wunschfarben-Prüfung)');
    if (qAnim > 0) timeParts.push('+ Living-Miniature Fein-Rigging');
    if (qSupports > 0) timeParts.push('+ Slicer-Baumstützenprüfung');
    if (totalFigures > 15) {
      const extraWaves = Math.ceil((totalFigures - 15) / 25);
      timeParts.push(`+ ${extraWaves * 24}–${extraWaves * 48} Std. (Großauftrag in Wellen)`);
    }
    document.getElementById('calc-turnaround-text').textContent = timeParts.join(' ');

    const bulkWarn = document.getElementById('calc-bulk-warning');
    if (bulkWarn) {
      bulkWarn.classList.toggle('is-visible', totalFigures > 15 || totalCoins >= 5000);
    }
  }

  qtyIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateCoinCalculator);
  });

  // Aktionscode einlösen
  document.getElementById('btn-apply-promo')?.addEventListener('click', () => {
    const raw = (document.getElementById('promo-code-input')?.value || '').trim().toUpperCase();
    const fb = document.getElementById('promo-feedback');
    if (!fb) return;

    const validCodes = {
      SCHMIEDESTART: 10,
      BAAL10: 10,
      AURITAN: 15,
    };

    if (validCodes[raw]) {
      state.promoBonusPct = validCodes[raw];
      state.promoCodeName = raw;
      fb.style.color = '#7ef2a6';
      fb.textContent = `✅ Aktionscode „${raw}“ aktiv: Du erhältst +${validCodes[raw]} % Extra-Schmiedemünzen auf jedes Münzpaket!`;
      fb.style.display = 'block';
    } else {
      state.promoBonusPct = 0;
      state.promoCodeName = '';
      fb.style.color = '#ffb3ad';
      fb.textContent = raw
        ? `ℹ️ Code „${raw}“ nicht erkannt. Tipp zum Testen: SCHMIEDESTART (+10 % Bonus-Münzen).`
        : 'Bitte gib einen Aktionscode ein (z. B. SCHMIEDESTART).';
      fb.style.display = 'block';
    }
    updateCoinCalculator();
  });

  // Kalkulation ins Anfrageformular übernehmen
  document.getElementById('btn-transfer-calc-to-beta')?.addEventListener('click', () => {
    const qStd = parseInt(document.getElementById('qty-standard')?.value, 10) || 0;
    const qLarge = parseInt(document.getElementById('qty-large')?.value, 10) || 0;
    const qCol = parseInt(document.getElementById('qty-colossus')?.value, 10) || 0;
    const qPaint = parseInt(document.getElementById('qty-custom-paint')?.value, 10) || 0;
    const qAnim = parseInt(document.getElementById('qty-living-anim')?.value, 10) || 0;
    const qSupports = parseInt(document.getElementById('qty-print-supports')?.value, 10) || 0;
    const qSet = parseInt(document.getElementById('qty-baukasten-set')?.value, 10) || 0;
    const coinsTxt = document.getElementById('calc-total-coins')?.textContent || '';

    const parts = [
      `${qStd}× Standard`,
      `${qLarge}× Groß/Oger`,
      `${qCol}× Monster/Panzer`,
    ];
    if (qPaint > 0) parts.push(`${qPaint}× Wunschfarbe`);
    if (qAnim > 0) parts.push(`${qAnim}× Living-Anim`);
    if (qSupports > 0) parts.push(`${qSupports}× Baumstützen-STL`);
    if (qSet > 0) parts.push(`${qSet}× Baukasten-Set`);

    const summaryLine = `[Kalkulation aus Münz-Rechner: ${parts.join(', ')} = ${coinsTxt}]`;
    const notesEl = document.getElementById('beta-model-notes');
    if (notesEl) {
      notesEl.value = notesEl.value.trim()
        ? `${notesEl.value.trim()}\n${summaryLine}`
        : summaryLine;
    }
    document.getElementById('beta-test')?.scrollIntoView({ behavior: 'smooth' });
  });

  // ========================================================
  // 5. BETA- & AUFTRAGS-FORMULAR ABSENDEN (INKL. LOCALSTORAGE-FALLBACK)
  // ========================================================
  const orderForm = document.getElementById('schmiede-order-form');
  if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = (document.getElementById('beta-name')?.value || '').trim();
      const email = (document.getElementById('beta-email')?.value || '').trim();
      const targetVtt = document.getElementById('beta-vtt-target')?.value || 'Tabletop Simulator';
      const orderMode = document.getElementById('beta-order-mode')?.value || 'Gratis-Beta';
      const modelNotes = (document.getElementById('beta-model-notes')?.value || '').trim();
      const hpWebsite = (document.getElementById('beta-hp-website')?.value || '').trim();
      const feedbackEl = document.getElementById('beta-form-feedback');

      if (!email || !feedbackEl) return;

      const submitBtn = orderForm.querySelector('button[type="submit"]');
      const origHtml = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Wird an die Schmiede übertragen...</span>';
      }

      const fullNote = `[Zielsystem: ${targetVtt}] [Modus: ${orderMode}]\n${modelNotes || '(Details folgen per Antwortmail)'}`;

      let apiOk = false;
      try {
        const res = await fetch(WAITLIST_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            source: 'baalphemor-gaming.de/schmiede',
            interests: [orderMode, `Spieltisch: ${targetVtt}`],
            games: ['Miniaturen-Schmiede'],
            note: fullNote,
            website: hpWebsite,
          }),
        });
        apiOk = res.ok;
      } catch (err) {
        console.warn('Schmiede-API offline, sichere lokal:', err);
      }

      try {
        const raw = localStorage.getItem('baalphemor_gaming_leads');
        const list = raw ? JSON.parse(raw) : [];
        list.push({
          name,
          email,
          types: [orderMode, `Spieltisch: ${targetVtt}`],
          games: ['Miniaturen-Schmiede'],
          note: fullNote,
          timestamp: new Date().toISOString(),
          source: 'baalphemor-gaming.de/schmiede',
          forwardedAt: apiOk ? new Date().toISOString() : null,
        });
        localStorage.setItem('baalphemor_gaming_leads', JSON.stringify(list));
      } catch (_) {}

      const mailSubject = encodeURIComponent(`Miniaturen-Schmiede (${orderMode}) — ${name || email}`);
      const mailBody = encodeURIComponent(
        `Hallo Baal,\n\nhier sind die Details / der Link zu meiner Schmiede-Anfrage:\n- Spieltisch: ${targetVtt}\n- Modus: ${orderMode}\n- Beschreibung: ${modelNotes || '-'}\n\nViele Grüße\n${name}`
      );
      const mailHref = `mailto:info@baalphemor.de?subject=${mailSubject}&body=${mailBody}`;

      const escHtml = (s) =>
        String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

      feedbackEl.innerHTML = `⚒️ <strong>Anfrage in der Schmiede eingegangen!</strong> Danke dir, <strong>${escHtml(name || email)}</strong> (${escHtml(orderMode)} · <em>${escHtml(targetVtt)}</em>). ${
        apiOk
          ? 'Deine Nachricht wurde direkt an <strong>info@baalphemor.de</strong> übermittelt.'
          : 'Deine Anfrage ist lokal gesichert und wird automatisch synchronisiert.'
      }<br>Du möchtest direkt eine Beispiel-STL anhängen? <a href="${mailHref}" style="color:var(--gold-bright); font-weight:700; text-decoration:underline;">Direkt per E-Mail an info@baalphemor.de nachsenden ➔</a>`;
      feedbackEl.style.display = 'block';

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origHtml;
      }
    });
  }

  // ========================================================
  // RENDER-SCHLEIFE STARTEN
  // ========================================================
  rebuildWorkpiece(true);
  updateCoinCalculator();

  function animate() {
    requestAnimationFrame(animate);
    if (state.autoSpin) {
      workpieceGroup.rotation.y += 0.0045;
    }
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSchmiede);
} else {
  initSchmiede();
}

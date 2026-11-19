#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
BAALPHEMOR GAMING — Multi-VTT Hosting & Manifest Hub Builder
Erzeugt und verifiziert die zentrale VTT-Verzeichnisstruktur unter:
  H:\\Auritan\\Auritan\\marketing\\baalphemor-gaming\\vtt\\

Unterstützt alle 4 VTT-Kanäle für Die Hogrur (v1.1.0) & alle künftigen BAALPHEMOR-Pakete:
  1. Foundry VTT (`foundryvtt.com`) — Starter-ZIP + Manifest + geschütztes Vollpaket-Manifest + Template
  2. Moulinette Cloud (`assets.moulinette.cloud`) — Patreon-OAuth Ordnerstandard
  3. Fantasy Grounds Unity ("The Forge" `forge.fantasygrounds.com`) — Starter `.mod` + XML-Template
  4. Owlbear Rodeo 2.0 (`extensions.owlbear.rodeo`) — Live `baalphemor-vault` Extension (`manifest.json`,
     Multi-Pack-Dropdown `packs_index.json`, 1-Klick 2x2 Karten-Spawner) + Starter-2x2-ZIP + Template
"""

from __future__ import annotations

import io
import json
import re
import shutil
import zipfile
from pathlib import Path
from PIL import Image

WEB_ROOT = Path(r"H:\Auritan\Auritan\marketing\baalphemor-gaming")
VTT_ROOT = WEB_ROOT / "vtt"
HOGRUR_ROOT = Path(r"H:\Rollenspiel_Codex\exports\HOGRUR_5E_GESAMTPAKET")
HOGRUR_PACK_SRC = HOGRUR_ROOT / "FoundryVTT_Companion_Pack"

BASE_URL = "https://baalphemor-gaming.de/vtt"
R2_PUBLIC_URL = "https://pub-c383b4e0b43d4191ae726141ddfc8db5.r2.dev/vtt"

STARTER_ID = "baalphemor-hogrur-5e-starter"
FULL_ID = "baalphemor-hogrur-5e"
VERSION = "1.1.0"


def quantize_png_bytes(src_path: Path, max_dim: int | None = None) -> bytes:
    """Proportionale Skalierung (1:1 Seitenverhältnis bewahrt!) + PNG8+Alpha Quantisierung."""
    with Image.open(src_path) as im:
        im = im.convert("RGBA")
        if max_dim and max(im.size) > max_dim:
            im.thumbnail((max_dim, max_dim), Image.Resampling.LANCZOS)
        quant = im.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG)
        buf = io.BytesIO()
        quant.save(buf, format="PNG", optimize=True)
        return buf.getvalue()


def make_square_icon_bytes(src_path: Path, size: int = 256) -> bytes:
    with Image.open(src_path) as im:
        im = im.convert("RGBA")
        w, h = im.size
        side = min(w, h)
        left = (w - side) // 2
        top = max(0, int((h - side) * 0.16))
        cropped = im.crop((left, top, left + side, top + side)).resize((size, size), Image.Resampling.LANCZOS)
        buf = io.BytesIO()
        cropped.save(buf, format="PNG", optimize=True)
        return buf.getvalue()


def rewrite_for_starter(raw_json_str: str) -> dict:
    txt = raw_json_str.replace(f"modules/{FULL_ID}/", f"modules/{STARTER_ID}/")
    txt = re.sub(
        r"tokens_tier2_animated_webm/hogrur_cannoneer_[a-z0-9_]+\.webm",
        "tokens_tier1_static/hogrur_cannoneer_topdown_bronze_oath.png",
        txt,
    )
    txt = re.sub(
        r"tokens_tier2_animated_webm/hogrur_shieldbreaker_[a-z0-9_]+\.webm",
        "tokens_tier1_static/hogrur_shieldbreaker_topdown_bronze_oath.png",
        txt,
    )
    txt = re.sub(
        rf'"modules/{re.escape(STARTER_ID)}/audio_sfx/hogrur_(?:anchor_maul_slam|drum_reload_clack|heavy_step|downed_collapse)\.ogg"',
        "null",
        txt,
    )

    data = json.loads(txt)
    if isinstance(data, dict) and data.get("module") == FULL_ID:
        data["module"] = STARTER_ID
        data["edition"] = "starter"
        data["upgradeUrlPatreon"] = "https://www.patreon.com/baalphemor"
        data["upgradeUrlItch"] = "https://baalphemor.itch.io/the-hogrur-5e-foundry-vtt"

        if "playlist" in data and isinstance(data["playlist"], dict):
            pl = data["playlist"]
            pl["name"] = "Die Hogrur — Starter SFX Sample (BAALPHEMOR GAMING)"
            sounds = pl.get("sounds", [])
            pl["sounds"] = [
                s for s in sounds if s.get("path") and "hogrur_cannon_tribarrel_blast.ogg" in s.get("path", "")
            ]

        upgrade_html = (
            "<hr><p><strong>🔥 Vollpaket-Upgrade (136 PNG-Tokens · 60 animierte VP9-Alpha-WebMs in 6 Rüstungsfarben · 5 OGG-SFX):</strong> "
            '<a href="https://www.patreon.com/baalphemor" target="_blank" rel="noopener">Patreon (ab 4 € / Moulinette-Sync)</a> · '
            '<a href="https://baalphemor.itch.io/the-hogrur-5e-foundry-vtt" target="_blank" rel="noopener">Itch.io Direktkauf</a> · '
            '<a href="https://baalphemor-gaming.de" target="_blank" rel="noopener">baalphemor-gaming.de</a></p>'
        )
        for j_key in ("journals_de", "journals_en", "journals_es", "journals_fr", "journals"):
            for j_entry in data.get(j_key, []):
                for page in j_entry.get("pages", []):
                    if isinstance(page.get("text"), dict) and "content" in page["text"]:
                        page["text"]["content"] += upgrade_html

    return data


def build_starter_init_mjs() -> str:
    src = (HOGRUR_PACK_SRC / "scripts" / "hogrur_foundry_init.mjs").read_text(encoding="utf-8")
    src = src.replace(f'const MODULE_ID = "{FULL_ID}";', f'const MODULE_ID = "{STARTER_ID}";')
    src = src.replace(
        "Hogrur 5e Companion Pack (DE / EN / ES / FR)",
        "Hogrur 5e Starter Pack (DE / EN / ES / FR)",
    )
    src = src.replace(
        "das <strong>5-Track-SFX-Soundboard</strong>",
        "die <strong>Kanonendonner-SFX-Hörprobe</strong> (Vollpaket mit 60 WebMs &amp; 136 PNGs auf patreon.com/baalphemor &amp; baalphemor.itch.io)",
    )
    return src


def build_starter_readme() -> str:
    return f"""# BAALPHEMOR GAMING — Die Hogrur / The Hogrur (Foundry VTT 5e Starter Module)

**Modul-ID / Module ID:** `{STARTER_ID}` | **Version:** `{VERSION}`  
**Kompatibilität / Compatibility:** Foundry VTT **v12 / v13 / v14** (`dnd5e` ab v3.0+)  
**Sprachen / Languages:** **Deutsch (`DE`) · English (`EN`) · Español (`ES`) · Français (`FR`)**  
**Autor & Kontakt:** **Michael Stahlschmidt ("BAALPHEMOR")** — **info@baalphemor.de** · https://baalphemor-gaming.de · https://www.patreon.com/baalphemor · https://baalphemor.itch.io

## Inhalt des kostenlosen Starter-Moduls
- **4 spielfertige `2×2` Large 5e-Akteure** in 4 Sprachen (`DE`, `EN`, `ES`, `FR`) + **Spezies, Archetyp, 3 Waffen, Munition & Übergrößen-Regeljournal**.
- **10 statische `512×512` Starter-Tokens** + **4 Portraits** + **1 Original-SFX-Hörprobe** (`hogrur_cannon_tribarrel_blast.ogg`).
- **Vollpaket (`{FULL_ID}` mit 136 PNGs, 60 animierten VP9-Alpha-WebMs & 5 SFX):** https://www.patreon.com/baalphemor & https://baalphemor.itch.io/the-hogrur-5e-foundry-vtt
"""


def stage_fantasy_grounds_hub(fg_dir: Path) -> Path:
    rel_dir = fg_dir / "releases" / f"v{VERSION}"
    tpl_dir = fg_dir / "_template-module"
    rel_dir.mkdir(parents=True, exist_ok=True)
    tpl_dir.mkdir(parents=True, exist_ok=True)

    src_starter_mod = HOGRUR_ROOT / "FantasyGrounds_5E_Pack" / f"BAALPHEMOR_Hogrur_5E_Starter_v{VERSION}.mod"
    if not src_starter_mod.exists():
        raise FileNotFoundError(f"Fantasy Grounds Starter .mod fehlt (zuerst build_fg_and_owlbear_packs.py ausführen): {src_starter_mod}")

    dst_starter_mod = rel_dir / src_starter_mod.name
    shutil.copy2(src_starter_mod, dst_starter_mod)

    (tpl_dir / "definition.template.xml").write_text(
        '<?xml version="1.0" encoding="utf-8"?>\n'
        '<root version="4.5" release="8.1|CoreRPG:6">\n'
        "  <name>BAALPHEMOR_<Slug>_5E_Complete</name>\n"
        "  <displayname>BAALPHEMOR GAMING - <Title> (5E Companion)</displayname>\n"
        "  <category>Supplement</category>\n"
        '  <author>Michael Stahlschmidt "BAALPHEMOR"</author>\n'
        "  <ruleset>5E</ruleset>\n"
        "</root>\n",
        encoding="utf-8",
    )

    (fg_dir / "README.md").write_text(
        f"# Fantasy Grounds Forge (`forge.fantasygrounds.com`) — BAALPHEMOR GAMING\n\n"
        f"- **Öffentliches Gratis-Starter-Modul (`1,97 MiB`):** `releases/v{VERSION}/{dst_starter_mod.name}`\n"
        f"- **Komplettpaket für Forge-Upload (`25,11 MiB`, 136 PNGs + 60 WebMs + 16 5E-Akteure):** liegt unter `H:\\Rollenspiel_Codex\\exports\\HOGRUR_5E_GESAMTPAKET\\FantasyGrounds_5E_Pack\\BAALPHEMOR_Hogrur_5E_Complete_v{VERSION}.mod`.\n"
        "- **Neue Pakete kompilieren:** `python H:\\Rollenspiel_Codex\\exports\\HOGRUR_5E_GESAMTPAKET\\scripts\\build_fg_and_owlbear_packs.py --pack-root <Pfad>`.\n",
        encoding="utf-8",
    )
    return dst_starter_mod


def stage_owlbear_hub(owlbear_dir: Path, tokens_keep: list[str], portraits_keep: list[str]) -> tuple[Path, Path]:
    vault_dir = owlbear_dir / "baalphemor-vault"
    pack_hogrur_dir = vault_dir / "packs" / "hogrur-5e"
    tpl_dir = owlbear_dir / "_template-pack"
    rel_dir = owlbear_dir / "releases" / f"v{VERSION}"

    for d in (
        pack_hogrur_dir / "tokens",
        pack_hogrur_dir / "portraits",
        pack_hogrur_dir / "sfx",
        tpl_dir,
        rel_dir,
    ):
        d.mkdir(parents=True, exist_ok=True)

    # 1. Extension Icon (256x256 PNG) & manifest.json
    cover_src = HOGRUR_ROOT / "Assets_und_Skizzen" / "Cover_The_Hogrur_5E_EN.png"
    if not cover_src.exists():
        cover_src = HOGRUR_PACK_SRC / "portraits" / "korvak_cannoneer_portrait.png"
    (vault_dir / "icon.png").write_bytes(make_square_icon_bytes(cover_src, size=256))

    obr_manifest = {
        "name": "BAALPHEMOR GAMING — 5E Vault",
        "version": VERSION,
        "manifest_version": 1,
        "author": "BAALPHEMOR GAMING",
        "homepage_url": "https://baalphemor-gaming.de",
        "description": "Quad-lingual (DE/EN/ES/FR) 5E Vault: 1-click 2x2 Large token spawner, statblocks & SFX.",
        "icon": f"{BASE_URL}/owlbear/baalphemor-vault/icon.png",
        "action": {
            "title": "BAALPHEMOR 5E Vault",
            "icon": f"{BASE_URL}/owlbear/baalphemor-vault/icon.svg",
            "popover": f"{BASE_URL}/owlbear/baalphemor-vault/index.html",
            "width": 420,
            "height": 620,
        },
    }
    manifest_path = vault_dir / "manifest.json"
    manifest_path.write_text(json.dumps(obr_manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # 2. Zentraler Multi-Pack-Index (`packs_index.json` -> künftige Pakete erscheinen sofort im selben Plugin!)
    packs_index = {
        "publisher": "BAALPHEMOR GAMING",
        "updatedAt": "2026-11-19",
        "packs": [
            {
                "id": "hogrur-5e",
                "label": "🔥 Die Hogrur / The Hogrur (5E · v1.1.0)",
                "disabled": False,
            },
            {
                "id": "grolme-5e",
                "label": "⏳ Grolme (5E · Demnächst / Coming Soon)",
                "disabled": True,
            },
            {
                "id": "riese-skelettriese-5e",
                "label": "⏳ Riese & Skelettriese (5E · Demnächst)",
                "disabled": True,
            },
            {
                "id": "der-offizier-5e",
                "label": "⏳ Der Offizier (5E · Demnächst)",
                "disabled": True,
            },
        ],
    }
    (vault_dir / "packs_index.json").write_text(json.dumps(packs_index, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # 3. Hogrur Pack-Daten + optimierte Starter-Tokens + SFX-Sample in die Live-Extension kopieren
    src_vault_json = HOGRUR_ROOT / "OwlbearRodeo_2x2_Pack" / "hogrur_owlbear_vault_pack.json"
    shutil.copy2(src_vault_json, pack_hogrur_dir / "pack.json")

    for t in tokens_keep:
        (pack_hogrur_dir / "tokens" / t).write_bytes(
            quantize_png_bytes(HOGRUR_PACK_SRC / "tokens_tier1_static" / t, max_dim=512)
        )
    for p in portraits_keep:
        (pack_hogrur_dir / "portraits" / p).write_bytes(
            quantize_png_bytes(HOGRUR_PACK_SRC / "portraits" / p, max_dim=512)
        )
    shutil.copy2(
        HOGRUR_PACK_SRC / "audio_sfx" / "hogrur_cannon_tribarrel_blast.ogg",
        pack_hogrur_dir / "sfx" / "hogrur_cannon_tribarrel_blast.ogg",
    )

    # 4. Starter-2x2-ZIP spiegeln & Template für neue Pakete ablegen
    src_obr_starter = HOGRUR_ROOT / "OwlbearRodeo_2x2_Pack" / f"Hogrur_5E_OwlbearRodeo_Starter_2x2_v{VERSION}.zip"
    dst_obr_starter = rel_dir / src_obr_starter.name
    shutil.copy2(src_obr_starter, dst_obr_starter)

    (tpl_dir / "pack.template.json").write_text(
        json.dumps(
            {
                "packId": "<asset-slug>-5e",
                "version": "1.0.0",
                "gridCells": {"width": 1, "height": 1, "imagePx": 512, "obrDpi": 512},
                "note": "Für Medium (1x1) obrDpi=512 bei 512px setzen; für Large (2x2) obrDpi=256; für Huge (3x3) obrDpi=170.",
                "sfxSample": "sfx/sample.ogg",
                "upgradeLinks": {
                    "patreon": "https://www.patreon.com/baalphemor",
                    "itchVtt": "https://baalphemor.itch.io",
                },
                "locales": {"de": {"title": "", "actors": [], "rules": []}, "en": {"title": "", "actors": [], "rules": []}},
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )

    (owlbear_dir / "STORE_SUBMISSION_VORLAGE.md").write_text(
        f"""# Owlbear Rodeo 2.0 Extension & Asset-Pack — Einreichungs-Vorlage

## 1. Sofortiger Live-Installationslink (sobald `baalphemor-gaming.de` gepusht ist)
- **Extension Manifest URL:** `{BASE_URL}/owlbear/baalphemor-vault/manifest.json`
- In Owlbear Rodeo (`https://www.owlbear.rodeo`): **Extensions -> Add Extension (`+`) -> URL einfügen -> Add**.

## 2. Offizieller Owlbear Rodeo Extension Store (`extensions.owlbear.rodeo`)
Einmal einreichen – und **alle zukünftigen BAALPHEMOR-Pakete** (*Grolme*, *Riese & Skelettriese*, *Der Offizier*, *Auritan*) erscheinen über `packs_index.json` automatisch im selben Plugin ohne erneute Store-Prüfung!
- **Title:** `BAALPHEMOR GAMING — 5E Token & Statblock Vault`
- **Manifest URL:** `{BASE_URL}/owlbear/baalphemor-vault/manifest.json`
- **Category:** `Automation` / `Assets`

## 3. Komplettes Bulk-ZIP (`24,87 MiB`, 136 PNGs + 60 VP9-WebMs mit `*_2x2`-Suffix)
- Liegt abholbereit unter: `H:\\Rollenspiel_Codex\\exports\\HOGRUR_5E_GESAMTPAKET\\OwlbearRodeo_2x2_Pack\\Hogrur_5E_OwlbearRodeo_Complete_2x2_v{VERSION}.zip`
""",
        encoding="utf-8",
    )
    return manifest_path, dst_obr_starter


def main() -> None:
    if not HOGRUR_PACK_SRC.exists():
        raise FileNotFoundError(f"Quellpaket fehlt: {HOGRUR_PACK_SRC}")

    starter_dir = VTT_ROOT / "foundry" / "modules" / STARTER_ID
    starter_rel_dir = starter_dir / "releases" / f"v{VERSION}"
    full_dir = VTT_ROOT / "foundry" / "modules" / FULL_ID
    template_dir = VTT_ROOT / "foundry" / "modules" / "_template-module"
    moulinette_dir = VTT_ROOT / "moulinette"
    fg_dir = VTT_ROOT / "fantasygrounds"
    owlbear_dir = VTT_ROOT / "owlbear"

    for d in (starter_rel_dir, full_dir, template_dir, moulinette_dir, fg_dir, owlbear_dir):
        d.mkdir(parents=True, exist_ok=True)

    # 1. Foundry Starter-Manifest & ZIP
    starter_manifest_url = f"{BASE_URL}/foundry/modules/{STARTER_ID}/module.json"
    starter_zip_name = f"{STARTER_ID}-v{VERSION}.zip"
    starter_download_url = f"{BASE_URL}/foundry/modules/{STARTER_ID}/releases/v{VERSION}/{starter_zip_name}"

    starter_manifest = {
        "id": STARTER_ID,
        "title": "BAALPHEMOR GAMING — Die Hogrur / The Hogrur (5e Starter)",
        "description": "Free quad-lingual (DE/EN/ES/FR) 5e VTT Starter Module: 4 ready-to-play 2x2 Large Hogrur Actors, playable Hogrur species, Cannoneer fighter subclass, siege weapons, oversized gear rules, 10 static 512x512 tokens & cannon blast SFX sample. Full 60-WebM + 136-PNG pack available on Patreon & Itch.io.",
        "version": VERSION,
        "compatibility": {"minimum": "12", "verified": "13", "maximum": "14"},
        "authors": [
            {
                "name": 'Michael Stahlschmidt "BAALPHEMOR"',
                "email": "info@baalphemor.de",
                "url": "https://baalphemor-gaming.de",
                "patreon": "baalphemor",
                "flags": {},
            }
        ],
        "url": "https://baalphemor-gaming.de",
        "manifest": starter_manifest_url,
        "download": starter_download_url,
        "readme": "https://baalphemor.itch.io/the-hogrur-5e-foundry-vtt",
        "bugs": "mailto:info@baalphemor.de",
        "esmodules": ["scripts/hogrur_foundry_init.mjs"],
        "relationships": {
            "systems": [
                {"id": "dnd5e", "type": "system", "compatibility": {"minimum": "3.0.0", "verified": "4.3.0"}}
            ]
        },
        "flags": {
            STARTER_ID: {
                "defaultTokenFootprint": {"width": 2, "height": 2, "size": "lg", "gridFeet": "10x10"},
                "fullPackModuleId": FULL_ID,
                "patreonUrl": "https://www.patreon.com/baalphemor",
                "itchUrl": "https://baalphemor.itch.io/the-hogrur-5e-foundry-vtt",
            }
        },
    }

    starter_manifest_bytes = (json.dumps(starter_manifest, indent=2, ensure_ascii=False) + "\n").encode("utf-8")
    (starter_dir / "module.json").write_bytes(starter_manifest_bytes)

    portraits_keep = [
        "korvak_cannoneer_portrait.png",
        "bramm_ironkeel_portrait.png",
        "hogrur_train_guard_portrait.png",
        "hogrur_siege_cannoneer_portrait.png",
    ]
    tokens_keep = [
        "hogrur_cannoneer_topdown_bronze_oath.png",
        "hogrur_shieldbreaker_topdown_bronze_oath.png",
        "korvak_cannoneer_bronze_oath_round.png",
        "korvak_cannoneer_bronze_oath_square.png",
        "bramm_ironkeel_gold_champion_round.png",
        "bramm_ironkeel_gold_champion_square.png",
        "hogrur_train_guard_iron_guard_round.png",
        "hogrur_train_guard_iron_guard_square.png",
        "hogrur_siege_cannoneer_round.png",
        "hogrur_siege_cannoneer_square.png",
    ]
    sfx_keep = ["hogrur_cannon_tribarrel_blast.ogg"]

    raw_import = (HOGRUR_PACK_SRC / "packs" / "hogrur_actors_5e_import.json").read_text(encoding="utf-8")
    starter_import_data = rewrite_for_starter(raw_import)
    starter_import_str = json.dumps(starter_import_data, indent=2, ensure_ascii=False) + "\n"

    zip_path = starter_rel_dir / starter_zip_name
    bundled_rel_paths: set[str] = set()

    with zipfile.ZipFile(zip_path, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as zf:
        def add_bytes(arc_rel: str, payload: bytes) -> None:
            zf.writestr(f"{STARTER_ID}/{arc_rel}", payload)
            bundled_rel_paths.add(arc_rel)

        add_bytes("module.json", starter_manifest_bytes)
        add_bytes("README_FOUNDRY_VTT.md", build_starter_readme().encode("utf-8"))
        add_bytes("scripts/hogrur_foundry_init.mjs", build_starter_init_mjs().encode("utf-8"))
        add_bytes("packs/hogrur_actors_5e_import.json", starter_import_str.encode("utf-8"))

        for single_file in sorted((HOGRUR_PACK_SRC / "packs" / "actors_single").glob("*.json")):
            single_rewritten = rewrite_for_starter(single_file.read_text(encoding="utf-8"))
            add_bytes(
                f"packs/actors_single/{single_file.name}",
                (json.dumps(single_rewritten, indent=2, ensure_ascii=False) + "\n").encode("utf-8"),
            )
        for p_name in portraits_keep:
            add_bytes(f"portraits/{p_name}", quantize_png_bytes(HOGRUR_PACK_SRC / "portraits" / p_name, max_dim=1024))
        for t_name in tokens_keep:
            add_bytes(f"tokens_tier1_static/{t_name}", quantize_png_bytes(HOGRUR_PACK_SRC / "tokens_tier1_static" / t_name, max_dim=512))
        for s_name in sfx_keep:
            add_bytes(f"audio_sfx/{s_name}", (HOGRUR_PACK_SRC / "audio_sfx" / s_name).read_bytes())

    referenced = set(re.findall(rf"modules/{re.escape(STARTER_ID)}/([^\"\\]+)", starter_import_str))
    missing_refs = sorted(r for r in referenced if r not in bundled_rel_paths)
    if missing_refs:
        raise RuntimeError(f"Fehlende Asset-Dateien im Foundry-Starter-ZIP: {missing_refs}")

    # 2. Foundry Vollpaket-Manifest (`protected: true`) & Template
    full_manifest = json.loads((HOGRUR_PACK_SRC / "module.json").read_text(encoding="utf-8"))
    full_manifest["title"] = "BAALPHEMOR GAMING — Die Hogrur / The Hogrur (5e Pack)"
    full_manifest["authors"] = [
        {
            "name": 'Michael Stahlschmidt "BAALPHEMOR"',
            "email": "info@baalphemor.de",
            "url": "https://baalphemor-gaming.de",
            "patreon": "baalphemor",
            "flags": {},
        }
    ]
    full_manifest["url"] = "https://baalphemor-gaming.de"
    full_manifest["manifest"] = f"{BASE_URL}/foundry/modules/{FULL_ID}/module.json"
    full_manifest["protected"] = True
    (full_dir / "module.json").write_text(json.dumps(full_manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    template_manifest = {
        "id": "baalphemor-<asset-slug>-5e",
        "title": "BAALPHEMOR GAMING — <Titel DE / EN> (5e Companion Pack)",
        "description": "Quad-lingual (DE/EN/ES/FR) 5e VTT Module by BAALPHEMOR GAMING.",
        "version": "1.0.0",
        "compatibility": {"minimum": "12", "verified": "13", "maximum": "14"},
        "authors": [{"name": 'Michael Stahlschmidt "BAALPHEMOR"', "email": "info@baalphemor.de", "url": "https://baalphemor-gaming.de", "patreon": "baalphemor"}],
        "url": "https://baalphemor-gaming.de",
        "manifest": f"{BASE_URL}/foundry/modules/baalphemor-<asset-slug>-5e/module.json",
        "download": f"{R2_PUBLIC_URL}/foundry/modules/baalphemor-<asset-slug>-5e/releases/v1.0.0/baalphemor-<asset-slug>-5e-v1.0.0.zip",
        "esmodules": ["scripts/init.mjs"],
        "relationships": {"systems": [{"id": "dnd5e", "type": "system", "compatibility": {"minimum": "3.0.0", "verified": "4.3.0"}}]},
    }
    (template_dir / "module.template.json").write_text(json.dumps(template_manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # 3. Fantasy Grounds & Owlbear Rodeo 2.0 Hub bestücken
    fg_starter_mod = stage_fantasy_grounds_hub(fg_dir)
    obr_manifest_path, obr_starter_zip = stage_owlbear_hub(owlbear_dir, tokens_keep, portraits_keep)

    # 4. Zentrales Multi-VTT-Register (`vtt/catalog.json`)
    zip_size_bytes = zip_path.stat().st_size
    catalog = {
        "publisher": "BAALPHEMOR GAMING",
        "domain": "https://baalphemor-gaming.de",
        "r2AssetCdn": R2_PUBLIC_URL,
        "contact": "info@baalphemor.de",
        "patreon": "https://www.patreon.com/baalphemor",
        "itch": "https://baalphemor.itch.io",
        "drivethrurpgPublisherId": 36807,
        "updatedAt": "2026-11-19",
        "owlbearVaultExtension": {
            "name": "BAALPHEMOR GAMING — 5E Vault",
            "manifestUrl": f"{BASE_URL}/owlbear/baalphemor-vault/manifest.json",
            "packsIndexUrl": f"{BASE_URL}/owlbear/baalphemor-vault/packs_index.json",
        },
        "packages": [
            {
                "id": STARTER_ID,
                "series": "5e-species-and-foes",
                "slug": "hogrur-5e",
                "tier": "free-starter",
                "version": VERSION,
                "languages": ["de", "en", "es", "fr"],
                "vttPlatforms": ["foundry-vtt", "fantasy-grounds-forge", "owlbear-rodeo"],
                "manifestUrl": starter_manifest_url,
                "downloadUrl": starter_download_url,
                "fantasyGroundsStarterModUrl": f"{BASE_URL}/fantasygrounds/releases/v{VERSION}/{fg_starter_mod.name}",
                "owlbearStarterZipUrl": f"{BASE_URL}/owlbear/releases/v{VERSION}/{obr_starter_zip.name}",
                "zipBytes": zip_size_bytes,
                "status": "ready-for-submission",
            },
            {
                "id": FULL_ID,
                "series": "5e-species-and-foes",
                "slug": "hogrur-5e",
                "tier": "premium-companion",
                "version": VERSION,
                "languages": ["de", "en", "es", "fr"],
                "vttPlatforms": ["foundry-vtt", "moulinette-cloud", "fantasy-grounds-forge", "owlbear-rodeo", "roll20-manual-import"],
                "manifestUrl": f"{BASE_URL}/foundry/modules/{FULL_ID}/module.json",
                "protected": True,
                "storeLinks": {
                    "itchPdf": "https://baalphemor.itch.io/the-hogrur-5e",
                    "itchVtt": "https://baalphemor.itch.io/the-hogrur-5e-foundry-vtt",
                    "patreon": "https://www.patreon.com/baalphemor",
                    "drivethrurpgPdf": "https://www.drivethrurpg.com/en/product/594592",
                    "drivethrurpgVtt": "https://www.drivethrurpg.com/en/product/594593",
                },
                "status": "live",
            },
        ],
        "plannedPipeline": [
            "baalphemor-grolme-5e",
            "baalphemor-riese-skelettriese-5e",
            "baalphemor-der-offizier-5e",
            "baalphemor-auritan-bestiarium",
        ],
    }
    (VTT_ROOT / "catalog.json").write_text(json.dumps(catalog, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # 5. Übersichtsdokumentation aktualisieren
    (VTT_ROOT / "README_VTT_HOSTING.md").write_text(
        f"""# BAALPHEMOR GAMING — Multi-VTT-Asset- & Manifest-Hub (`baalphemor-gaming.de/vtt/`)

Zentrales Hosting-Verzeichnis für alle **4 direkten VTT-Integrationen** (*Die Hogrur v{VERSION}* + künftige Pakete wie *Grolme*, *Riese & Skelettriese*, *Der Offizier* & *Auritan*).

## Verzeichnisstruktur

```text
vtt/
├── catalog.json                                       # Zentrales Multi-VTT-Register
├── foundry/
│   └── modules/
│       ├── _template-module/                          # Vorlage für künftige Foundry-Module
│       ├── {STARTER_ID}/             # Gratis-Starter-Modul ({zip_size_bytes/(1024*1024):.2f} MiB)
│       │   ├── module.json
│       │   └── releases/v{VERSION}/{starter_zip_name}
│       └── {FULL_ID}/                     # Geschütztes Vollpaket-Manifest (protected: true)
│           └── module.json
├── moulinette/
│   └── PACK_STRUCTURE_GUIDE.md                        # Patreon-OAuth Streaming-Struktur
├── fantasygrounds/
│   ├── _template-module/definition.template.xml       # Vorlage für künftige 5E .mod-Pakete
│   └── releases/v{VERSION}/{fg_starter_mod.name} # Gratis-Starter .mod ({fg_starter_mod.stat().st_size/(1024*1024):.2f} MiB)
└── owlbear/
    ├── _template-pack/pack.template.json              # Vorlage für neue Pakete in der Vault-Extension
    ├── baalphemor-vault/                              # Live Owlbear Rodeo 2.0 Extension (1-Klick 2x2 Spawner!)
    │   ├── manifest.json
    │   ├── index.html · vault.css · vault.js
    │   ├── packs_index.json
    │   └── packs/hogrur-5e/ (pack.json + tokens + portraits + sfx)
    └── releases/v{VERSION}/{obr_starter_zip.name} # Starter 2x2 Bulk-ZIP ({obr_starter_zip.stat().st_size/(1024*1024):.2f} MiB)
```

## Direkte Manifest- & Einreichungs-URLs
1. **Foundry VTT (`foundryvtt.com/packages/submit`):**
   `{starter_manifest_url}`
2. **Owlbear Rodeo 2.0 Extension (`owlbear.rodeo` / `extensions.owlbear.rodeo`):**
   `{BASE_URL}/owlbear/baalphemor-vault/manifest.json`
3. **Fantasy Grounds Forge (`forge.fantasygrounds.com/crafter`):**
   Starter `.mod` (`1,97 MiB`) & Complete `.mod` (`25,11 MiB` unter `H:\\Rollenspiel_Codex\\exports\\HOGRUR_5E_GESAMTPAKET\\FantasyGrounds_5E_Pack\\`)
4. **Moulinette Cloud (`assets.moulinette.cloud`):**
   Patreon-OAuth Kopplung mit `patreon.com/baalphemor`
""",
        encoding="utf-8",
    )

    print(f"[OK] Foundry Starter-ZIP:     {zip_path.name} ({zip_size_bytes / (1024*1024):.2f} MiB)")
    print(f"[OK] Fantasy Grounds Starter: {fg_starter_mod.name} ({fg_starter_mod.stat().st_size / (1024*1024):.2f} MiB)")
    print(f"[OK] Owlbear Vault Manifest:  {obr_manifest_path}")
    print(f"[OK] Owlbear Starter-ZIP:     {obr_starter_zip.name} ({obr_starter_zip.stat().st_size / (1024*1024):.2f} MiB)")


if __name__ == "__main__":
    main()

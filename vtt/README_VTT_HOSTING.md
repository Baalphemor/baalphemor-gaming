# BAALPHEMOR GAMING — Multi-VTT-Asset- & Manifest-Hub (`baalphemor-gaming.de/vtt/`)

Zentrales Hosting-Verzeichnis für alle **4 direkten VTT-Integrationen** (*Die Hogrur v1.1.0* + künftige Pakete wie *Grolme*, *Riese & Skelettriese*, *Der Offizier* & *Auritan*).

## Verzeichnisstruktur

```text
vtt/
├── catalog.json                                       # Zentrales Multi-VTT-Register
├── foundry/
│   └── modules/
│       ├── _template-module/                          # Vorlage für künftige Foundry-Module
│       ├── baalphemor-hogrur-5e-starter/             # Gratis-Starter-Modul (1.88 MiB)
│       │   ├── module.json
│       │   └── releases/v1.1.0/baalphemor-hogrur-5e-starter-v1.1.0.zip
│       └── baalphemor-hogrur-5e/                     # Geschütztes Vollpaket-Manifest (protected: true)
│           └── module.json
├── moulinette/
│   └── PACK_STRUCTURE_GUIDE.md                        # Patreon-OAuth Streaming-Struktur
├── fantasygrounds/
│   ├── _template-module/definition.template.xml       # Vorlage für künftige 5E .mod-Pakete
│   └── releases/v1.1.0/BAALPHEMOR_Hogrur_5E_Starter_v1.1.0.mod # Gratis-Starter .mod (1.97 MiB)
└── owlbear/
    ├── _template-pack/pack.template.json              # Vorlage für neue Pakete in der Vault-Extension
    ├── baalphemor-vault/                              # Live Owlbear Rodeo 2.0 Extension (1-Klick 2x2 Spawner!)
    │   ├── manifest.json
    │   ├── index.html · vault.css · vault.js
    │   ├── packs_index.json
    │   └── packs/hogrur-5e/ (pack.json + tokens + portraits + sfx)
    └── releases/v1.1.0/Hogrur_5E_OwlbearRodeo_Starter_2x2_v1.1.0.zip # Starter 2x2 Bulk-ZIP (1.72 MiB)
```

## Direkte Manifest- & Einreichungs-URLs
1. **Foundry VTT (`foundryvtt.com/packages/submit`):**
   `https://baalphemor-gaming.de/vtt/foundry/modules/baalphemor-hogrur-5e-starter/module.json`
2. **Owlbear Rodeo 2.0 Extension (`owlbear.rodeo` / `extensions.owlbear.rodeo`):**
   `https://baalphemor-gaming.de/vtt/owlbear/baalphemor-vault/manifest.json`
3. **Fantasy Grounds Forge (`forge.fantasygrounds.com/crafter`):**
   Starter `.mod` (`1,97 MiB`) & Complete `.mod` (`25,11 MiB` unter `H:\Rollenspiel_Codex\exports\HOGRUR_5E_GESAMTPAKET\FantasyGrounds_5E_Pack\`)
4. **Moulinette Cloud (`assets.moulinette.cloud`):**
   Patreon-OAuth Kopplung mit `patreon.com/baalphemor`

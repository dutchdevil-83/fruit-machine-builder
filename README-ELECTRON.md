# Electron Desktop Build — Instructies

## ⚠️ BELANGRIJK: Corporate Apparaat Waarschuwing

**Voer het Electron build-proces NIET uit op een corporate/beheerd apparaat.**

EDR-software (CrowdStrike, SentinelOne, Carbon Black, etc.) kan:

- Het gegenereerde `.exe`-bestand in quarantaine plaatsen
- Je account tijdelijk blokkeren wegens "verdachte activiteiten"
- Een melding naar het IT-securityteam sturen

**Aanbevolen**: Gebruik een persoonlijke PC of VM voor het bouwen van de EXE.

---

## Vereisten

```bash
# Installeer Electron en electron-builder (eenmalig, ~140MB)
npm install --save-dev electron electron-builder
```

## Beschikbare Commando's

### Web ZIP (veilig, werkt overal)

```bash
python build_zip.py
```

Genereert: `FruitMachineBuilder_Standalone.zip`

### Volledige Builder EXE

```bash
python build_zip.py --electron
```

Genereert: `electron-dist/FruitMachineBuilder-1.0.0-Portable.exe`

### Player-Only EXE (zonder builder tools)

```bash
python build_zip.py --electron --play
```

Genereert: `electron-dist-player/FruitMachine-Player-1.0.0-Portable.exe`

### Electron Development Mode

```bash
# Start met builder UI
npx electron . --dev

# Start met player-only mode
npx electron . --dev --play
```

## Aflevering van het EXE-bestand

1. Bouw het EXE-bestand op een **persoonlijke PC**
2. Kopieer het naar een **USB-drive**
3. Test op het doelapparaat vanaf de USB-drive (niet kopiëren naar C:\)
4. Als het doelapparaat een corporate device is: gebruik de **Web ZIP** versie in plaats daarvan

## Architectuur

```
electron/
├── main.js          # Electron hoofdproces (venster, routing)
├── preload.js       # Beveiligde bridge (EDR-detectie, contextBridge)
└── package.json     # Electron-builder configuratie
```

De preload-script scant actief draaiende processen met `tasklist` om bekende EDR-software te detecteren (CrowdStrike, SentinelOne, Carbon Black, Microsoft Defender ATP, Tanium, Cybereason). Dit resulteert in een waarschuwing in de Export Wizard.

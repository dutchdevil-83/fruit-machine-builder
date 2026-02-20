# 🎰 Fruit Machine Builder

Design, configure, test, and export custom slot machines — entirely in the browser.

## Features

| Feature | Description |
|---|---|
| **Visual Editors** | 8 dedicated tabs: Config, Symbols, Reel Strips, Paytable, Paylines, Animation, Audio, Statistics |
| **PixiJS Renderer** | Hardware-accelerated reel animations with configurable presets (elastic, linear, bounce) |
| **Web Audio Engine** | Built-in synth presets + custom MP3/WAV uploads for all game events |
| **RTP Simulator** | Web Worker-powered — run 1M+ spin simulations without freezing the UI |
| **Config Validation** | Real-time ✅/⚠️/❌ badges per editor tab + "Machine Ready" status |
| **Onboarding Wizard** | 9-step hybrid tour (modal explanations + spotlight DOM highlights) |
| **Help System** | Contextual tips per editor, collapsible inline panels |
| **Workflow Engine** | Guided step monitor with `isComplete()` condition checks |
| **Machine Templates** | Classic 3×3, Vegas 5×3, Mega 5×4 — mid-session with auto-backup |
| **Export** | Web ZIP or Electron EXE with corporate device detection |
| **Player Mode** | `?mode=play` URL param → fullscreen game without builder UI |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
# → Open http://localhost:5173/app.html

# Run tests
npm run test

# Production build
npm run build
```

## Export

```bash
# Web ZIP (standalone web app)
python build_zip.py

# Desktop EXE (requires Electron — see README-ELECTRON.md)
npm install --save-dev electron electron-builder
python build_zip.py --electron

# Player-only EXE (no builder tools)
python build_zip.py --electron --play
```

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Rendering | PixiJS 8 |
| Audio | Web Audio API (synth + file) |
| State | React Context + useReducer |
| Workers | Web Workers (RTP simulation) |
| Desktop | Electron (optional) |
| CI | GitHub Actions (Node 20/22 + Lighthouse + Copilot Review) |

## Project Structure

```
src/
├── components/     # OnboardingWizard, HelpPanel, WorkflowGuide, TemplateSelector, ExportWizard
├── data/           # helpContent.ts, templates.ts
├── editors/        # ConfigEditor, SymbolManager, ReelStripDesigner, PaytableEditor, etc.
├── simulator/      # SimulatorView, PixiReels, rtpWorker
├── store/          # configStore (React Context + reducer)
├── types/          # machine.ts (TypeScript interfaces)
├── utils/          # spinEngine, configValidator, audioEngine, deviceDetector
└── workflows/      # definitions.ts (quickStart, advancedPaylines, rtpTuning)
electron/           # main.js, preload.js, package.json
.github/
├── workflows/ci.yml
└── CODEOWNERS
```

## Branch Strategy

```
main     ← stable releases (protected: PR + CI required)
└─ develop  ← active development
     └─ feature/*  ← individual features
```

## License

MIT

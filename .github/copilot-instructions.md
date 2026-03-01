# Copilot Instructions — Fruit Machine Builder

## Project Overview

**Fruit Machine Builder** is a browser-based slot machine design tool built with React 19 + TypeScript + Vite 6. Users can visually configure symbols, reel strips, paytables, paylines, animations, and audio, then export the result as a standalone web ZIP or Electron desktop EXE.

The entry point is `app.html` (not `index.html`). The dev server opens `/app.html` automatically.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript (strict mode) |
| Build | Vite 6 (`vite.config.ts`) |
| Rendering | PixiJS 8 (reel animations) |
| Audio | Web Audio API (synth + file upload) |
| State | React Context + useReducer (`src/store/configStore`) |
| Workers | Web Workers (`src/simulator/rtpWorker`) |
| Icons | `unplugin-icons` with `compiler: 'jsx'` — import from `@iconify-json/game-icons` and `@iconify-json/lucide` |
| Testing | Vitest 3 |
| CI | GitHub Actions (Node 20 & 22, Lighthouse) |

---

## Bootstrap, Build, Test, Lint

Always run these commands from the repository root. Node 20 or 22 is required.

```bash
# Install dependencies (always run first after cloning or updating package.json)
npm ci

# Type-check only (no emit) — mirrors CI lint step
npx tsc -b --noEmit

# Run tests
npm run test

# Production build (runs tsc -b && vite build)
npm run build

# ESLint
npm run lint

# Development server (opens http://localhost:5173/app.html)
npm run dev
```

**CI order:** `npm ci` → `npx tsc -b --noEmit` → `npm run test` → `npm run build`

All four steps must pass on both Node 20 and Node 22. TypeScript is configured in strict mode with `noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`, and `noFallthroughCasesInSwitch` all enabled — avoid introducing unused variables or parameters.

---

## Project Layout

```
fruit-machine-builder/
├── app.html                  # Main entry HTML (used by Vite build + dev server)
├── index.html                # Redirect to app.html (not the build entry)
├── vite.config.ts            # Build config — entry: app.html, Icons plugin
├── tsconfig.json             # Project references (delegates to tsconfig.app.json + tsconfig.node.json)
├── tsconfig.app.json         # App compiler options (strict, ES2020, noEmit)
├── package.json              # Scripts: dev, build, lint, preview, test
├── build_zip.py              # Python script for web ZIP / Electron EXE export
├── electron/                 # Electron main process (main.js, preload.js)
└── src/
    ├── App.tsx               # Root component — tab routing across 8 editor tabs
    ├── main.tsx              # React entry point
    ├── index.css             # Global styles
    ├── components/           # OnboardingWizard, HelpPanel, WorkflowGuide, TemplateSelector, ExportWizard
    ├── data/                 # helpContent.ts, templates.ts (static config data)
    ├── editors/              # ConfigEditor, SymbolManager, ReelStripDesigner, PaytableEditor,
    │                         #   PaylinesEditor, AnimationEditor, AudioEditor, StatisticsView
    ├── simulator/            # SimulatorView.tsx, PixiReels.tsx, rtpWorker.ts (Web Worker)
    ├── store/                # configStore.tsx — global React Context + useReducer state
    ├── themes/               # Theme/CSS helpers
    ├── types/                # machine.ts (all TypeScript interfaces), waveform-playlist.d.ts
    ├── utils/                # spinEngine.ts, configValidator.ts, audioEngine.ts, deviceDetector.ts
    │                         # spinEngine.test.ts, configValidator.test.ts (Vitest)
    ├── workflows/            # definitions.ts — quickStart, advancedPaylines, rtpTuning workflow specs
    └── locales/              # i18n locale files
```

---

## Key Conventions

- **Icons:** Use `unplugin-icons` virtual imports (e.g., `import StarIcon from '~icons/lucide/star'`). Available icon sets: `@iconify-json/game-icons`, `@iconify-json/lucide`.
- **State:** All machine config lives in `src/store/configStore.tsx` via a single `MachineConfig` context. Dispatch actions from `useConfig()` hook.
- **Types:** All shared TypeScript types are in `src/types/machine.ts`. Add new types there.
- **Tests:** Place unit tests next to the file they test (e.g., `spinEngine.test.ts` alongside `spinEngine.ts`). Use Vitest.
- **Player mode:** `?mode=play` URL param activates fullscreen game without the builder UI.

---

## CI Pipeline

The CI workflow (`.github/workflows/ci.yml`) runs on pushes and PRs to `main` and `develop`:

1. **build-and-test** (matrix: Node 20, 22): `npm ci` → `npx tsc -b --noEmit` → `npm run test` → `npm run build` → upload `dist/` artifact (Node 22 only)
2. **lighthouse** (PR + main only): downloads `dist/` artifact → runs Lighthouse CI → comments scores on PR → uploads `.lighthouseci/` artifact

A PR to `main` requires CI to pass. The `CODEOWNERS` file in `.github/` governs required reviewers.

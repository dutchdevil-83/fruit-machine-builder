# Fruit Machine Builder — Task Tracker

## Phase 1: Get Running & Refactor

- [x] Remove reel/row clamping (3–5) → fully flexible grid sizes
  - [x] `configStore.ts` — min=1 for reels/rows, min=3 for strip length
  - [x] `ConfigEditor.tsx` — labels + input constraints updated
  - [x] `machine.ts` — type comments updated
- [x] Refactor Zustand → React Context
  - [x] Created `src/store/configContext.tsx` — Context + useReducer + drop-in `useConfigStore()` hook
  - [x] Updated `src/store/configStore.ts` — re-exports from configContext
  - [x] Updated `src/main.tsx` — wrapped App in `<ConfigProvider>`
- [ ] Move assets to `public/` (bg.png, sprites.png, ui.png)
- [ ] Run `python build_zip.py` to slice sprites → `public/images/`
- [x] `npm install` — dependencies are installed
- [ ] Remove `zustand` from package.json (no longer a dependency)
- [ ] Start dev server → verify `http://localhost:5173/app.html`
- [ ] Fix any TypeScript/lint issues

## Phase 2: Polish & Extend

- [ ] Unit tests for `spinEngine.ts`
- [ ] PixiJS-based reel animation (upgrade simulator from DOM)
- [ ] Audio support (spin/win SFX)
- [ ] Web Worker RTP simulator + stats dashboard
- [ ] Save/load multiple machine presets
- [ ] Responsive layout polish

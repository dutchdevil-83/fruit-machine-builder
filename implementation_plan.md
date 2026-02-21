# Implementation Plan: Sprint 6 (Interface Design) & Audio Waveform Integration

## Goal Description
The user wants to progress to the next major phase of the application:
1.  **Audio Editor (Waveform Integration):** Transition the AudioEditor placeholder into a functional multi-track viewer/editor parsing real audio using the waveform-playlist library.
2.  **Sprint 6 (Interface Design):** Create an architecture for customizing the external visual layout of the slot machine (cabinet style, background images/colors, button layouts).
3.  **Simulator Fixes:** Identify and resolve visual bugs currently plaguing the SimulatorView.tsx component (e.g., clipping, misalignment, missing textures).

## Proposed Changes

### Phase 1: Simulator Visual Fixes
*   **Investigate:** Use the browser subagent to capture a recording of the Simulator tab running a spin cycle.
*   **Fix:** Adjust CSS or PixiJS/Canvas container dimensions to prevent clipping, ensure responsive scaling based on the number of eels and ows, and ensure paylines render accurately over the grid.

### Phase 2: Audio Editor (Waveform Integration)
*   **Install Dependencies:** 
pm install waveform-playlist
*   **Component Update:** Refactor src/components/AudioEditor.tsx to mount a window.AudioContext and instantiate a WaveformPlaylist.
*   **Integration:** Parse the base64/blob URLs from the config.settings.audio.events into the playlist track array. Expose play/pause/zoom controls within the modal.

### Phase 3: Sprint 6 (Interface Design Architecture)
*   **Enhance State:** Add interface: { backgroundContext: string; buttonStyle: string; cabinetColor: string; } to the Zustand ConfigStore.
*   **New Editor Tab:** Build src/editors/InterfaceDesigner.tsx to allow users to tweak these settings.
*   **Update App Shell:** Add the new tab to App.tsx and the OnboardingWizard.
*   **Apply to Simulator:** Bind the interface state to the SimulatorView background.

## Verification Plan
1.  Run the browser subagent on /app.html -> Simulator tab to verify the grid and animations render properly.
2.  Test the Audio Editor modal to ensure it mounts the waveform canvas without crashing the AudioContext.
3.  Verify the new "Interface" tab successfully modifies the global state and updates the Simulator background in real-time.

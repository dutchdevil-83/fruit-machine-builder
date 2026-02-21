# Sprint 5 Walkthrough: Onboarding v2 + Audio Editor Placeholder

### Changes Made
1. **OnboardingWizard v2**
    - Upgraded WizardStep interface with an autoAdvance flag.
    - Updated STEPS so that actionable steps (like switching sidebar tabs) automatically advance the tour when the user successfully clicks the targeted layout element.
    - Added a global click listener to intercept interactions with the highlighted .targetSelector element, clear hints, and trigger auto-advancement seamlessly.

2. **Wrong Action Detection & Inline Hints**
    - Added an onBackdropClick callback to SpotlightOverlay to distinguish intentional skips vs wrong actions.
    - Created an inline hint message when the user clicks incorrectly.
    - Accompanied hints with a custom @keyframes fmb-shake animation for immediate visual feedback.
    
3. **Step Transition Animations**
    - Passed CSS transitions into SpotlightOverlay's tooltipStyle, enabling the tooltip box to smoothly glide across the screen when navigating between steps using all 0.4s cubic-bezier(0.25, 1, 0.5, 1).

4. **Audio Editor Placeholder**
    - Built a robust preview window in /src/components/AudioEditor.tsx showcasing what the future Waveform Playlist v5 integration will look like.
    - Refactored /src/editors/AudioConfig.tsx to render the AudioEditor modal.

### What Was Tested
- React builds correctly with npx tsc --noEmit and ESLint passes smoothly.
- Tested CSS layout structure.

### Validation Results
All code logic successfully applies and compiles without Typescript errors under strictest definitions. The FMB Tour is now genuinely interactive!

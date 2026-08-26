# Changelog — Audio Enhancer

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-26

### Initial Production Release

#### 🎧 Audio Engine & DSP
- **Full Web Audio API Graph:** Built complete 8-stage real-time DSP pipeline featuring Headroom Pre-Gain, 5-Band Parametric Equalizer, Bass Shelf, Dynamics Compressor, Mid/Side Stereo Matrix, Output Makeup Gain, Peak Limiter stage, and parallel Analyser tap.
- **7 Tuned Presets:**
  - `Original`: Clean dry bypass.
  - `Enhance`: Flagship all-day listening preset with balanced clarity and punch.
  - `Punchy / Reels`: Snappy transients and fast attack for EDM, modern pop, and short-form video edits.
  - `Bass Boost`: Controlled sub-bass enhancement with low-mid decluttering to prevent vocal mud.
  - `Vocal Clarity`: Mid-range dialogue articulation and proximity boom reduction for speech and podcasts.
  - `Night Mode`: Dynamic range leveling and gentle presence boost for quiet late-night listening.
  - `Spatial`: Expansive Mid/Side stereo widening with guaranteed mono phase compatibility.
- **Continuous Intensity Interpolation:** Smooth 0–100% parameter interpolation across EQ, compression, and stereo width.
- **Parameter Smoothing:** Universal 25ms exponential time-constant smoothing (`setTargetAtTime`) eliminating zipper noise and clicks.
- **Instant A/B Bypass:** True loudness-matched instant comparison toggle between dry and processed audio.

#### 🧩 Chrome Extension Architecture
- **Manifest V3 Compliance:** Clean separation of responsibilities between Background Service Worker and Offscreen Document.
- **Tab Capture Pipeline:** Reliable capture session management using `chrome.tabCapture.getMediaStreamId` and `getUserMedia`.
- **Fail-Safe Teardown:** Automatic stream release on tab close, reload, navigation, and error states to guarantee browser audio is never left muted.
- **SPA Navigation Support:** Lightweight content script detecting YouTube video transitions without interrupting audio capture.
- **Versioned Storage & Migrations:** Robust typed store wrapping `chrome.storage.local` with debounced writes.

#### 🎨 User Interface & Accessibility
- **Modern Audio Utility Popup:** Sleek graphite aesthetic with high-contrast text and interactive visual feedback.
- **Real-Time Spectrum Visualizer:** 32-bin frequency spectrum and output peak headroom meter (automatically pauses when popup closes to preserve CPU).
- **Advanced 5-Band Equalizer:** Expandable accordion with vertical sliders and reset action.
- **WCAG AA Compliance:** Semantic HTML, ARIA radio groups, full keyboard navigation, visible focus rings, and `prefers-reduced-motion` support.

#### 📦 Release & Tooling
- Automated build pipeline using Vite and TypeScript.
- Comprehensive unit and integration test suite with Vitest.
- Packaging script generating clean Chrome Web Store release ZIP archives.

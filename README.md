# Audio Enhancer — Real-Time Music DSP for YouTube & YouTube Music

[![Version](https://img.shields.io/badge/version-1.0.0-emerald.svg)](package.json)
[![Manifest](https://img.shields.io/badge/manifest-MV3-blue.svg)](manifest.json)
[![License](https://img.shields.io/badge/license-MIT-slate.svg)](LICENSE)
[![Privacy](https://img.shields.io/badge/privacy-100%25%20local-green.svg)](PRIVACY.md)

**Audio Enhancer** is a lightweight, privacy-first Manifest V3 Google Chrome extension that applies real-time digital signal processing (DSP) to your browser's audio stream on **YouTube** and **YouTube Music**.

Engineered around the core philosophy **"Better, not merely louder,"** Audio Enhancer utilizes multi-stage parametric tone shaping, transparent dynamic range compression, mono-compatible Mid/Side stereo widening, and peak limiting to make music and dialogue sound fuller, clearer, and punchier without listening fatigue.

---

## 🚫 Hard Constraints — What This Extension Does NOT Do

To comply strictly with browser security policies, copyright laws, and the Chrome Web Store Developer Program Policies:

- **Does NOT** bypass YouTube Premium.
- **Does NOT** block, remove, or modify advertisements.
- **Does NOT** record, rip, or download copyrighted audio to disk.
- **Does NOT** patch APKs, modify YouTube player code, or tamper with DRM.
- **Does NOT** make fraudulent "lossless" upscaling or "AI audio restoration" claims.
- **Does NOT** send audio data or browsing metadata off your device (100% local processing).

---

## 🎧 Presets & Sound Profiles

| Preset | Icon | Tagline | Best For | Acoustic Description |
|---|:---:|---|---|---|
| **Enhance** | ⚡ | All-Day Flagship | General Listening | Balanced clarity, decluttered mids, punchy low-end, and airy treble. Tuned for fatigue-free multi-hour listening. |
| **Punchy / Reels** | 💥 | Dynamic & Energetic | EDM, Pop, Reels, Edits | Fast transient attack, snappy punch, and bright definition. Perfect for electronic music and modern pop. |
| **Bass Boost** | 🔊 | Deep & Controlled | Hip-Hop, Trap, Dance | Authoritative sub-bass weight with 250 Hz decluttering so vocals and snares remain clear and unmasked. |
| **Vocal Clarity** | 🎙️ | Dialogue & Lyrics | Podcasts, Acoustic, Speech | Clean speech presence, reduced boominess, and smooth compression for acoustic tracks and dialogue. |
| **Night Mode** | 🌙 | Low-Volume Leveling | Late-Night Listening | Levels out loud peaks and lifts quiet passages with gentle dialogue presence for quiet listening. |
| **Spatial** | 🌐 | Immersive Stereo Width | Wide Soundstage | Expansive soundstage using phase-safe Mid/Side widening. Fully mono-compatible with zero vocal cancellation. |
| **Original** | ⚪ | Clean Bypass | Direct Reference | Dry, unaltered audio directly from the source. Zero coloration or processing. |

---

## 🚀 Quick Start Guide: Running the Project from Scratch

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher, recommended v20+) and **npm** installed on your computer.
- Check your installation:
  ```bash
  node -v
  npm -v
  ```
- If you don't have Node.js installed, download it from [nodejs.org](https://nodejs.org/).

### 2. Install Dependencies
Clone or download this repository, open your terminal in the project root, and run:
```bash
npm install
```

### 3. Build the Extension
Compile the TypeScript code and bundle the extension into the `dist/` directory:
```bash
npm run build
```
*(If you are developing and want live re-compilation on file save, run `npm run dev` instead).*

### 4. Load into Google Chrome
1. Open **Google Chrome** (or any Chromium browser such as Brave, Edge, Opera, or Vivaldi).
2. In the URL address bar, enter:
   ```text
   chrome://extensions/
   ```
3. In the top-right corner, toggle **Developer mode** to **ON**.
4. In the top-left corner, click **Load unpacked**.
5. In the file browser, select the **`dist`** directory inside this project folder.
6. Click **Select / Open**. **Audio Enhancer** is now installed in your browser!

### 5. Using the Extension
1. Click the **Puzzle piece icon** (Extensions menu) in Chrome's top-right toolbar.
2. Click the **Pin icon** 📌 next to **Audio Enhancer** to keep it accessible.
3. Open [YouTube](https://www.youtube.com/) or [YouTube Music](https://music.youtube.com/) and play any video or music track.
4. Click the **Audio Enhancer** icon in your toolbar and toggle the **Power Button** ON.
5. Select a preset, adjust the **Intensity** slider (0–100%), tweak **Quick Trims**, or click **A/B Bypass** to hear the instant difference!

---

## 🎁 How to Share with a Friend (No Coding Required for Them)

Your friend does **not** need Node.js, npm, or any technical setup.

### Step 1: Package the Extension ZIP
In your terminal, run:
```bash
npm run package
```
This builds the extension and creates a standalone archive in the `release/` folder:
- **File:** `release/audio-enhancer-v1.0.0.zip` (~22 KB)

### Step 2: Send the ZIP File
Send `audio-enhancer-v1.0.0.zip` to your friend via Discord, Telegram, WhatsApp, Email, AirDrop, or Google Drive.

### Step 3: Instructions for Your Friend (Copy & Paste)
> **How to install Audio Enhancer in 60 seconds:**
> 1. **Unzip the file:** Right-click `audio-enhancer-v1.0.0.zip` and extract it to a folder.
> 2. **Open Extensions:** Open Google Chrome and go to `chrome://extensions`.
> 3. **Enable Developer Mode:** Turn on the **Developer mode** toggle in the top-right corner.
> 4. **Load Extension:** Click the **Load unpacked** button in the top-left and select the unzipped folder.
> 5. **Pin & Listen:** Pin **Audio Enhancer** to your Chrome toolbar, open YouTube, play music, and turn it on!

---

## 🛠️ Developer Commands Cheat Sheet

| Command | Description |
|---|---|
| `npm install` | Installs all build tools and TypeScript definitions. |
| `npm run build` | Compiles TypeScript and creates the production `dist/` bundle. |
| `npm run dev` | Runs Vite in development watch mode for live updates. |
| `npm test` | Runs the full Vitest unit and integration test suite. |
| `npm run typecheck` | Runs strict TypeScript type checking (`tsc --noEmit`). |
| `npm run lint` | Runs ESLint to check code quality and formatting. |
| `npm run package` | Builds the project and creates the shareable release ZIP archive. |

---

## 🏗️ Architecture & Signal Chain

```
[ Active YouTube Tab ]
         │ (tabCapture streamId)
         ▼
[ Background Service Worker ] (MV3 Lifecycle, routing, tab events)
         │
         ▼
[ Offscreen Document ] (Persistent Web Audio DOM Context)
         │
         ├─► [ MediaStreamAudioSourceNode ] (Tab Audio)
         ├─► [ Input Pre-Gain Node ] (-4 dB headroom)
         ├─► [ 5-Band Tone Equalizer ] (Chained BiquadFilterNodes)
         ├─► [ Bass Enhancement Shelf ] (80–120 Hz)
         ├─► [ Dynamics Compressor ] (Musical soft-knee leveling)
         ├─► [ Mid/Side Stereo Matrix ] (Phase-safe M/S widening)
         ├─► [ Output Makeup Gain ] (Loudness-matched compensation)
         ├─► [ Peak Limiter Stage ] (Fast 20:1 compressor + safety ceiling)
         │
         ├─► [ Analyser Tap ] ──► (Popup Visualizer / Peak Meter)
         ▼
[ AudioContext.destination ] ──► Speakers / Headphones
```

- **Offscreen Document Host:** Manifest V3 background service workers cannot host persistent Web Audio graphs. Audio Enhancer uses Chrome's `offscreen` API to host the DSP graph cleanly and independently.
- **Fail-Safe Audio Teardown:** When enhancement is turned OFF, the tab closes, or navigation occurs, all media tracks are cleanly stopped and the `AudioContext` is released, instantly restoring default Chrome tab audio.
- **Zero-Click Parameter Smoothing:** All parameter changes use `AudioParam.setTargetAtTime(target, now, 0.025)` with a 25ms exponential ramp, eliminating clicks, pops, and zipper noise.
- **Mono-Compatible Stereo M/S Widening:** Side channel boosts cancel completely to zero in mono fold-down ($L+R$), preserving vocal energy with zero phase comb filtering.

---

## 🔒 Permissions & Privacy

Audio Enhancer requests the absolute minimum permissions required to operate:

| Permission | Technical Need & Justification |
|---|---|
| `tabCapture` | Captures the active tab's audio stream for local Web Audio DSP processing. |
| `offscreen` | Hosts the Web Audio API graph in a sandboxed offscreen DOM context (MV3 requirement). |
| `storage` | Stores your presets, intensity, and trim preferences locally on your machine via `chrome.storage.local`. |
| `activeTab` | Detects the active YouTube tab when you click the extension popup. |
| `host_permissions` | Scoped strictly to `*://*.youtube.com/*` and `*://music.youtube.com/*`. |

Read our complete [Privacy Policy](PRIVACY.md) and [Security Architecture](SECURITY.md).

---

## ❓ Troubleshooting

- **"Enhancement Inactive / Open YouTube":** Ensure that the active tab in your browser is on `youtube.com` or `music.youtube.com`.
- **Audio sounds unchanged?** Make sure the master power toggle in the popup is active (turns green) and that the **A/B Bypass** button is disabled.
- **Made changes to the code?** Run `npm run build` (or have `npm run dev` running), then navigate to `chrome://extensions/` and click the **Reload 🔄** icon on the Audio Enhancer extension card.

---

## 📄 Documentation Index

- [Architecture & DSP Pipeline](docs/architecture.md)
- [Preset Tuning Log & Audio Rationale](docs/preset-tuning-log.md)
- [Performance & Latency Report](docs/performance-report.md)
- [Known Technical Limitations](docs/known-limitations.md)
- [Dependency Review](docs/dependency-review.md)
- [Manual Audio QA Checklist](docs/manual-qa-checklist.md)

---

## ⚖️ License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

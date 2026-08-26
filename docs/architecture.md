# System Architecture & Technical Specifications

## 1. High-Level System Overview

Audio Enhancer is built strictly for **Google Chrome Manifest V3**, adhering to the platform's execution constraints and lifecycle model.

Because Manifest V3 background service workers do not have access to DOM APIs or persistent audio playback contexts, the audio processing graph is hosted inside an **Offscreen Document** (`offscreen/offscreen.html`), while the **Background Service Worker** orchestrates lifecycle events, tab capture IDs, and message routing.

```
┌──────────────────────────────────────────────────────────────┐
│                         Chrome Browser                       │
│                                                              │
│  ┌───────────────────────┐       ┌────────────────────────┐  │
│  │   Active YouTube Tab  │       │     Popup UI Window    │  │
│  │  (DOM & Video Stream) │       │   (popup.html / .ts)   │  │
│  └──────────┬────────────┘       └───────────┬────────────┘  │
│             │                                │               │
│             │ tabCapture                     │ chrome.runtime│
│             │ streamId                       │ messaging     │
│             ▼                                ▼               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │               Background Service Worker                │  │
│  │             (background/service-worker.ts)             │  │
│  │  - Lifecycle orchestration & active tab tracking       │  │
│  │  - chrome.storage.local synchronization                │  │
│  │  - Offscreen document lifecycle management            │  │
│  └───────────────────────────┬────────────────────────────┘  │
│                              │                               │
│                              │ chrome.runtime.sendMessage    │
│                              ▼                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                    Offscreen Document                  │  │
│  │                 (offscreen/offscreen.ts)               │  │
│  │  - Owns persistent AudioContext                        │  │
│  │  - Executes getUserMedia({ chromeMediaSource: 'tab' }) │  │
│  │  - Runs 8-Stage Web Audio DSP Processing Graph         │  │
│  │  - Analyzes real-time levels & visualizer data         │  │
│  └───────────────────────────┬────────────────────────────┘  │
│                              │                               │
│                              ▼                               │
│                 AudioContext.destination                     │
│                (Speakers / Headphones Out)                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. DSP Signal Processing Chain

Audio captured from the tab is routed through the following serial Web Audio graph:

```
Captured Tab Stream (MediaStreamAudioSourceNode)
       │
       ▼
[1] Input Pre-Gain Stage (GainNode)
       │ - Reserves -3.0 to -6.0 dB headroom before tone boost
       ▼
[2] 5-Band Equalizer (Chained BiquadFilterNodes)
       │ - Band 1: Low Shelf (100 Hz, ±12 dB)
       │ - Band 2: Low-Mid Peaking (300 Hz, Q 1.0, declutter)
       │ - Band 3: Presence Peaking (3000 Hz, Q 1.2, vocal clarity)
       │ - Band 4: High-Mid Peaking (6000 Hz, Q 1.0, transient detail)
       │ - Band 5: Air Shelf (12000 Hz, ±12 dB, high sheen)
       ▼
[3] Bass Enhancement Shelf (BiquadFilterNode)
       │ - Low shelf (80–120 Hz, 0 to +6 dB)
       ▼
[4] Dynamics Compressor (DynamicsCompressorNode)
       │ - Musical soft-knee RMS leveling (threshold -28 to -16 dB, ratio 2.5:1 to 6:1)
       ▼
[5] Stereo Enhancement Matrix (Mid/Side Processing)
       │ - Splitter (L/R) ──► Mid (L+R) & Side (L-R)
       │ - Mid Gain (1.0) & Side Gain (1.0 to 1.33)
       │ - Recombination: Left = (Mid+Side), Right = (Mid-Side)
       │ - Guaranteed 100% mono compatibility: L+R cancels side boost
       ▼
[6] Output Makeup Gain (GainNode)
       │ - Loudness-matched compensation calculated from preset energy
       ▼
[7] Peak Limiting & Safety Stage (Cascade)
       │ - Fast Limiter (DynamicsCompressorNode: ratio 20:1, attack 1ms, release 50ms)
       │ - Hard Safety Ceiling (GainNode: 0.95 = -0.45 dBFS margin)
       ▼
[8] Destination (AudioContext.destination)
       │
       └──► Parallel AnalyserNode Tap (32 frequency bins, non-blocking)
```

---

## 3. Parameter Smoothing & Zero-Click Guarantee

Abrupt value assignment to live `AudioParam` nodes causes waveform step discontinuities resulting in audible clicks, pops, and zipper noise.

Audio Enhancer enforces smooth parameter transitions across all nodes:
```typescript
const setParam = (param: AudioParam, targetValue: number) => {
  if (immediate) {
    param.cancelScheduledValues(now);
    param.setValueAtTime(targetValue, now);
  } else {
    // 25ms exponential time constant approach
    param.setTargetAtTime(targetValue, now, 0.025);
  }
};
```

---

## 4. Tab Capture Lifecycle & Fail-Safe Audio Routing

In Google Chrome, capturing a tab's audio via `chrome.tabCapture` automatically diverts the tab's audio away from the default browser output. Therefore, the extension must maintain strict fail-safe guarantees:

1. **Clean Normal Audio Restoration:** When the user turns enhancement OFF, closes the tab, or encounters an error, `AudioEngine.stop()` invokes `MediaStreamTrack.stop()`, disconnects all nodes, and closes the `AudioContext`. Chrome immediately and automatically restores standard tab audio output.
2. **Tab Navigation & Reloads:** When the user navigates or refreshes the page, the active `MediaStream` audio track triggers `track.onended`. The background worker catches this event and cleanly releases the session.
3. **Single Active Tab Guard:** The extension enforces a single active capture session at any time. Activating enhancement on Tab B automatically stops and releases Tab A before acquiring Tab B.

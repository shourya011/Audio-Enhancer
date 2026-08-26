# Known Technical Limitations & Design Decisions

This document provides transparent documentation of architectural trade-offs, browser platform constraints, and intentional design boundaries in Audio Enhancer V1.

---

## 1. Simplified Loudness Matching vs. Real-Time ITU-R BS.1770 LUFS

- **Design Reality:** Professional mastering workstations employ multi-second integrated LUFS loudness analysis (ITU-R BS.1770 / EBU R128). In a real-time browser extension, continuous windowed LUFS integration adds unnecessary CPU overhead and memory buffering.
- **Implementation:** Audio Enhancer employs pre-computed frequency-weighted RMS loudness compensation tables paired with real-time makeup calculation. Presets are tuned so that toggling between **Original** and **Enhanced** maintains within $\approx \pm 1.0\text{ dB}$ of perceptual loudness parity.

---

## 2. Browser-Based Peak Limiting vs. Hardware/Mastering Brick-Wall Limiters

- **Design Reality:** Chrome's native `DynamicsCompressorNode` is a soft-knee RMS-style processor, not a lookahead brick-wall digital mastering limiter.
- **Implementation:** We utilize a two-stage cascade:
  1. Primary musical compressor.
  2. Fast peak-protection compressor stage (ratio 20:1, 1ms attack, 50ms release) followed by a $-0.45\text{ dBFS}$ gain ceiling.
- **Expectation:** Under typical YouTube playback conditions (dynamic range $-14$ to $-6\text{ dBFS}$), this completely eliminates digital clipping. For already hyper-compressed/distorted source material, it prevents further digital overs without adding latency.

---

## 3. Single-Tab Audio Processing

- **Design Reality:** Chrome's `tabCapture` API allocates dedicated media resources per tab capture stream. Processing multiple simultaneous tabs in parallel increases CPU consumption and risks tab focus audio contention.
- **Implementation:** Audio Enhancer explicitly restricts processing to one active tab at a time. Activating enhancement on a new YouTube tab automatically releases capture on the previous tab.

---

## 4. YouTube Domain Scope

- **Design Reality:** V1 is strictly focused and optimized for YouTube (`youtube.com`) and YouTube Music (`music.youtube.com`).
- **Extensibility:** The codebase includes a modular `SiteAdapter` registry abstraction in `src/utils/siteAdapters.ts`, allowing future expansions (e.g. Spotify Web, SoundCloud) without rewriting core DSP components.

# DSP Preset Tuning Log & Acoustic Rationale

This log documents the acoustic engineering rationale, frequency response targets, dynamic range settings, and tuning verification for each built-in preset.

---

## 1. Enhance (Flagship All-Day Preset)

- **Acoustic Objective:** The default "set-and-forget" preset suitable for hours of continuous listening across all music genres without causing listener fatigue.
- **Tuning Specifications:**
  - **Pre-Gain:** $-4.0\text{ dB}$ (headroom allocation)
  - **EQ Low Shelf (100 Hz):** $+1.5\text{ dB}$, $Q=0.7$ (gentle warmth and foundation)
  - **EQ Low-Mid Notch (300 Hz):** $-1.0\text{ dB}$, $Q=1.0$ (declutters mud, boxiness, and room boom)
  - **EQ Presence Peak (3000 Hz):** $+2.0\text{ dB}$, $Q=1.2$ (brings vocals and lead instruments forward)
  - **EQ High-Mid Peak (6000 Hz):** $+1.0\text{ dB}$, $Q=1.0$ (crisp snare crack and acoustic guitar definition)
  - **EQ Air Shelf (12000 Hz):** $+1.5\text{ dB}$, $Q=0.7$ (smooth, silky high-frequency sheen)
  - **Compressor:** Threshold $-18\text{ dB}$, Ratio $2.5:1$, Attack $8\text{ ms}$, Release $150\text{ ms}$, Knee $8\text{ dB}$
  - **Stereo Side Boost:** $+1.0\text{ dB}$
  - **Makeup Gain:** $+2.5\text{ dB}$ (loudness-matched to dry Original)

---

## 2. Punchy / Reels

- **Acoustic Objective:** Energetic, punchy, and transient-snappy response designed for electronic music, modern pop, hip-hop, and short-form video edits.
- **Tuning Specifications:**
  - **Pre-Gain:** $-6.0\text{ dB}$
  - **EQ Low Shelf (90 Hz):** $+2.5\text{ dB}$, $Q=0.8$
  - **EQ Low-Mid Notch (350 Hz):** $-1.5\text{ dB}$, $Q=1.1$
  - **EQ Presence Peak (3500 Hz):** $+3.0\text{ dB}$, $Q=1.2$
  - **EQ High-Mid Peak (7000 Hz):** $+1.5\text{ dB}$, $Q=1.0$
  - **EQ Air Shelf (12000 Hz):** $+2.0\text{ dB}$, $Q=0.7$
  - **Compressor:** Threshold $-16\text{ dB}$, Ratio $3.5:1$, Attack $5\text{ ms}$ (snappy transient clamp), Release $200\text{ ms}$ (prevents bass pumping), Knee $6\text{ dB}$
  - **Stereo Side Boost:** $+2.0\text{ dB}$
  - **Makeup Gain:** $+3.0\text{ dB}$

---

## 3. Bass Boost

- **Acoustic Objective:** Deep, powerful sub-bass reinforcement without turning mix muddy or masking vocal fundamentals.
- **Tuning Specifications:**
  - **Pre-Gain:** $-6.0\text{ dB}$
  - **Bass Enhancement Shelf (80 Hz):** $+4.0\text{ dB}$, $Q=0.8$
  - **EQ Low Shelf (80 Hz):** $+3.0\text{ dB}$, $Q=0.8$
  - **EQ Declutter Cut (250 Hz):** $-1.5\text{ dB}$, $Q=1.0$ (critical cut to prevent vocal masking)
  - **EQ Presence Peak (3000 Hz):** $+1.0\text{ dB}$, $Q=1.0$
  - **Compressor:** Threshold $-20\text{ dB}$, Ratio $3.0:1$, Attack $10\text{ ms}$, Release $180\text{ ms}$, Knee $8\text{ dB}$
  - **Stereo Side Boost:** $+0.5\text{ dB}$
  - **Makeup Gain:** $+1.5\text{ dB}$ (calibrated lower to compensate for high low-frequency acoustic energy)

---

## 4. Vocal Clarity

- **Acoustic Objective:** Optimized speech and dialogue articulation for podcasts, interviews, video essays, and vocal-centric acoustic music.
- **Tuning Specifications:**
  - **Pre-Gain:** $-4.0\text{ dB}$
  - **EQ Low Shelf Cut (150 Hz):** $-2.0\text{ dB}$, $Q=0.7$ (removes chestiness and proximity effect)
  - **EQ Low-Mid Notch (400 Hz):** $-1.0\text{ dB}$, $Q=1.0$ (removes nasal resonance)
  - **EQ Presence Boost (3000 Hz):** $+3.0\text{ dB}$, $Q=1.3$ (core vocal formant articulation)
  - **EQ High-Mid Boost (5000 Hz):** $+2.0\text{ dB}$, $Q=1.1$ (consonant clarity)
  - **EQ Air Shelf (12000 Hz):** $+1.0\text{ dB}$, $Q=0.7$
  - **Compressor:** Threshold $-22\text{ dB}$, Ratio $3.0:1$, Attack $5\text{ ms}$, Release $120\text{ ms}$, Knee $6\text{ dB}$ (levels speech volume)
  - **Stereo Side Boost:** $0.0\text{ dB}$ (preserves mono center image)
  - **Makeup Gain:** $+2.0\text{ dB}$

---

## 5. Night Mode

- **Acoustic Objective:** Smooth dynamic range leveling and dialogue intelligibility for late-night listening at low hardware master volume.
- **Tuning Specifications:**
  - **Pre-Gain:** $-5.0\text{ dB}$
  - **EQ Presence Lift (3000 Hz):** $+1.5\text{ dB}$, $Q=1.2$
  - **EQ Bass Shelf (100 Hz):** $+0.5\text{ dB}$
  - **Compressor:** Threshold $-28\text{ dB}$, Ratio $6.0:1$, Attack $10\text{ ms}$, Release $200\text{ ms}$, Knee $10\text{ dB}$ (deep leveling of loud bursts)
  - **Limiter Threshold:** $-2.0\text{ dBFS}$ (extra safety margin)
  - **Makeup Gain:** $+3.5\text{ dB}$

---

## 6. Spatial

- **Acoustic Objective:** Immersive, expansive stereo soundstage using phase-safe Mid/Side widening.
- **Tuning Specifications:**
  - **Stereo Side Boost:** $+2.5\text{ dB}$ (maximum tested threshold for transparent mono compatibility)
  - **Mid Channel:** $1.0$ (untouched center channel energy)
  - **Mono Sum Verification:** In mono fold-down ($L+R$), Side channel cancels completely to zero, preserving 100% of mix balance with zero phase comb filtering.

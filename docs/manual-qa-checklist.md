# Manual Audio QA & Acoustic Verification Plan

Because subjective sound quality cannot be evaluated purely with automated unit tests, this manual QA checklist provides human engineers and release testers with a standardized evaluation protocol.

---

## 1. Multi-Genre Listening Test Matrix

Evaluate every preset at **Intensity 100%** and **Intensity 50%** across representative content:

| Genre / Content Type | Recommended Reference Material | Primary Acoustic Evaluation Checklist |
|---|---|---|
| **Bass-Heavy EDM / Trap** | Martin Garrix, Skrillex, RL Grime | • Verify no sub-bass distortion or limiting rattle.<br>• Check that kick transients cut through cleanly.<br>• Ensure compressor release does not cause audible breathing/pumping. |
| **Hip-Hop / R&B** | Kendrick Lamar, Drake, SZA | • Check that 808 sub-bass does not mask 250–500 Hz vocal range.<br>• Verify crisp hi-hat definition without harsh treble. |
| **Modern Pop / Dance** | Dua Lipa, The Weeknd, Taylor Swift | • Confirm punchy snare impact and balanced low-end.<br>• A/B test Enhance vs. Original: ensure perceived loudness is matched within $\pm 1\text{ dB}$. |
| **Acoustic / Folk** | Ed Sheeran, Norah Jones, Bon Iver | • Verify acoustic guitar string sheen is natural, not brittle or metallic.<br>• Check that vocal warmth is preserved. |
| **Classical / Orchestral** | Beethoven Symphonies, Hans Zimmer | • Confirm dynamic range is respected; quiet string passages must not be unnaturally amplified or hiss.<br>• Loud orchestral climaxes must not clip. |
| **Hard Rock / Heavy Metal** | Metallica, Foo Fighters, Tool | • Check that distorted guitars do not build up harshness around 3–5 kHz.<br>• Ensure cymbal crashes stay silky and non-fatiguing. |
| **Podcasts & Dialogue** | Lex Fridman, Joe Rogan, NPR | • Test **Vocal** preset: verify dialogue intelligibility and absence of room boom/proximity effect.<br>• Background noise must not pump during pauses. |
| **Already-Mastered "Hot" Tracks** | Commercial EDM club masters | • Verify the peak limiter holds the $-1.0\text{ dBFS}$ ceiling without creating intermodulation distortion. |
| **Quiet / Dynamic Live Tracks** | Uncompressed live jazz / acoustic sessions | • Test **Night Mode**: verify low-volume intelligibility without needing to constantly adjust master hardware volume. |

---

## 2. Hardware Output Matrix

Perform testing across at least 3 distinct playback setups:
1. **Laptop Built-in Speakers:** Verify high-mid clarity and absence of speaker vibration distortion from bass boost.
2. **Standard Earbuds / In-Ear Monitors:** Verify balanced bass extension and smooth sibilance.
3. **Over-Ear Headphones / Studio Monitors:** Verify soundstage depth, transient punch, and fatigue-free tonal balance.
4. **Bluetooth Headphones:** Test latency/sync and verify audio recovers properly upon Bluetooth disconnect and reconnect.

---

## 3. Mono Compatibility & Phase Coherence Check

1. Select a stereo-rich track and activate the **Spatial** preset (or Enhance with Width trim at $+2.0\text{ dB}$).
2. Switch OS or system audio output to **Mono**.
3. **Verification Criterion:** The mix balance must remain identical; lead vocals, bass, and kick drums must not drop in volume or suffer comb filtering.

---

## 4. Multi-Hour Fatigue & Comfort Test

1. Set preset to **Enhance**, Intensity to **100%**.
2. Play a continuous music playlist for **30–60 minutes** at normal listening volume.
3. **Pass Criterion:** Ears should feel relaxed with zero treble fatigue, harshness, or headache.

---

## 5. Lifecycle & Edge Case Verification

- [ ] **Instant A/B Bypass:** Toggling A/B bypass provides immediate, zero-click comparison without stopping playback.
- [ ] **Tab Reload:** Refreshing the YouTube page stops capture cleanly and allows 1-click re-enable.
- [ ] **SPA Video Navigation:** Clicking another video on YouTube or next track on YouTube Music continues capture or updates track title without audio dropouts.
- [ ] **Tab Switch:** Opening a new tab while enhancing background YouTube playback maintains uninterrupted sound.
- [ ] **Tab Close:** Closing the active YouTube tab automatically releases audio resources and resets extension state to inactive.
- [ ] **Multiple YouTube Tabs:** Activating enhancement on Tab B cleanly releases Tab A first.
- [ ] **Sleep / Wake:** Putting laptop to sleep during playback and waking restores audio gracefully.
- [ ] **Volume / Seek:** Seeking forward/backward in the video produces no audio stutter or graph corruption.

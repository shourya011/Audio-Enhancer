# Privacy Policy — Audio Enhancer

**Last Updated:** August 26, 2026  
**Extension Version:** 1.0.0

Audio Enhancer is designed from the ground up to respect your privacy. All digital signal processing (DSP) operations are performed 100% locally on your computer inside your browser.

---

## 1. Zero Data Collection & Zero Telemetry

- **No Audio Transmission:** Audio captured from your active YouTube or YouTube Music tab is processed entirely inside your local browser instance via the Web Audio API and routed directly to your local audio output device. Audio is never recorded, saved to disk, or transmitted over the network.
- **No Browsing History Retention:** We do not track, log, or store your browsing history, visited URLs, video watch history, or search queries.
- **No User Accounts:** You are never asked to register, sign in, provide an email address, or create an account.
- **No Analytics / Telemetry:** Audio Enhancer contains zero analytics SDKs, tracking pixels, crash reporters, or third-party monitoring scripts.
- **No Remote Network Requests:** The extension makes zero outgoing HTTP/HTTPS network requests during runtime.

---

## 2. Chrome Permissions Justification

Audio Enhancer adheres to the principle of least privilege. The requested permissions in `manifest.json` are strictly required for core functionality:

| Permission | Technical Need & Justification |
|---|---|
| `tabCapture` | Grants temporary access to the audio stream of the active tab for real-time DSP processing when you explicitly turn enhancement ON. |
| `offscreen` | In Manifest V3, background service workers cannot host persistent Web Audio graphs or media playback. An offscreen document provides the sandboxed DOM context to run the Web Audio API. |
| `storage` | Used exclusively with `chrome.storage.local` to store your EQ presets, intensity slider positions, and trim preferences locally on your computer. |
| `activeTab` | Allows the extension popup to interact with the currently focused tab upon click without requiring broad host access to all open tabs. |
| `host_permissions` (`*://*.youtube.com/*`, `*://music.youtube.com/*`) | Restricts the extension's execution domain exclusively to YouTube and YouTube Music. The extension cannot interact with any other website. |

---

## 3. Local Storage

The only data stored by Audio Enhancer is stored in your browser's `chrome.storage.local`:
- Selected preset ID (`enhance`, `punchy`, `bass`, etc.)
- Intensity slider value (0–100%)
- Quick trim values (Bass, Clarity, Width)
- Advanced 5-band EQ gain overrides
- A/B bypass comparison toggle state

This data never leaves your computer and is immediately removed if you uninstall the extension.

---

## 4. Contact & Auditing

Audio Enhancer is open-source. Anyone can inspect and audit the complete source code in this repository to verify compliance with this privacy policy.

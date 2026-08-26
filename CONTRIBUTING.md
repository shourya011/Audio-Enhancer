# Contributing to Audio Enhancer

Thank you for your interest in contributing to Audio Enhancer! We welcome bug fixes, documentation improvements, and acoustic/DSP tuning refinements.

---

## 🏗️ Development Setup

1. Ensure you have **Node.js 20+** and **npm 10+** installed.
2. Clone the repository and install dependencies:
   ```bash
   git clone https://github.com/your-org/audio-enhancer.git
   cd audio-enhancer
   npm install
   ```
3. Run the development build watcher:
   ```bash
   npm run dev
   ```
4. Load the `dist/` directory as an **Unpacked Extension** in `chrome://extensions/`.

---

## 🧪 Testing & Code Standards

Before submitting a pull request, ensure all verification gates pass cleanly:

```bash
# 1. Typecheck strict mode
npm run typecheck

# 2. Linting (0 errors, 0 warnings)
npm run lint

# 3. Unit and integration tests
npm test

# 4. Production build
npm run build

# 5. Extension package verification
npm run package
```

### Coding Guidelines:
- **TypeScript Strict Mode:** Never use `any` or disable type checks. Use explicit discriminated union types.
- **DSP Parameter Smoothing:** Never assign `.value = x` directly during live audio playback. Always use `setTargetAtTime` or `linearRampToValueAtTime` with a 20–30 ms smoothing constant to prevent clicks/zipper noise.
- **Better, Not Merely Louder:** Any new preset or DSP stage must be loudness-matched and verified against the manual QA test matrix in `docs/manual-qa-checklist.md`.
- **Zero Remote Dependencies:** No external network requests or third-party analytics libraries may be added.

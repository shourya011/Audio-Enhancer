# Dependency & Package Audit

Audio Enhancer is engineered with a strict zero-bloat, minimum-dependency philosophy.

---

## 1. Runtime Dependencies (`dependencies`)

| Dependency | Purpose | Runtime Presence |
|---|---|---|
| *(None)* | All DSP, UI, and storage logic use native browser Web Audio API, Canvas API, DOM, and Chrome Extension APIs. | **0 KB added runtime dependencies** |

---

## 2. Build & Development Dependencies (`devDependencies`)

| Package | Version | Justification |
|---|---|---|
| `typescript` | `^5.4.5` | Provides static typing, discriminated unions, and compile-time contract enforcement. |
| `vite` | `^5.2.11` / `^8.2.2` | Fast, modern bundling pipeline generating compliant Manifest V3 extension output. |
| `vitest` | `^1.6.0` / `^4.1.11` | Blazing-fast unit and integration test runner. |
| `@types/chrome` | `^0.0.268` | TypeScript definitions for Chrome Extension APIs. |
| `@types/node` | `^20.14.0` | TypeScript definitions for Node.js build scripts. |
| `eslint` | `^9.0.0` | Code quality and linting. |
| `@typescript-eslint/parser` | Latest | ESLint parser for TypeScript AST. |
| `@typescript-eslint/eslint-plugin` | Latest | ESLint rules for TypeScript safety. |

---

## 3. Security Audit Status

- `npm audit` report: **0 vulnerabilities** (0 low, 0 moderate, 0 high, 0 critical).
- Zero remote scripts, zero CDN dependencies, strict offline sandboxing.

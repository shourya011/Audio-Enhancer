# Security Policy — Audio Enhancer

## Threat Model & Security Posture

Audio Enhancer is engineered according to strict Google Chrome Manifest V3 security requirements, the principle of least privilege, and defensive coding practices.

---

## 1. Content Security Policy (CSP)

Audio Enhancer enforces a strict Content Security Policy defined in `manifest.json`:
```json
"content_security_policy": {
  "extension_pages": "script-src 'self'; object-src 'self'"
}
```

- **No Remote Code Execution:** All JavaScript and Web Audio components are bundled locally at build time. No CDN scripts, remote scripts, or external dependencies are loaded at runtime.
- **No `eval` or Dynamic Code:** Dynamic evaluation functions (`eval`, `new Function`, `setTimeout(string)`) are strictly prohibited and omitted throughout the entire codebase.
- **Zero DOM Injection of External Content:** All UI elements and SVG icons are statically declared or safely created with typed DOM attributes. No `innerHTML` with unsanitized external variables is used.

---

## 2. Cross-Context Message Validation

All inter-process communication between the extension popup, background service worker, offscreen document, and content scripts passes through the typed validation boundary in `src/messaging/protocol.ts`:
- Every incoming message is strictly checked with `isValidMessage(msg)` against a discriminated union of allowed message types.
- Malformed, unexpected, or extraneous message types are rejected immediately.

---

## 3. Minimal Permission Scope

Audio Enhancer does **NOT** request broad or sensitive permissions:
- ❌ No `<all_urls>` permission
- ❌ No `cookies` permission
- ❌ No `webRequest` or `declarativeNetRequest` permissions
- ❌ No `debugger` permission
- ❌ No `management` permission
- ❌ No `nativeMessaging` permission

---

## 4. Reporting a Vulnerability

If you discover any security vulnerability or issue in this repository:
1. Please open an issue with full reproduction details or submit a pull request with a fix.
2. Maintainers will review, verify, and release a patched version promptly.

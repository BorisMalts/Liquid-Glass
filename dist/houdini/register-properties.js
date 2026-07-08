/*!
 * Liquid Glass PRO · v4.1.0 — houdini/register-properties (§4)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _state } from '../state/runtime.js';
// ─────────────────────────────────────────────────────────────────────────────
// §4  Houdini CSS custom properties
//
//  CSS.registerProperty() declares custom properties with explicit type
//  syntax, enabling the browser to:
//    • Interpolate them smoothly in CSS transitions (the key benefit here)
//    • Parse and validate their values at computed-style time
//
//  Without registration, custom properties are treated as raw strings and
//  cannot be transitioned by the browser's interpolation engine.
//
//  Properties registered:
//    --lg-mx    <percentage>   cursor X position within element (0%–100%)
//    --lg-my    <percentage>   cursor Y position within element (0%–100%)
//    --lg-irid  <angle>        iridescence rotation angle (driven by keyframes)
//    --lg-hover <number>       hover intensity scalar (0–1)
//    --lg-tx    <number>       tilt X (−1 to +1, drives rotateY)
//    --lg-ty    <number>       tilt Y (−1 to +1, drives rotateX)
//
//  Errors are silently swallowed because:
//    • The same property may have been registered by a prior initLiquidGlass() call
//    • Older browsers (Safari < 15) may not implement registerProperty at all
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Registers typed Houdini CSS custom properties so they can be interpolated
 * by the browser during CSS transitions and animations.
 * Idempotent — safe to call multiple times.
 */
export function _registerHoudini() {
    // Guard: skip if already registered, or if API is unsupported (Safari < 15).
    if (_state.houdiniReg || !window.CSS?.registerProperty)
        return;
    _state.houdiniReg = true;
    [
        // Cursor position — drives radial-gradient highlight in ::before pseudo-element.
        { name: '--lg-mx', syntax: '<percentage>', inherits: false, initialValue: '50%' },
        { name: '--lg-my', syntax: '<percentage>', inherits: false, initialValue: '30%' },
        // Iridescence rotation — driven by @keyframes lg-irid-spin.
        { name: '--lg-irid', syntax: '<angle>', inherits: false, initialValue: '0deg' },
        // Hover intensity — animated by spring; controls CSS transitions.
        { name: '--lg-hover', syntax: '<number>', inherits: false, initialValue: '0' },
        // Tilt components — drive CSS perspective transform.
        { name: '--lg-tx', syntax: '<number>', inherits: false, initialValue: '0' },
        { name: '--lg-ty', syntax: '<number>', inherits: false, initialValue: '0' },
    ].forEach(p => {
        try {
            CSS.registerProperty(p);
        }
        catch (_) {
            // Already registered or unsupported — no action required.
        }
    });
}

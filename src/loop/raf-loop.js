/*!
 * Liquid Glass PRO · v4.1.0 — loop/raf-loop (§11 — requestAnimationFrame render loop)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _state } from '../state/runtime.js';
import { _opts } from '../state/options.js';
import { _elements, _tracked, _visibleElements } from '../state/registry.js';
import { SPRING } from '../constants/spring-presets.js';
import { MAX_DT } from '../constants/limits.js';
import { _stepSpring } from '../physics/step-spring.js';
import { _renderCausticsGL } from '../webgl/render-caustics.js';
import { renderSpecularGL } from '../specular/render.js';

// ─────────────────────────────────────────────────────────────────────────────
// §11  requestAnimationFrame render loop
//
//  The loop runs continuously while any glass elements are tracked.  Each
//  iteration:
//
//    1. Computes a clamped delta-time (dt) from the rAF timestamp.
//    2. Reads the latest gyroscope tilt from _state.deviceTilt.
//    3. For each tracked element:
//       a. Advances all five springs by dt.
//       b. If not hovered, sets tilt spring targets from gyroscope data.
//       c. Writes the spring values to CSS custom properties on the element.
//       d. Writes a CSS perspective transform for the 3D tilt effect.
//       e. If WebGL is active for this element, renders the caustic frame.
//
//  Performance notes:
//    • getBoundingClientRect() is called at most once every 4 frames per
//      element (modulo timestamp trick) to avoid layout thrash.
//    • style.setProperty() calls are batched: all six writes happen in a
//      single synchronous block before the browser performs style recalc.
//    • The shared GL canvas approach (one context, N elements) avoids
//      hitting browser limits on concurrent WebGL contexts (~16 on most GPUs).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Rolling frame counter incremented at the top of every _rafLoop() tick.
 * Wraps at 65535 via bitwise AND to stay a safe integer indefinitely.
 * Used to derive per-subsystem frame-skip budgets without allocating a
 * counter per element:
 *
 *   _rafFrame % 2  === 0  → caustic GL pass   (~30 fps at 60 fps display)
 *   _rafFrame % 8  === 0  → domRect refresh   (~7.5 Hz)
 *   _rafFrame % 30 === 0  → data-attr sync    (~2 Hz)
 *
 * Reset to 0 by _stopLoop() so budgets restart cleanly after pause/resume.
 *
 * @type {number}
 */
let _rafFrame = 0;

/** Timestamp of the previous rAF frame, used to compute dt. */
let _lastTs = 0;

/**
 * Main animation loop body.  Called by requestAnimationFrame with a
 * DOMHighResTimeStamp argument.  Schedules itself for the next frame.
 *
 * Changes vs v3.0.0:
 *   - _rafFrame counter drives per-subsystem frame-skip budgets.
 *   - _visibleElements gate skips off-screen elements entirely.
 *   - domRect refresh reduced from every 4 → every 8 frames (~133 ms @ 60 fps).
 *   - Caustic GL pass runs every 2nd frame (effective 30 fps) — caustics are
 *     slow-moving noise; halving their rate is imperceptible.
 *   - Specular GL pass runs every frame — cursor-tracking requires full rate.
 *   - data-lg-refract attribute update throttled to every 30 frames (~500 ms).
 *   - _renderCausticsGL call is now explicit (was silently missing in v3.0.0).
 *
 * @param {number} ts - Current timestamp in milliseconds (from rAF).
 */
function _rafLoop(ts) {
    _state.rafId = requestAnimationFrame(_rafLoop);

    // Increment frame counter — wraps at 65535 via bitwise AND, stays integer.
    _rafFrame = (_rafFrame + 1) & 0xFFFF;

    // ── Delta time ────────────────────────────────────────────────────────────
    const dt = Math.min((ts - (_lastTs || ts)) * 0.001, MAX_DT);
    _lastTs = ts;

    // ── Device tilt (read once, shared across all elements this frame) ────────
    const gx = _state.deviceTilt.x;
    const gy = _state.deviceTilt.y;

    // ── Per-element update ────────────────────────────────────────────────────
    for (const el of _tracked) {
        const es = _elements.get(el);
        if (!es) continue;

        // ── Spring integration (every frame — needed for smooth CSS updates) ──
        _stepSpring(es.springX,     SPRING.cursor, dt);
        _stepSpring(es.springY,     SPRING.cursor, dt);
        _stepSpring(es.hoverSpring, SPRING.hover,  dt);
        _stepSpring(es.tiltX,       SPRING.tilt,   dt);
        _stepSpring(es.tiltY,       SPRING.tilt,   dt);

        // When not hovered, gyroscope drives tilt (parallax).
        if (!es.hovered) {
            es.tiltX.target = gx * 0.45;
            es.tiltY.target = gy * 0.45;
        }

        // ── CSS custom property updates (every frame) ─────────────────────────
        el.style.setProperty('--lg-mx',    (es.springX.value * 100).toFixed(2) + '%');
        el.style.setProperty('--lg-my',    (es.springY.value * 100).toFixed(2) + '%');
        el.style.setProperty('--lg-tx',     es.tiltX.value.toFixed(4));
        el.style.setProperty('--lg-ty',     es.tiltY.value.toFixed(4));
        el.style.setProperty('--lg-hover',  es.hoverSpring.value.toFixed(4));

        // ── CSS 3D perspective transform (every frame) ────────────────────────
        const rx = ( es.tiltY.value * 3.0).toFixed(3);
        const ry = (-es.tiltX.value * 3.0).toFixed(3);
        el.style.transform = `translateZ(0) perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg)`;

        // ── WebGL passes — gated on element visibility ────────────────────────
        // Off-screen elements skip all GPU work entirely.  The IntersectionObserver
        // in _startObserver() maintains _visibleElements in real time.
        if (!el.dataset.lgWebgl || !_visibleElements.has(el)) continue;

        // Refresh cached bounding rect every 8 frames (~133 ms @ 60 fps).
        // Halved from the original every-4-frames to reduce layout thrash,
        // acceptable because rect only changes on scroll/resize (both of which
        // also trigger a background re-capture that resets domRect anyway).
        if (_rafFrame % 8 === 0) {
            es.domRect = el.getBoundingClientRect();
        }

        // Caustic GL pass — every 2nd frame (effective ~30 fps).
        // Caustics are driven by slow gradient noise (u_time * 0.07–0.55);
        // a 33 ms update interval is below the threshold of perceptible
        // temporal aliasing for these frequencies.
        if (_rafFrame % 2 === 0) {
            _renderCausticsGL(es, ts);
        }

        // Specular GL pass — every frame (~60 fps).
        // The Cook-Torrance highlight tracks the cursor via spring-smoothed
        // u_mouse; reducing its rate would produce visible lag on fast moves.
        if (es.specCtx) {
            renderSpecularGL(es, es.specCtx, ts, _opts);
        }

        // Sync refraction indicator attribute every 30 frames (~500 ms).
        // This is purely a data attribute consumed by CSS; no visual urgency.
        if (_rafFrame % 30 === 0) {
            el.dataset.lgRefract = _state.bgReady ? '1' : '0';
        }
    }
}

/**
 * Starts the rAF render loop if it is not already running.
 * Resets _lastTs to prevent a large dt spike on the first frame.
 */
export function _startLoop() {
    if (_state.rafId) return;
    _lastTs      = 0;
    _state.rafId = requestAnimationFrame(_rafLoop);
}

/**
 * Cancels the rAF render loop.  The next scheduled frame is cancelled
 * immediately; any already-executing frame will complete naturally.
 */
export function _stopLoop() {
    if (_state.rafId) {
        cancelAnimationFrame(_state.rafId);
        _state.rafId = 0;
    }
}

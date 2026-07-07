/*!
 * Liquid Glass PRO · v4.1.0 — elements/attach (§10)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _elements, _tracked } from '../state/registry.js';
import { _opts } from '../state/options.js';
import { _state } from '../state/runtime.js';
import { _webglQuota } from '../state/webgl-quota.js';
import { _ioRef } from '../state/viewport-observer.js';
import { MAX_WEBGL_ELEMENTS } from '../constants/limits.js';
import { createGrainLayer } from '../dom/grain-layer.js';
import { _createSpring } from '../physics/create-spring.js';
import { _detectGpuTier } from '../gpu/detect-tier.js';
import { _initWebGL } from '../webgl/init.js';
import { _spec } from '../specular/state.js';
import { attachSpecularCanvas } from '../specular/attach-canvas.js';

// ─────────────────────────────────────────────────────────────────────────────
// §10  Per-element attachment and detachment
//
//  _attach(el) is the core setup function called for each .lg element found
//  in the DOM (by the MutationObserver) or provided directly (attachElement()).
//
//  It:
//    1. Creates and inserts the caustic <canvas> as el's first child.
//    2. Optionally inserts the .lg-grain overlay.
//    3. Creates all six spring state objects.
//    4. Registers pointer event listeners (move / enter / leave).
//    5. Creates a ResizeObserver to keep the canvas sized to the element.
//    6. Stores all state in _elements WeakMap and _tracked Set.
//    7. If GPU tier is ≥ mid and WebGL quota allows, initialises WebGL and
//       marks the element with data-lg-webgl="1".
//
//  _detach(el) is the mirror: removes listeners, disconnects observer,
//  removes DOM nodes, cleans up all state.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Attaches the Liquid Glass effect to a single DOM element.
 * Idempotent — if the element is already tracked, returns immediately.
 *
 * @param {HTMLElement} el - The .lg element to attach to.
 */
export function _attach(el) {
    if (_tracked.has(el)) return;

    // ── Per-element random specular offsets ───────────────────────────────────
    // Four CSS custom properties drive the GGX lobe position scatter in §16.A.
    // Randomised on every attach so each element gets a unique highlight angle.
    const r = () => (Math.random() * 4 - 2).toFixed(1) + '%';
    el.style.setProperty('--lg-sa', r());
    el.style.setProperty('--lg-sb', r());
    el.style.setProperty('--lg-sc', r());
    el.style.setProperty('--lg-sd', r());

    // ── DPR-aware canvas sizing ────────────────────────────────────────────────
    // Cap DPR at 2 to avoid excessive memory usage on 3× displays (Retina Plus).
    // MAX_CANVAS guards against browser limits: width * height > 268435456
    // (16384²) causes the canvas to silently fail on Safari and Chrome.
    const MAX_CANVAS = 4096;
    const dpr  = Math.min(window.devicePixelRatio || 1, 2);
    const rect = el.getBoundingClientRect();
    const w    = Math.min(Math.round(rect.width  * dpr) || 1, MAX_CANVAS);
    const h    = Math.min(Math.round(rect.height * dpr) || 1, MAX_CANVAS);

    // ── Caustic canvas (§6) ───────────────────────────────────────────────────
    const cvs     = document.createElement('canvas');
    cvs.className = 'lg-caustic-canvas';
    cvs.width     = w;
    cvs.height    = h;
    const ctx2d   = cvs.getContext('2d', { alpha: true, willReadFrequently: false });
    el.insertBefore(cvs, el.firstChild);

    // ── Film grain overlay ────────────────────────────────────────────────────
    if (_opts.grain && !el.querySelector('.lg-grain')) {
        el.insertBefore(createGrainLayer(), cvs.nextSibling);
    }

    // ── Spring state ──────────────────────────────────────────────────────────
    const springX     = _createSpring(0.5);
    const springY     = _createSpring(0.3);
    const hoverSpring = _createSpring(0);
    const tiltX       = _createSpring(0);
    const tiltY       = _createSpring(0);

    let es;  // forward ref for event handlers

    // ── Pointer event handlers ────────────────────────────────────────────────
    const onMove = e => {
        const r = el.getBoundingClientRect();
        springX.target = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
        springY.target = Math.max(0, Math.min(1, (e.clientY - r.top)  / r.height));
        tiltX.target   = (springX.target - 0.5) * 2;
        tiltY.target   = (springY.target - 0.5) * 2;
        es.domRect     = r;
    };

    const onEnter = () => {
        hoverSpring.target = 1;
        es.hovered         = true;
        // Re-randomise specular lobe offsets on every hover enter so no two
        // interactions look identical — matches §15 area-light randomisation.
        el.style.setProperty('--lg-sa', r());
        el.style.setProperty('--lg-sb', r());
        el.style.setProperty('--lg-sc', r());
        el.style.setProperty('--lg-sd', r());
    };

    const onLeave = () => {
        springX.target     = 0.5;
        springY.target     = 0.30;
        hoverSpring.target = 0;
        tiltX.target       = 0;
        tiltY.target       = 0;
        es.hovered         = false;
    };

    el.addEventListener('pointermove',  onMove,  { passive: true });
    el.addEventListener('pointerenter', onEnter, { passive: true });
    el.addEventListener('pointerleave', onLeave, { passive: true });

    // ── ResizeObserver ─────────────────────────────────────────────────────────
    // Keeps the caustic canvas pixel dimensions in sync with the element layout.
    // MAX_CANVAS clamp applied here too — the element can grow after attach
    // (e.g. accordion open, font load reflow) and hit the same limit.
    const ro = new ResizeObserver(entries => {
        for (const entry of entries) {
            const cr = entry.contentRect;
            const nw = Math.min(Math.round(cr.width  * dpr) || 1, MAX_CANVAS);
            const nh = Math.min(Math.round(cr.height * dpr) || 1, MAX_CANVAS);
            if (nw !== es.width || nh !== es.height) {
                cvs.width   = es.width  = nw;
                cvs.height  = es.height = nh;
                // Keep specular canvas in sync with caustic canvas dimensions.
                if (es.specCanvas) {
                    es.specCanvas.width  = nw;
                    es.specCanvas.height = nh;
                }
            }
        }
    });
    ro.observe(el);

    // ── Assemble ElementState ─────────────────────────────────────────────────
    es = {
        canvas:       cvs,
        ctx2d,
        ro,
        springX,
        springY,
        hoverSpring,
        tiltX,
        tiltY,
        width:        w,
        height:       h,
        hovered:      false,
        dpr,
        domRect:      rect,
        pointerMove:  onMove,
        pointerEnter: onEnter,
        pointerLeave: onLeave,
        // §15 specular pass — filled below if WebGL is available
        specCtx:    null,  // CanvasRenderingContext2D of .lg-specular-canvas
        specCanvas: null,  // HTMLCanvasElement reference (for ResizeObserver)
    };

    _elements.set(el, es);
    _tracked.add(el);

    // Register with the IntersectionObserver so _visibleElements stays current.
    // _io may be null if _attach() is called before _startObserver() runs
    // (e.g. attachElement() called immediately after initLiquidGlass() on a
    // page that deferred DOMContentLoaded) — the optional chain guards this.
    _ioRef.current?.observe(el);

    // ── WebGL caustics + specular enablement ──────────────────────────────────
    const tier = _detectGpuTier();
    if (_opts.caustics && tier !== 'low' && _webglQuota.active < MAX_WEBGL_ELEMENTS) {
        if (_initWebGL()) {
            _webglQuota.active++;
            el.dataset.lgWebgl   = '1';
            el.dataset.lgRefract = _state.bgReady ? '1' : '0';

            // §15 — attach dedicated specular canvas immediately after caustic.
            // Requires initSpecularPass() to have been called in initLiquidGlass().
            if (_spec.gl) {
                const specCtx  = attachSpecularCanvas(el, cvs);
                es.specCtx     = specCtx;
                // CanvasRenderingContext2D.canvas gives us back the element
                // for ResizeObserver and _detach() cleanup.
                es.specCanvas  = specCtx ? specCtx.canvas : null;
            }
        }
    }
}

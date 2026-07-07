/*!
 * Liquid Glass PRO · v4.1.0 — background/capture (§5 — html2canvas → WebGL texture)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _state } from '../state/runtime.js';
import { _opts } from '../state/options.js';

// ─────────────────────────────────────────────────────────────────────────────
// §5  Background capture engine  (new in v2.0.0)
//
//  Overview
//  ────────
//  The refraction effect requires knowledge of what lies behind the glass
//  element.  CSS backdrop-filter provides a blurred approximation, but it does
//  not expose the actual pixel data to WebGL.  The solution is to use
//  html2canvas to periodically render a downscaled snapshot of the page,
//  upload it to a WebGL2 texture, and sample from that texture in the fragment
//  shader at refracted UV coordinates.
//
//  Architecture
//  ────────────
//  ┌────────────────────────────────────────────────────────────────────────┐
//  │  DOM (live page)                                                       │
//  │       ↓  html2canvas (async, runs on JS thread, ~10–40 ms)            │
//  │  HTMLCanvasElement  (bgCaptureScale × viewport resolution)             │
//  │       ↓  gl.texImage2D + generateMipmap (GPU upload, ~1 ms)           │
//  │  WebGL2 TEXTURE_2D on TEXTURE_UNIT1  (u_background sampler)           │
//  │       ↓  fragment shader samples at refractedUV                       │
//  │  Per-pixel refracted colour                                            │
//  └────────────────────────────────────────────────────────────────────────┘
//
//  Refresh triggers
//  ────────────────
//  1. setInterval(bgCaptureInterval)       — steady-state periodic refresh
//  2. window 'scroll' event (debounced 150 ms) — keeps refraction aligned
//     after the user scrolls; scroll offset at capture time is stored in
//     _state.bgScrollX / bgScrollY so the shader can compensate for drift
//     between capture and render time.
//  3. ResizeObserver on <body>             — recaptures on layout reflow
//  4. refreshBackground() public API      — called by host app after large
//     DOM mutations (modal open, route change, dynamic content insertion)
//
//  Anti-flicker
//  ────────────
//  The previous texture remains bound and sampled while a new capture is in
//  progress.  The bgCapturing mutex prevents concurrent html2canvas calls that
//  could race on the texture upload.
//
//  Scroll drift compensation
//  ──────────────────────────
//  Between captures the user may scroll, causing the captured background to
//  be misaligned with the current viewport.  The shader receives a u_scroll
//  uniform that encodes (currentScroll − captureScroll) / viewportSize, and
//  adds this offset to the screen-space UV before texture lookup.
//
//  CPU-side 2D copy
//  ────────────────
//  A second 2D canvas (_state.bgCanvas) stores a CPU-readable copy of the
//  latest capture.  This is not currently consumed by the main render path but
//  is available for future use cases such as CSS element() references or
//  canvas-based fallback renderers for elements that exceed MAX_WEBGL_ELEMENTS.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Performs a single background capture using html2canvas and uploads the
 * result to the shared WebGL background texture (TEXTURE_UNIT1).
 *
 * The function is guarded by a mutex (_state.bgCapturing) so that even if
 * called rapidly (e.g. during fast scroll), no more than one html2canvas
 * instance runs concurrently.
 *
 * Silently degrades if html2canvas is not loaded — the shader's u_bgReady
 * uniform will remain 0.0 and refraction will be disabled for that frame.
 *
 * @async
 * @returns {Promise<void>}
 */
export async function _captureBackground() {
    // Mutex check: bail out if a capture is already in flight.
    if (_state.bgCapturing || !window.html2canvas) return;
    _state.bgCapturing = true;

    try {
        const scale = _opts.bgCaptureScale;

        // html2canvas options:
        //   scale           — reduces resolution to bgCaptureScale fraction
        //   useCORS         — attempts CORS requests for cross-origin images
        //   allowTaint      — allows tainted canvas (may produce security warnings
        //                     for cross-origin content but won't throw)
        //   backgroundColor — null = transparent, lets the page BG show through
        //   logging         — disabled to avoid console spam
        //   removeContainer — html2canvas's internal clone container is cleaned up
        //   ignoreElements  — exclude glass elements themselves to prevent a
        //                     visual feedback loop where the glass reflects itself
        const captured = await html2canvas(document.documentElement, {
            scale,
            useCORS:           true,
            allowTaint:        true,
            backgroundColor:   null,
            logging:           false,
            removeContainer:   true,
            ignoreElements: el =>
                el.classList?.contains('lg')               ||  // glass content elements
                el.classList?.contains('lg-outer')         ||  // distortion wrappers
                el.classList?.contains('lg-caustic-canvas') || // caustic overlays
                el.classList?.contains('lg-specular-canvas')||
                el.tagName === 'CANVAS',
        });

        // Record the scroll position at capture time so the refraction shader
        // can compute the drift offset in real-time (u_scroll uniform).
        _state.bgScrollX = window.scrollX;
        _state.bgScrollY = window.scrollY;

        // ── GPU upload ────────────────────────────────────────────────────────
        const gl = _state.glBackend;
        if (gl && _state.bgTexture) {
            // Bind to unit 1 (unit 0 is reserved for future caustic LUT use).
            gl.bindTexture(gl.TEXTURE_2D, _state.bgTexture);
            // Upload the entire canvas as an RGBA texture; the browser converts
            // the canvas pixel format automatically.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, captured);
            // Generate mipmaps for minification (when glass element is smaller
            // than the background texture sample footprint).
            gl.generateMipmap(gl.TEXTURE_2D);
            // Signal to the shader that valid background data is now available.
            _state.bgReady = true;
        }

        // ── CPU-side 2D copy ──────────────────────────────────────────────────
        // Lazily create the 2D canvas on the first successful capture.
        if (!_state.bgCanvas) {
            _state.bgCanvas = document.createElement('canvas');
            _state.bgCtx    = _state.bgCanvas.getContext('2d');
        }
        _state.bgCanvas.width  = captured.width;
        _state.bgCanvas.height = captured.height;
        _state.bgCtx.drawImage(captured, 0, 0);

    } catch (err) {
        // Common failure modes:
        //   • Cross-origin <iframe> with strict sandbox policy
        //   • Content-Security-Policy blocking canvas drawing
        //   • Out-of-memory on very large viewports at high scale
        // In all cases: degrade silently and leave u_bgReady = 0.0 in the shader
        // so the render falls back to the caustic-only visual.
        console.warn(
            'LG-PRO: background capture failed — refraction disabled this frame.',
            err
        );
    } finally {
        // Always release the mutex, even if an error occurred.
        _state.bgCapturing = false;
    }
}

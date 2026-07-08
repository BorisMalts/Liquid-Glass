/*!
 * Liquid Glass PRO · v4.1.0 — background/start (§5 — capture subsystem bootstrap)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _state } from '../state/runtime.js';
import { _captureBackground } from './capture.js';
import { _scheduleCapture } from './schedule.js';

/**
 * Creates the background WebGL texture, kicks off the first capture, and
 * registers the three refresh triggers (interval, scroll, resize).
 *
 * Called once by _initWebGL() after the WebGL context has been successfully
 * created.  Safe to call from a non-document-ready state — html2canvas
 * itself handles the case where the DOM is still loading.
 */
export function _startBackgroundCapture() {
    const gl = _state.glBackend;
    if (!gl) return;

    // ── Create background texture on TEXTURE_UNIT1 ────────────────────────────
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA,
        1, 1, 0,
        gl.RGBA, gl.UNSIGNED_BYTE,
        new Uint8Array([0, 0, 0, 0])
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    _state.bgTexture = tex;

    _state.bgCaptureId = -1;

    // Kick off first capture, then let _scheduleCapture() maintain the loop.
    _captureBackground().finally(_scheduleCapture);

    // ── Scroll-driven refresh (debounced) ─────────────────────────────────────
    _state.bgScrollDebounce = 0;
    _state.bgScrollHandler = () => {
        clearTimeout(_state.bgScrollDebounce);
        _state.bgScrollDebounce = setTimeout(_captureBackground, 150);
    };
    window.addEventListener('scroll', _state.bgScrollHandler, { passive: true });

    // ── Resize-driven refresh ─────────────────────────────────────────────────
    _state.bgResizeObserver = new ResizeObserver(() => _captureBackground());
    _state.bgResizeObserver.observe(document.body);
}

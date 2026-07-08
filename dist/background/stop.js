/*!
 * Liquid Glass PRO · v4.1.0 — background/stop (§5 — capture teardown)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _state } from '../state/runtime.js';
/**
 * Cancels the periodic capture interval and resets capture-related state.
 * Called by destroyLiquidGlass().  Does NOT delete the WebGL texture
 * (that happens when the GL context is freed).
 */
export function _stopBackgroundCapture() {
    // Zero out FIRST so any in-flight _scheduleCapture() finally-callback
    // sees bgCaptureId === 0 and does not re-queue after cancellation.
    const id = _state.bgCaptureId;
    _state.bgCaptureId = 0;
    if (id) {
        (window.cancelIdleCallback || clearTimeout)(id);
        clearTimeout(id); // safe no-op if id was an rIC handle
    }
    clearTimeout(_state.bgScrollDebounce);
    _state.bgReady = false;
    _state.bgCapturing = false;
    if (_state.bgScrollHandler) {
        window.removeEventListener('scroll', _state.bgScrollHandler);
        _state.bgScrollHandler = null;
    }
    if (_state.bgResizeObserver) {
        _state.bgResizeObserver.disconnect();
        _state.bgResizeObserver = null;
    }
}

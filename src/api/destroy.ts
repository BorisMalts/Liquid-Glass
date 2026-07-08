/*!
 * Liquid Glass PRO · v4.1.0 — api/destroy (§13 — destroyLiquidGlass)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _state } from '../state/runtime.js';
import { _tracked } from '../state/registry.js';
import { _webglQuota } from '../state/webgl-quota.js';
import { _stopLoop } from '../loop/raf-loop.js';
import { _detach } from '../elements/detach.js';
import { _stopBackgroundCapture } from '../background/stop.js';
import { _stopOrientationTracking } from '../sensors/orientation.js';
import { _resetGpuTierCache } from '../gpu/detect-tier.js';
import { destroySpecularPass } from '../specular/destroy.js';

/**
 * Completely tears down the Liquid Glass PRO system.
 *
 * This function is safe to call:
 *  • Before re-initialising with different options
 *  • On SPA route navigation to prevent orphaned listeners/timers
 *  • During component unmount in React / Vue / Svelte
 *
 * After this call, all tracked elements revert to their original styles,
 * all WebGL resources are freed, all intervals/observers are stopped, and
 * the injected <style> and <svg> elements are removed from the DOM.
 * initLiquidGlass() can be called again afterwards.
 */
export function destroyLiquidGlass() {
    _stopLoop();

    _state.observer?.disconnect();
    _state.observer = null;

    // Detach all tracked elements in a snapshot copy (detach mutates _tracked).
    for (const el of [..._tracked]) _detach(el);

    _stopBackgroundCapture();

    // Remove injected DOM nodes
    _state.styleEl?.remove();
    _state.svgEl?.remove();
    _state.glCanvas?.remove();

    _stopOrientationTracking();

    // Reset cached values that may differ on re-init
    _resetGpuTierCache();
    _webglQuota.active = 0;

    // Reset all singleton state to initial values
    Object.assign(_state, {
        ready:        false,
        svgReady:     false,
        houdiniReg:   false,
        started:      false,
        observer:     null,
        styleEl:      null,
        svgEl:        null,
        rafId:        0,
        glBackend:    null,
        glCanvas:     null,
        glProgram:    null,
        glUniforms:   {},
        glBuffer:     null,
        glStartTime:  0,
        bgTexture:    null,
        bgCanvas:     null,
        bgCtx:        null,
        bgReady:      false,
        bgCapturing:  false,
        deviceTilt:   { x: 0, y: 0 },
    });
    destroySpecularPass();
}

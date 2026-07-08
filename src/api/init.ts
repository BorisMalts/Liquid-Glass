/*!
 * Liquid Glass PRO · v4.1.0 — api/init (§13 — initLiquidGlass)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _state } from '../state/runtime.js';
import { _resetOptions } from '../state/options.js';
import { _registerHoudini } from '../houdini/register-properties.js';
import { _injectSVG } from '../svg/inject.js';
import { _injectCSS } from '../css/inject.js';
import { _startOrientationTracking } from '../sensors/orientation.js';
import { initSpecularPass } from '../specular/init.js';
import { _startObserver } from '../observer/mutation-observer.js';
import { _startLoop } from '../loop/raf-loop.js';
import type { LGOptions } from '../types/typedefs.js';

// ─────────────────────────────────────────────────────────────────────────────
// §13  Public API
//
//  All exported symbols are stable across patch versions.  Breaking changes
//  (if any) will increment the major version number.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialises Liquid Glass PRO on the current page.
 *
 * Must be called once before glass elements become active.  Subsequent calls
 * are no-ops (guarded by _state.ready).  To re-initialise with different
 * options, call destroyLiquidGlass() first.
 *
 * Execution order on first call:
 *  1. Merge user options with defaults.
 *  2. Register Houdini CSS custom properties.
 *  3. Inject SVG filter bank into <body>.
 *  4. Inject CSS into <head>.
 *  5. Start device orientation tracking.
 *  6. Wait for DOMContentLoaded (or execute immediately if DOM is ready),
 *     then start MutationObserver + rAF loop.
 *
 * @param {Partial<LGOptions>} [options={}] - Override specific default options.
 *
 * @example
 * import { initLiquidGlass } from './liquid-glass-pro.js';
 * initLiquidGlass({ ior: 1.5, refractionStrength: 0.04, breathe: false });
 */
export function initLiquidGlass(options: Partial<LGOptions> = {}) {
    // Prevent double initialization
    if (_state.ready) return;

    _state.ready = true;
    _resetOptions(options);

    // Register Houdini early.
    // This can safely run before the DOM is fully ready.
    _registerHoudini();

    // Move the main startup logic into a separate function
    // so we can run it only after the DOM is ready.
    const start = () => {
        // Extra guard in case start is triggered more than once
        if (_state.started) return;
        _state.started = true;

        // Inject shared SVG/CSS resources
        _injectSVG();
        _injectCSS();

        // Start device orientation tracking
        _startOrientationTracking();

        // IMPORTANT:
        // specular-pass creates a canvas and appends it to document.body,
        // so it must run only after body is available.
        try {
            initSpecularPass();
        } catch (err) {
            console.error('[LiquidGlass] initSpecularPass failed:', err);
        }

        // Start observing elements and the main render loop
        _startObserver();
        _startLoop();
    };

    // If the DOM is still loading, wait until it is ready
    // so document.body definitely exists.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
        return;
    }

    // If the DOM is already ready, start immediately
    start();
}

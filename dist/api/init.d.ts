import type { LGOptions } from '../types/typedefs.js';
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
export declare function initLiquidGlass(options?: Partial<LGOptions>): void;

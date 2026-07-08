import type { LGOptions } from '../types/typedefs.js';
/**
 * Live resolved options. Initialised with _defaults, then shallow-merged
 * with the user-supplied object in initLiquidGlass().
 *
 * @type {LGOptions}
 */
export declare const _opts: LGOptions;
/**
 * Re-initialises _opts in place: clears all keys, then applies
 * { ..._defaults, ...options } — the exact merge the monolith performed
 * via `_opts = { ..._defaults, ...options }`.  Mutating in place keeps the
 * object identity stable so every module can hold a live reference.
 *
 * @param {Partial<LGOptions>} [options={}]
 */
export declare function _resetOptions(options?: Partial<LGOptions>): void;

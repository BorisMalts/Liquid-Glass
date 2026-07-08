/*!
 * Liquid Glass PRO · v4.1.0 — state/options (§1 — live resolved options)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _defaults } from '../constants/defaults.js';
/**
 * Live resolved options. Initialised with _defaults, then shallow-merged
 * with the user-supplied object in initLiquidGlass().
 *
 * @type {LGOptions}
 */
export const _opts = { ..._defaults };
/**
 * Re-initialises _opts in place: clears all keys, then applies
 * { ..._defaults, ...options } — the exact merge the monolith performed
 * via `_opts = { ..._defaults, ...options }`.  Mutating in place keeps the
 * object identity stable so every module can hold a live reference.
 *
 * @param {Partial<LGOptions>} [options={}]
 */
export function _resetOptions(options = {}) {
    for (const k of Object.keys(_opts))
        delete _opts[k];
    Object.assign(_opts, _defaults, options);
}

/*!
 * Liquid Glass PRO · v4.1.0 — api/options (§13 — getOptions)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _opts } from '../state/options.js';
/**
 * Returns a shallow copy of the currently active options object.
 * Mutating the returned object has no effect — use destroyLiquidGlass()
 * followed by initLiquidGlass(newOptions) to change live options.
 *
 * @returns {LGOptions}
 */
export function getOptions() { return { ..._opts }; }

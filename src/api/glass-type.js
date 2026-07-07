/*!
 * Liquid Glass PRO · v4.1.0 — api/glass-type (§13 — setGlassType)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _opts } from '../state/options.js';

/**
 * Changes the glass type at runtime without reinitialising.
 * The new type takes effect on the next rendered frame.
 *
 * @param {string|number} type - Glass type name ('BK7','SF11','NK51A','NBK10','F2')
 *                               or numeric index 0–4.
 */
export function setGlassType(type) {
    _opts.glassType = type;
}

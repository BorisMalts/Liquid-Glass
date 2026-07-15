/*!
 * Liquid Glass PRO · v4.1.0 — api/glass-variant (§13 — setGlassVariant / getGlassVariants)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _opts } from '../state/options.js';
import { _tracked } from '../state/registry.js';
import { GLASS_VARIANTS } from '../variants/glass-variants.js';
import type { GlassVariantDef } from '../types/typedefs.js';

/**
 * Changes the glass surface variant at runtime.
 * Updates the CSS class on all tracked elements and the _opts.glassVariant
 * value for the WebGL uniform upload on the next frame.
 *
 * The change is fully reflected within one rAF frame (no reinitialisation).
 * The CSS backdrop-filter transition provides a smooth visual crossfade.
 *
 * @param {string} variant - One of the GLASS_VARIANTS keys:
 *   'clear' | 'frosted' | 'smoke' | 'tinted-blue' | 'tinted-violet'
 *   'tinted-amber' | 'pearl' | 'ice' | 'bronze' | 'emerald' | 'cyan' | 'rose' | 'mauve' | 'obsidian'
 *
 * @example
 * setGlassVariant('frosted');    // ground-glass, heavy blur
 * setGlassVariant('tinted-blue'); // cobalt blue architectural glass
 * setGlassVariant('pearl');      // mother-of-pearl nacre surface
 */
export function setGlassVariant(variant: string) {
    const vd = (GLASS_VARIANTS as Record<string, GlassVariantDef>)[variant];
    if (!vd) {
        console.warn(`LG-PRO: unknown glass variant "${variant}". Valid keys:`, Object.keys(GLASS_VARIANTS));
        return;
    }

    // Remove all variant classes, apply the new one
    const allVariantClasses = Object.values(GLASS_VARIANTS).map(v => v.cssClass);

    for (const el of _tracked) {
        allVariantClasses.forEach(cls => el.classList.remove(cls));
        el.classList.add(vd.cssClass);
    }

    // Update live options — picked up by _renderCausticsGL on next frame
    _opts.glassVariant = variant;

    // Also sync IOR if the variant has a specific physical IOR
    // (e.g. ice = 1.309, pearl = 1.785, emerald = 1.575)
    _opts.ior = vd.ior;
}

/**
 * Returns all available glass variant definitions.
 * Useful for building UI pickers or iterating over available options.
 *
 * @returns {Record<string, GlassVariantDef>}
 *
 * @example
 * const variants = getGlassVariants();
 * Object.entries(variants).forEach(([key, def]) => {
 *   console.log(key, def.label, def.ior);
 * });
 */
export function getGlassVariants() {
    return { ...GLASS_VARIANTS };
}

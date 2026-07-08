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
 *   'tinted-amber' | 'mirror' | 'ice' | 'bronze' | 'emerald' | 'rose' | 'obsidian'
 *
 * @example
 * setGlassVariant('frosted');    // ground-glass, heavy blur
 * setGlassVariant('tinted-blue'); // cobalt blue architectural glass
 * setGlassVariant('mirror');     // first-surface mirror coating
 */
export declare function setGlassVariant(variant: string): void;
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
export declare function getGlassVariants(): {
    clear: GlassVariantDef;
    frosted: GlassVariantDef;
    smoke: GlassVariantDef;
    "tinted-blue": GlassVariantDef;
    "tinted-violet": GlassVariantDef;
    "tinted-amber": GlassVariantDef;
    mirror: GlassVariantDef;
    ice: GlassVariantDef;
    bronze: GlassVariantDef;
    emerald: GlassVariantDef;
    rose: GlassVariantDef;
    obsidian: GlassVariantDef;
};

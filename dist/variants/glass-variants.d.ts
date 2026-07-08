/*!
 * Liquid Glass PRO · v4.1.0 — variants/glass-variants (§1.5)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import type { GlassVariantDef, GlassVariantKey } from '../types/typedefs.js';
/**
 * @typedef {Object} GlassVariantDef
 * @property {string}   label
 * @property {string}   cssClass
 * @property {number}   ior
 * @property {[r,g,b]}  tintRGB        Linear RGB 0..1
 * @property {number}   tintStrength   0..1
 * @property {number}   frosted        0..1 scatter amount
 * @property {number}   mirror         0..1 mirror boost
 * @property {number}   smokeDensity   0..1 uniform darkening
 * @property {number}   causticScale   Caustic intensity multiplier
 * @property {[r,g,b]}  causticTint    RGB tint for caustics
 * @property {number}   blurPx         CSS backdrop-filter blur
 * @property {number}   saturate       CSS backdrop-filter saturate %
 * @property {number}   brightness     CSS backdrop-filter brightness
 * @property {string}   bgTint         CSS rgba() for background gradient
 */
export declare const GLASS_VARIANTS: Readonly<Record<GlassVariantKey, GlassVariantDef>>;

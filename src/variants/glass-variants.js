/*!
 * Liquid Glass PRO · v4.1.0 — variants/glass-variants (§1.5)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

// ─────────────────────────────────────────────────────────────────────────────
// §1.5  Glass variant presets  (new in v4.1.0)
//
//  Each variant defines the complete optical + visual character of a glass
//  surface type.  Parameters map directly to the GLSL uniforms introduced
//  in §6.2 of the fragment shader.
//
//  Physical basis:
//    tintRGB        — Beer-Lambert absorption: σ = (1−tintRGB) · tintStrength · 3.5
//                     I = I₀ · exp(−σ · d)   (d = glass thickness ≈ 1.0)
//    frosted        — Rough-surface scatter: adds multi-scale noise UV jitter
//                     to the refraction lookup, simulating sub-surface scattering
//                     in ground glass or sandblasted surfaces.
//    mirror         — Amplifies environmentReflection() term + raises F0 toward 1.
//    smokeDensity   — Uniform darkening after Beer-Lambert (soot/carbon absorption).
//    causticScale   — Per-variant intensity of the Voronoi caustic composite.
//    causticTint    — RGB colour multiplication applied to the caustic layer,
//                     making ice caustics blue, amber caustics warm, etc.
//    blurPx         — backdrop-filter blur in px (CSS, not GLSL).
//    saturate       — backdrop-filter saturate % (CSS).
//    brightness     — backdrop-filter brightness multiplier (CSS).
//    bgTint         — CSS rgba() string for the background gradient tint.
//
//  IOR notes:
//    ice     1.309 — published optical constant for H₂O ice (Warren 2008)
//    emerald 1.575 — mid-point of emerald IOR range 1.565–1.602
//    obsidian 1.49 — volcanic obsidian (SiO₂-rich rhyolite glass)
//    SF11    1.785 — used for mirror (maximum Fresnel F0 in catalogue)
// ─────────────────────────────────────────────────────────────────────────────

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

export const GLASS_VARIANTS = Object.freeze({

    // ── 1. Clear ──────────────────────────────────────────────────────────────
    // Near-invisible glass: maximum background transmission, minimal tint.
    // IOR 1.45 = soda-lime float glass, slight Δn, crisp caustics.
    clear: {
        label:        'Clear',
        cssClass:     'lg-v-clear',
        ior:          1.45,
        tintRGB:      [1.00, 1.00, 1.00],
        tintStrength: 0.00,
        frosted:      0.00,
        mirror:       0.00,
        smokeDensity: 0.00,
        causticScale: 0.80,
        causticTint:  [1.00, 1.00, 1.00],
        blurPx:       7,
        saturate:     155,
        brightness:   1.08,
        bgTint:       'rgba(255,255,255,0.04)',
    },

    // ── 2. Frosted ────────────────────────────────────────────────────────────
    // Ground-glass / sandblasted surface.  Heavy scatter completely diffuses
    // the refracted image, leaving only soft light bleed through the surface.
    // backdrop-filter blur 40px approximates the sub-surface scatter MFP.
    frosted: {
        label:        'Frosted',
        cssClass:     'lg-v-frosted',
        ior:          1.47,
        tintRGB:      [1.00, 1.00, 1.00],
        tintStrength: 0.18,
        frosted:      0.90,
        mirror:       0.00,
        smokeDensity: 0.00,
        causticScale: 0.38,
        causticTint:  [1.00, 1.00, 1.00],
        blurPx:       40,
        saturate:     78,
        brightness:   1.16,
        bgTint:       'rgba(255,255,255,0.20)',
    },

    // ── 3. Smoke ──────────────────────────────────────────────────────────────
    // Dark smoked glass (automotive / architectural tint film).
    // Beer-Lambert: uniform σ across R/G/B → neutral-density absorption.
    // IOR 1.52 = standard commercial tinted float glass.
    smoke: {
        label:        'Smoke',
        cssClass:     'lg-v-smoke',
        ior:          1.52,
        tintRGB:      [0.54, 0.57, 0.63],
        tintStrength: 0.58,
        frosted:      0.10,
        mirror:       0.10,
        smokeDensity: 0.52,
        causticScale: 0.55,
        causticTint:  [0.68, 0.70, 0.78],
        blurPx:       16,
        saturate:     58,
        brightness:   0.66,
        bgTint:       'rgba(18,20,28,0.52)',
    },

    // ── 4. Tinted Blue ────────────────────────────────────────────────────────
    // Cobalt-blue architectural glass.
    // Beer-Lambert: σR=3.1, σG=1.8, σB=0.2 → strong red/green absorption.
    // Caustic tint maps absorption to vivid blue-cyan filaments.
    'tinted-blue': {
        label:        'Tinted Blue',
        cssClass:     'lg-v-tinted-blue',
        ior:          1.47,
        tintRGB:      [0.10, 0.44, 1.00],
        tintStrength: 0.38,
        frosted:      0.00,
        mirror:       0.04,
        smokeDensity: 0.08,
        causticScale: 1.05,
        causticTint:  [0.22, 0.58, 1.00],
        blurPx:       12,
        saturate:     145,
        brightness:   1.04,
        bgTint:       'rgba(30,90,210,0.13)',
    },

    // ── 5. Tinted Violet ──────────────────────────────────────────────────────
    // UV-filter glass / amethyst crystal.
    // Beer-Lambert: absorbs G (trough at 550nm), passes R+B → purple.
    'tinted-violet': {
        label:        'Tinted Violet',
        cssClass:     'lg-v-tinted-violet',
        ior:          1.49,
        tintRGB:      [0.58, 0.14, 1.00],
        tintStrength: 0.42,
        frosted:      0.00,
        mirror:       0.06,
        smokeDensity: 0.10,
        causticScale: 1.10,
        causticTint:  [0.62, 0.28, 1.00],
        blurPx:       12,
        saturate:     135,
        brightness:   1.02,
        bgTint:       'rgba(100,30,210,0.14)',
    },

    // ── 6. Tinted Amber ───────────────────────────────────────────────────────
    // Amber / honey-gold / cognac glass.
    // Beer-Lambert: strong B absorption (σB=4.2), minimal R/G → warm glow.
    // Historically amber glass = UV-protective pharmaceutical / spirits bottles.
    'tinted-amber': {
        label:        'Tinted Amber',
        cssClass:     'lg-v-tinted-amber',
        ior:          1.53,
        tintRGB:      [1.00, 0.64, 0.06],
        tintStrength: 0.44,
        frosted:      0.00,
        mirror:       0.05,
        smokeDensity: 0.06,
        causticScale: 1.15,
        causticTint:  [1.00, 0.76, 0.28],
        blurPx:       11,
        saturate:     148,
        brightness:   1.07,
        bgTint:       'rgba(220,130,20,0.13)',
    },

    // ── 7. Mirror ─────────────────────────────────────────────────────────────
    // First-surface mirror coating (silver on glass).
    // IOR 1.785 = SF11 flint → F0 ≈ 0.079 (2× standard glass).
    // u_mirrorStrength = 0.92 collapses transmission, renders pure reflection.
    // Caustics become sharp specular flares.
    mirror: {
        label:        'Mirror',
        cssClass:     'lg-v-mirror',
        ior:          1.785,
        tintRGB:      [0.90, 0.93, 0.96],
        tintStrength: 0.08,
        frosted:      0.00,
        mirror:       0.92,
        smokeDensity: 0.00,
        causticScale: 1.50,
        causticTint:  [0.94, 0.96, 1.00],
        blurPx:       3,
        saturate:     125,
        brightness:   1.18,
        bgTint:       'rgba(220,228,240,0.08)',
    },

    // ── 8. Ice ────────────────────────────────────────────────────────────────
    // Polycrystalline water ice.
    // IOR = 1.309 (Warren & Brandt 2008, 550nm, T=–10°C).
    // Frosted 0.40 simulates polycrystalline grain-boundary scatter.
    // Caustic tint = cold blue — ice acts as a natural UV-pass filter.
    ice: {
        label:        'Ice',
        cssClass:     'lg-v-ice',
        ior:          1.309,
        tintRGB:      [0.70, 0.88, 1.00],
        tintStrength: 0.24,
        frosted:      0.42,
        mirror:       0.07,
        smokeDensity: 0.04,
        causticScale: 1.35,
        causticTint:  [0.55, 0.83, 1.00],
        blurPx:       20,
        saturate:     60,
        brightness:   1.22,
        bgTint:       'rgba(165,215,255,0.16)',
    },

    // ── 9. Bronze ─────────────────────────────────────────────────────────────
    // Bronze-tinted decorative glass / copper dichroic filter.
    // Beer-Lambert: absorbs B strongly, passes R+G at different rates.
    bronze: {
        label:        'Bronze',
        cssClass:     'lg-v-bronze',
        ior:          1.58,
        tintRGB:      [0.80, 0.48, 0.10],
        tintStrength: 0.46,
        frosted:      0.00,
        mirror:       0.16,
        smokeDensity: 0.14,
        causticScale: 0.92,
        causticTint:  [1.00, 0.66, 0.20],
        blurPx:       13,
        saturate:     128,
        brightness:   0.96,
        bgTint:       'rgba(180,100,20,0.14)',
    },

    // ── 10. Emerald ───────────────────────────────────────────────────────────
    // Genuine emerald / chrome-doped beryl glass.
    // IOR 1.575 = mid emerald range. Cr³⁺ absorption peaks at 430nm and 610nm
    // create the distinctive green transmission window near 500–570nm.
    emerald: {
        label:        'Emerald',
        cssClass:     'lg-v-emerald',
        ior:          1.575,
        tintRGB:      [0.06, 0.74, 0.28],
        tintStrength: 0.44,
        frosted:      0.00,
        mirror:       0.09,
        smokeDensity: 0.08,
        causticScale: 1.08,
        causticTint:  [0.18, 1.00, 0.42],
        blurPx:       12,
        saturate:     158,
        brightness:   1.03,
        bgTint:       'rgba(15,140,50,0.14)',
    },

    // ── 11. Rose ──────────────────────────────────────────────────────────────
    // Rose-quartz / cranberry glass / ruby flash.
    // Manganese-doped silicate glass: absorbs 490–580nm (green), passes red+blue.
    rose: {
        label:        'Rose',
        cssClass:     'lg-v-rose',
        ior:          1.46,
        tintRGB:      [1.00, 0.32, 0.50],
        tintStrength: 0.34,
        frosted:      0.04,
        mirror:       0.03,
        smokeDensity: 0.04,
        causticScale: 0.98,
        causticTint:  [1.00, 0.52, 0.63],
        blurPx:       11,
        saturate:     138,
        brightness:   1.05,
        bgTint:       'rgba(240,80,120,0.12)',
    },

    // ── 12. Obsidian ──────────────────────────────────────────────────────────
    // Natural volcanic obsidian (rhyolitic glass ~72% SiO₂).
    // Near-black: strong broadband absorption from Fe²⁺/Fe³⁺/magnetite inclusions.
    // IOR 1.49–1.52 (mid range). High mirror component from polished surface.
    obsidian: {
        label:        'Obsidian',
        cssClass:     'lg-v-obsidian',
        ior:          1.49,
        tintRGB:      [0.07, 0.05, 0.11],
        tintStrength: 0.86,
        frosted:      0.07,
        mirror:       0.24,
        smokeDensity: 0.74,
        causticScale: 0.30,
        causticTint:  [0.28, 0.18, 0.44],
        blurPx:       15,
        saturate:     55,
        brightness:   0.54,
        bgTint:       'rgba(8,5,18,0.72)',
    },
});

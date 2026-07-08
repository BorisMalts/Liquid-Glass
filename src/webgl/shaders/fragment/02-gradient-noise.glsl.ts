/*!
 * Liquid Glass PRO · v4.1.0 — webgl/shaders/fragment/02-gradient-noise (§6.0 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

export const FRAG_GRADIENT_NOISE = /* glsl */`// ════════════════════════════════════════════════════════════════════════════
// §B  Gradient noise  (Perlin-style)
// ════════════════════════════════════════════════════════════════════════════

/**
 * 2D gradient noise (Perlin-style, value range ≈ [0,1]).
 * Uses bilinear interpolation of pseudo-random gradient vectors at the four
 * corners of the unit cell containing p.
 * The 0.5+0.5 remap ensures non-negative output for use as a height field.
 *
 * @param  p  2D continuous input coordinate
 * @return    Smooth noise value in [0, 1]
 */
float gnoise(vec2 p) {
    vec2 i = floor(p);   // Integer lattice cell
    vec2 f = fract(p);   // Fractional position within cell

    // Smoothstep curve for C1-continuous interpolation (eliminates gradient discontinuities)
    vec2 u = f * f * (3.0 - 2.0 * f);

    // Bilinear interpolation of dot(gradient, offset) at four cell corners
    return mix(
        mix(dot(hash2(i + vec2(0,0)), f - vec2(0,0)),
            dot(hash2(i + vec2(1,0)), f - vec2(1,0)), u.x),
        mix(dot(hash2(i + vec2(0,1)), f - vec2(0,1)),
            dot(hash2(i + vec2(1,1)), f - vec2(1,1)), u.x),
        u.y
    ) * 0.5 + 0.5;
}

`;


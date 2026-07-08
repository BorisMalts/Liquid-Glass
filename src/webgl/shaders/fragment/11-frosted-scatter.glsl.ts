/*!
 * Liquid Glass PRO · v4.1.0 — webgl/shaders/fragment/11-frosted-scatter (§6.0 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

export const FRAG_FROSTED_SCATTER = /* glsl */`// ════════════════════════════════════════════════════════════════════════════
// §H3  Frosted glass scatter refraction
//
//  Rough-surface glass scatters transmitted light across a broad solid angle.
//  Physically: the surface normal varies per microfacet; each microfacet
//  refracts independently at a different angle → blurred transmission.
//
//  Implementation: multi-scale noise offsets are added to the refraction UV,
//  producing a spatially-varying blur.  Three texture taps are averaged to
//  approximate the scattering lobe integral with minimal extra cost.
//
//  Scatter scale:
//    Low  frequencies (uv * 11.0): large-scale surface relief (mm-scale bumps)
//    High frequencies (uv * 27.0): sub-mm ground-glass texture
//  Both animated with different speeds so they never lock into a pattern.
//
//  The result is mixed with the (sharp) chromaticRefraction based on
//  u_frostedAmount, so partial frosting gives an intermediate haze level.
// ════════════════════════════════════════════════════════════════════════════

/**
 * Frosted-glass scatter: blurs the refraction lookup via noise UV jitter.
 *
 * @param  uv      Element-local UV
 * @param  normal  Surface normal (adds surface-tilt to scatter direction)
 * @return         Scatter-blurred refracted colour; vec3(0) if bgReady=0
 */
vec3 frostedScatterRefraction(vec2 uv, vec3 normal) {
    if (u_bgReady < 0.5) return vec3(0.0);

    vec2 screenUV = u_elementPos + uv * u_elementSize + u_scroll;
    screenUV = clamp(screenUV, 0.001, 0.999);

    // Scatter magnitude scales with frostedAmount
    // 0.052 = max UV offset (tuned so heavy frost is fully diffused at 1.0)
    float sc = u_frostedAmount * 0.052;

    // Large-scale surface relief noise (drifts slowly)
    float n1x = gnoise(uv * 11.0 + u_time * 0.030) - 0.5;
    float n1y = gnoise(uv * 11.0 + u_time * 0.025 + vec2(17.4, 0.0)) - 0.5;

    // Fine ground-glass texture noise (drifts faster, different phase)
    float n2x = gnoise(uv * 27.0 - u_time * 0.045) - 0.5;
    float n2y = gnoise(uv * 27.0 - u_time * 0.038 + vec2(0.0, 31.7)) - 0.5;

    // Combined scatter vector (large + fine)
    vec2 scatter = vec2(n1x + n2x * 0.4, n1y + n2y * 0.4) * sc;

    // Add surface-normal contribution so scatter direction aligns with bumps
    scatter += normal.xy * sc * 0.5;

    // Three-tap average: centre + two offset samples
    vec2 uv0 = clamp(refractUV(screenUV, normal) + scatter,          0.0, 1.0);
    vec2 uv1 = clamp(refractUV(screenUV, normal) + scatter * 0.55,   0.0, 1.0);
    vec2 uv2 = clamp(refractUV(screenUV, normal) + scatter * (-0.3), 0.0, 1.0);

    vec3 c0 = texture(u_background, uv0).rgb;
    vec3 c1 = texture(u_background, uv1).rgb;
    vec3 c2 = texture(u_background, uv2).rgb;

    // Weighted average — centre tap has more weight (Gaussian-like)
    return (c0 * 0.50 + c1 * 0.30 + c2 * 0.20);
}

`;


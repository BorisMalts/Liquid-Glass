/*!
 * Liquid Glass PRO · v4.1.0 — webgl/shaders/fragment/07-background-sampling (§6.0 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

export const FRAG_BACKGROUND_SAMPLING = /* glsl */`// ════════════════════════════════════════════════════════════════════════════
// §G  Background sampling with chromatic refraction (Sellmeier)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Returns transparent black if background is not yet ready.
 *
 * @param  uv      Element-local UV
 * @param  normal  View-space surface normal
 * @return         Sampled and refracted background colour (RGBA)
 */
vec4 sampleBackground(vec2 uv, vec3 normal) {
    if (u_bgReady < 0.5) return vec4(0.0);

    vec2 screenUV = u_elementPos + uv * u_elementSize;
    screenUV     += u_scroll;
    screenUV      = clamp(screenUV, vec2(0.001), vec2(0.999));

    vec2 refractedUV = refractUV(screenUV, normal);
    refractedUV      = clamp(refractedUV, vec2(0.0), vec2(1.0));

    return texture(u_background, refractedUV);
}

/**
 * Per-channel chromatic refraction using Sellmeier IOR values.
 * Replaces the original Cauchy-based version — iorR/iorG/iorB are now
 * physically accurate for the selected glass type (§C).
 *
 * @param  uv      Element-local UV
 * @param  normal  View-space surface normal
 * @return         RGB colour with Sellmeier per-channel dispersion applied
 */
vec3 chromaticRefraction(vec2 uv, vec3 normal) {
    if (u_bgReady < 0.5) return vec3(0.0);
    
    float iorR = sellmeier(0.680);   // Red   channel IOR
    float iorG = sellmeier(0.550);   // Green channel IOR — reference wavelength
    float iorB = sellmeier(0.450);   // Blue  channel IOR



    vec2 screenUV = u_elementPos + uv * u_elementSize + u_scroll;
    screenUV = clamp(screenUV, vec2(0.001), vec2(0.999));

    // Per-channel displacement using physically accurate Sellmeier IOR values.
    // Δ = N.xy · (1/iorCh − 1/iorRef) · refractStr
    // iorG is the reference wavelength (green = peak photopic response)
    vec2 baseRefracted = refractUV(screenUV, normal);
    vec2 uvR = clamp(baseRefracted + normal.xy * (1.0/iorR - 1.0/iorG) * u_refractStr * 150.0, 0.0, 1.0);
    vec2 uvG = clamp(baseRefracted,                                                      0.0, 1.0);
    vec2 uvB = clamp(baseRefracted + normal.xy * (1.0/iorB - 1.0/iorG) * u_refractStr * 150.0, 0.0, 1.0);

    float r = texture(u_background, uvR).r;
    float g = texture(u_background, uvG).g;
    float b = texture(u_background, uvB).b;

    return vec3(r, g, b);
}

`;


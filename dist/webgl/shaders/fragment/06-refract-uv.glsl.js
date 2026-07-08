/*!
 * Liquid Glass PRO · v4.1.0 — webgl/shaders/fragment/06-refract-uv (§6.0 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
export const FRAG_REFRACT_UV = /* glsl */ `// ════════════════════════════════════════════════════════════════════════════
// §F  Snell's law UV refraction  (thin-glass approximation)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Computes the refracted screen-space UV for a given surface normal,
 * using a thin-glass linearisation of Snell's law.
 *
 * @param  screenUV  Pre-mapped screen-space UV (element mapped to viewport)
 * @param  normal    View-space surface normal from surfaceNormal()
 * @return           Refracted screen-space UV
 */
vec2 refractUV(vec2 screenUV, vec3 normal) {
    // Primary displacement from surface normal × refraction strength
    vec2 tilt = normal.xy * u_refractStr;
    // Secondary parallax shift from device/cursor tilt
    tilt += u_tilt * u_refractStr * 0.4;
    return screenUV + tilt;
}

`;

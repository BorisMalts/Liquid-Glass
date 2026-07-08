/*!
 * Liquid Glass PRO · v4.1.0 — specular/shaders/fragment/05-fresnel (§15.1 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

export const SPEC_FRESNEL = /* glsl */`// ════════════════════════════════════════════════════════════════════════════
// §15.D  Schlick Fresnel with exact F0 from IOR
//
//  For a dielectric at normal incidence:
//    F0 = ((n1 − n2) / (n1 + n2))²
//       = ((1 − IOR) / (1 + IOR))²
//
//  Schlick's approximation (1994):
//    F(θ) = F0 + (1 − F0) · (1 − cosθ)⁵
//
//  Error vs exact Fresnel: < 2% for dielectrics, excellent for glass.
//  Full Fresnel (using both s and p polarisations) has no closed form
//  in terms of cosines alone; Schlick's approximation is standard in PBR.
// ════════════════════════════════════════════════════════════════════════════

/**
 * @param  cosTheta  cos(angle between V and H), i.e. VdotH
 * @param  F0        Reflectance at normal incidence (derived from IOR)
 * @return           Schlick Fresnel reflectance in [F0, 1.0]
 */
float F_Schlick(float cosTheta, float F0) {
    float x = clamp(1.0 - cosTheta, 0.0, 1.0);
    // x⁵ via repeated squaring: more numerically stable than pow(x,5)
    float x2 = x  * x;
    float x4 = x2 * x2;
    return F0 + (1.0 - F0) * x4 * x;
}

/** Vector form for coloured F0 (used in multi-bounce term). */
vec3 F_Schlick_vec(float cosTheta, vec3 F0) {
    float x  = clamp(1.0 - cosTheta, 0.0, 1.0);
    float x2 = x  * x;
    float x4 = x2 * x2;
    return F0 + (1.0 - F0) * x4 * x;
}

`;


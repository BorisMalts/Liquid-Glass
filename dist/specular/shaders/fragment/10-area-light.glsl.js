/*!
 * Liquid Glass PRO · v4.1.0 — specular/shaders/fragment/10-area-light (§15.1 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
export const SPEC_AREA_LIGHT = /* glsl */ `// ════════════════════════════════════════════════════════════════════════════
// §15.I  Area light representative-point approximation
//
//  Karis (2013) "Real Shading in Unreal Engine 4", SIGGRAPH Course.
//
//  Point lights produce infinitely sharp specular highlights on smooth
//  surfaces (D→∞ at the perfect reflection angle).  Real light sources
//  have finite angular size.  The representative-point method clamps the
//  highlight to a minimum size corresponding to the light's solid angle:
//
//    α_modified = α + lightRadius / (2 · lightDist)
//
//  For the cursor light, lightRadius is driven by hover intensity (the
//  more the user hovers, the more "focused" the virtual light becomes).
//
//  Energy normalisation: because the NDF is not re-normalised after
//  modifying α, a correction factor is applied:
//    normFactor = α / α_modified
//  This prevents the highlight from appearing dimmer as α_modified grows.
// ════════════════════════════════════════════════════════════════════════════

/**
 * Computes the effective roughness for an area light source.
 *
 * @param  alpha        Surface roughness²
 * @param  lightRadius  Angular radius of the light source (in UV space)
 * @param  lightDist    Distance from fragment to light position (UV space)
 * @return              struct (effectiveAlpha, normalisationFactor)
 */
vec2 areaLightRoughness(float alpha, float lightRadius, float lightDist) {
    float alphaMod   = alpha + lightRadius / (2.0 * max(lightDist, 0.01));
    float normFactor = alpha / max(alphaMod, 1e-6);
    return vec2(alphaMod, normFactor);
}

`;

/*!
 * Liquid Glass PRO · v4.1.0 — specular/shaders/fragment/04-ggx-aniso (§15.1 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

export const SPEC_GGX_ANISO = /* glsl */`// ════════════════════════════════════════════════════════════════════════════
// §15.C  Anisotropic GGX NDF
//
//  Burley (2012), as used in the Disney BRDF.
//  Separate roughness values αT (along tangent) and αB (along bitangent).
//  Derived from scalar anisotropy ∈ [0,1]:
//    αT = α / √(1−0.9·aniso)
//    αB = α · √(1−0.9·aniso)
//
//  D_aniso(h) = 1 / (π·αT·αB · (HdotT²/αT² + HdotB²/αB² + NdotH²)²)
//
//  When anisotropy=0: αT=αB=α, reduces exactly to isotropic D_GGX.
// ════════════════════════════════════════════════════════════════════════════

/**
 * @param  H        Half-vector in view space
 * @param  frame    SurfaceFrame containing N, T, B
 * @param  alpha    Isotropic base roughness²
 * @param  aniso    Anisotropy scalar [0,1]
 * @return          Anisotropic NDF value
 */
float D_GGX_aniso(vec3 H, SurfaceFrame frame, float alpha, float aniso) {
    float alphaT = alpha / sqrt(max(1e-6, 1.0 - 0.9 * aniso));
    float alphaB = alpha * sqrt(max(1e-6, 1.0 - 0.9 * aniso));

    float HdotT  = dot(H, frame.T);
    float HdotB  = dot(H, frame.B);
    float NdotH  = max(dot(H, frame.N), 0.0);

    float term   = HdotT * HdotT / (alphaT * alphaT)
                 + HdotB * HdotB / (alphaB * alphaB)
                 + NdotH * NdotH;

    return 1.0 / (PI * alphaT * alphaB * term * term);
}

`;


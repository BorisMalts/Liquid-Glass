/*!
 * Liquid Glass PRO · v4.1.0 — specular/shaders/fragment/07-smith-aniso (§15.1 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
export const SPEC_SMITH_ANISO = /* glsl */ `// ════════════════════════════════════════════════════════════════════════════
// §15.F  Anisotropic Smith-GGX Visibility
//
//  Belcour & Barla (2017) / Heitz (2014) anisotropic extension.
//  Per-axis Λ functions use separate αT, αB for tangent and bitangent:
//
//  Λ_aniso(v) = (−1 + √(1 + (αT²·(VdotT/VdotN)² + αB²·(VdotB/VdotN)²))) / 2
//
//  Height-correlated form:
//  V_aniso(l,v) = 0.5 / (NdotL·Λ_aniso(V) + NdotV·Λ_aniso(L))
// ════════════════════════════════════════════════════════════════════════════

float _lambdaAniso(float NdotX, float TdotX, float BdotX,
                   float alphaT, float alphaB) {
    float t2 = (TdotX / max(NdotX, 1e-4)) * (TdotX / max(NdotX, 1e-4));
    float b2 = (BdotX / max(NdotX, 1e-4)) * (BdotX / max(NdotX, 1e-4));
    return 0.5 * (-1.0 + sqrt(1.0 + alphaT * alphaT * t2 + alphaB * alphaB * b2));
}

/**
 * Anisotropic height-correlated Smith visibility term.
 *
 * @param  V        View vector (view space)
 * @param  L        Light vector (view space)
 * @param  frame    SurfaceFrame
 * @param  alpha    Isotropic base roughness²
 * @param  aniso    Anisotropy scalar
 * @return          Visibility term V(l,v)
 */
float V_SmithGGX_aniso(vec3 V, vec3 L, SurfaceFrame frame,
                       float alpha, float aniso) {
    float alphaT = alpha / sqrt(max(1e-6, 1.0 - 0.9 * aniso));
    float alphaB = alpha * sqrt(max(1e-6, 1.0 - 0.9 * aniso));

    float NdotV  = max(dot(frame.N, V), 1e-4);
    float NdotL  = max(dot(frame.N, L), 1e-4);
    float TdotV  = dot(frame.T, V);
    float BdotV  = dot(frame.B, V);
    float TdotL  = dot(frame.T, L);
    float BdotL  = dot(frame.B, L);

    float lambdaV = _lambdaAniso(NdotV, TdotV, BdotV, alphaT, alphaB);
    float lambdaL = _lambdaAniso(NdotL, TdotL, BdotL, alphaT, alphaB);

    return 0.5 / (NdotL * (1.0 + lambdaV) + NdotV * (1.0 + lambdaL) + 1e-6);
}

`;

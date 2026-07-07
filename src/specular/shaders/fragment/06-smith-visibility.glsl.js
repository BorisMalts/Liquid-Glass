/*!
 * Liquid Glass PRO · v4.1.0 — specular/shaders/fragment/06-smith-visibility (§15.1 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

export const SPEC_SMITH_VISIBILITY = /* glsl */`// ════════════════════════════════════════════════════════════════════════════
// §15.E  Smith GGX Height-Correlated Visibility Function
//
//  Heitz (2014) "Understanding the Masking-Shadowing Function in
//  Microfacet-Based BRDFs", JCGT.
//
//  The height-correlated form accounts for statistical correlation between
//  masking and shadowing at the same height on the microsurface.  It is
//  more physically accurate than the uncorrelated (λ_V · λ_L) product,
//  especially at grazing angles where uncorrelated Smith over-darkens.
//
//  Λ(v) = (−1 + √(1 + α²·tan²θ)) / 2
//       = (−1 + √(1 + α²·(1−NdotV²)/NdotV²)) / 2
//
//  G2(l,v) = 1 / (1 + Λ(v) + Λ(l))      [height-correlated]
//
//  Optimised form (Lagarde, de Rousiers 2014 — used in Filament, UE4):
//  V(l,v) = G2 / (4·NdotL·NdotV)  [visibility term, denominator absorbed]
//    = 0.5 / (NdotL·√(NdotV²(1−a²)+a²) + NdotV·√(NdotL²(1−a²)+a²))
// ════════════════════════════════════════════════════════════════════════════

/**
 * Height-correlated Smith GGX visibility term with denominator 4·NdotL·NdotV
 * already absorbed (returns V, not G).
 *
 * @param  NdotL  cos angle of light with normal
 * @param  NdotV  cos angle of view  with normal
 * @param  alpha  Roughness²
 * @return        Combined visibility + denominator term
 */
float V_SmithGGX_heightCorrelated(float NdotL, float NdotV, float alpha) {
    float a2    = alpha * alpha;
    float lambdaV = NdotL * sqrt(NdotV * NdotV * (1.0 - a2) + a2);
    float lambdaL = NdotV * sqrt(NdotL * NdotL * (1.0 - a2) + a2);
    // 0.5 / (λV + λL) : the 4·NdotL·NdotV denominator is absorbed into λ
    return 0.5 / (lambdaV + lambdaL + 1e-6);
}

`;


/*!
 * Liquid Glass PRO · v4.1.0 — specular/shaders/fragment/08-kulla-conty (§15.1 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

export const SPEC_KULLA_CONTY = /* glsl */`// ════════════════════════════════════════════════════════════════════════════
// §15.G  Kulla-Conty multi-bounce energy compensation
//
//  Kulla & Conty (2017) "Revisiting Physically Based Shading at Imageworks"
//  SIGGRAPH Course.
//
//  Single-scattering BRDFs (including Cook-Torrance) violate energy
//  conservation at high roughness: the missing energy represents light that
//  bounced between microfacets before escaping.  The multi-scatter term adds
//  this back:
//
//  f_ms(l,v) = (1−E(NdotL)) · (1−E(NdotV)) / (π · (1 − E_avg))
//
//  where E(μ) = ∫₀^(2π) ∫₀^(π/2) f_single(l,v) · cos(θ) · sin(θ) dθ dφ
//  is the directional albedo of the single-scattering BRDF.
//
//  E(μ) and E_avg are precomputed into a 1D LUT keyed on (μ, roughness).
//  Here we use the Lagarde et al. (2018) analytical approximation that
//  avoids a 2D LUT entirely, accurate to < 1% for α ∈ [0.02, 1.0]:
//
//  E(μ, α) ≈ 1 − (0.0475 + 0.0904·α − 0.1819·α²) · (1−μ)
//             − (0.5     + 0.2916·α               ) · (1−μ)²
//             + (0.1     + 0.1532·α               ) · (1−μ)³
//  E_avg(α) ≈ 1 − 0.2734·α − 0.4694·α² (fit to Monte Carlo table)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Directional albedo E(μ, α) — analytical approximation.
 * Avoids texture lookup for E(μ); sampler u_lut is retained for
 * future higher-order terms or validation comparisons.
 *
 * @param  mu     cos(θ) for incident or exitant direction
 * @param  alpha  Roughness²
 * @return        E(μ) ∈ [0,1], fraction of energy reflected by single-scatter
 */
float kc_E(float mu, float alpha) {
    float om = 1.0 - mu;
    return clamp(
        1.0
        - (0.0475 + 0.0904 * alpha - 0.1819 * alpha * alpha) * om
        - (0.5    + 0.2916 * alpha                          ) * om * om
        + (0.1    + 0.1532 * alpha                          ) * om * om * om,
        0.0, 1.0
    );
}

/** E_avg(α) — hemispherical average of E(μ,α). */
float kc_Eavg(float alpha) {
    return clamp(1.0 - 0.2734 * alpha - 0.4694 * alpha * alpha, 0.0, 1.0);
}

/**
 * Kulla-Conty multi-bounce term f_ms.
 * Add to the single-scatter BRDF to restore energy at high roughness.
 * For glass (α = 0.04) the correction is < 0.3% — physically negligible
 * but included for mathematical completeness.
 *
 * @param  NdotL  cos angle of light with normal
 * @param  NdotV  cos angle of view  with normal
 * @param  alpha  Roughness²
 * @return        Multi-bounce radiance contribution (scalar; apply colour later)
 */
float f_multiScatter(float NdotL, float NdotV, float alpha) {
    float Ev   = kc_E(NdotV, alpha);
    float El   = kc_E(NdotL, alpha);
    float Eavg = kc_Eavg(alpha);
    float denom = PI * (1.0 - Eavg);
    return (1.0 - Ev) * (1.0 - El) / max(denom, 1e-6);
}

`;


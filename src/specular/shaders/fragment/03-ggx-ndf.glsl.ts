/*!
 * Liquid Glass PRO · v4.1.0 — specular/shaders/fragment/03-ggx-ndf (§15.1 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

export const SPEC_GGX_NDF = /* glsl */`// ════════════════════════════════════════════════════════════════════════════
// §15.B  GGX Isotropic NDF
//
//  Trowbridge & Reitz (1975), re-parameterised by Walter et al. (2007)
//  and standardised as GGX.
//
//  D(h) = α² / (π · ((NdotH²)(α²−1) + 1)²)
//
//  At NdotH = 1 (h perfectly aligned with N) → D = α²/π, the peak.
//  At grazing NdotH → 0, D → 0 quickly for small α.
//  Total solid-angle integral ∫D(h)(NdotH)dh = 1 (energy-preserving).
// ════════════════════════════════════════════════════════════════════════════

/**
 * @param  NdotH    Cosine of angle between surface normal and half-vector.
 * @param  alpha    Roughness²  (α in the GGX formula, NOT perceptual roughness)
 * @return          NDF value D(h) in steradians⁻¹
 */
float D_GGX(float NdotH, float alpha) {
    float a2  = alpha * alpha;
    float denom = NdotH * NdotH * (a2 - 1.0) + 1.0;
    return a2 / (PI * denom * denom);
}

`;


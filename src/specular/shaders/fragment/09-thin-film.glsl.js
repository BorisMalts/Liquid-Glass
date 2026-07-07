/*!
 * Liquid Glass PRO · v4.1.0 — specular/shaders/fragment/09-thin-film (§15.1 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

export const SPEC_THIN_FILM = /* glsl */`// ════════════════════════════════════════════════════════════════════════════
// §15.H  Thin-film iridescence  (Born & Wolf, 1999)
//
//  A thin coating of thickness d and refractive index n_film creates
//  constructive/destructive interference for different wavelengths.
//
//  Optical path difference:
//    OPD(θ_t) = 2 · n_film · d · cos(θ_t)
//
//  where θ_t is the refraction angle inside the film:
//    cos(θ_t) = √(1 − (sin(θ_i)/n_film)²)  (Snell's law)
//    sin(θ_i) = √(1 − VdotH²)
//
//  Interference intensity for wavelength λ:
//    I(λ) = 0.5 + 0.5 · cos(2π · OPD / λ)
//
//  Evaluated at RGB wavelengths:
//    λR = 680 nm, λG = 550 nm, λB = 450 nm
//
//  The iridescence colour is then modulated by Fresnel (more visible at
//  grazing angles) and the Schlick factor to respect energy conservation.
//
//  This replaces the CSS conic-gradient approximation with a derivation
//  from Maxwell's equations of wave optics.
// ════════════════════════════════════════════════════════════════════════════

/**
 * Evaluates thin-film iridescence for three RGB wavelengths.
 *
 * @param  VdotH       cos(angle between V and H)
 * @param  filmThick   Coating thickness in nm
 * @param  filmIOR     Coating refractive index
 * @return             RGB iridescence colour ∈ [0,1]³
 */
vec3 thinFilmIridescence(float VdotH, float filmThick, float filmIOR) {
    // sin²(θ_i) from cos(θ_i) = VdotH
    float sin2_i  = clamp(1.0 - VdotH * VdotH, 0.0, 1.0);

    // Snell's law into the film: sin²(θ_t) = sin²(θ_i) / n_film²
    float sin2_t  = sin2_i / (filmIOR * filmIOR);

    // cos(θ_t) from Pythagorean identity
    float cos_t   = sqrt(max(0.0, 1.0 - sin2_t));

    // Optical path difference: OPD = 2 · n · d · cos(θ_t)
    float OPD     = 2.0 * filmIOR * filmThick * cos_t;

    // Interference at three wavelengths (units: nm)
    const float lambdaR = 680.0;
    const float lambdaG = 550.0;
    const float lambdaB = 450.0;

    float iR = 0.5 + 0.5 * cos(2.0 * PI * OPD / lambdaR);
    float iG = 0.5 + 0.5 * cos(2.0 * PI * OPD / lambdaG);
    float iB = 0.5 + 0.5 * cos(2.0 * PI * OPD / lambdaB);

    return vec3(iR, iG, iB);
}

`;


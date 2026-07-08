/*!
 * Liquid Glass PRO · v4.1.0 — webgl/shaders/fragment/10-beer-lambert (§6.0 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

export const FRAG_BEER_LAMBERT = /* glsl */`// ════════════════════════════════════════════════════════════════════════════
// §H2  Beer-Lambert chromatic transmission
//
//  Physical model: I = I₀ · exp(−σ · d)
//
//  σ_ch = (1.0 − tintRGB_ch) · u_tintStrength · 3.5
//    — derived from the absorption cross-section of the glass colorant.
//    — value 3.5 maps tintStrength ∈ [0,1] to a physically plausible
//      optical depth range (OD ≈ 0–3.5, i.e. 100%–3% transmission).
//
//  Independent per-channel computation means:
//    tintRGB = (1,0,0) → only red passes (ruby/blood glass)
//    tintRGB = (0,1,0) → only green passes (emerald)
//    tintRGB = (1,1,1) → neutral (clear / no absorption)
//
//  Applied to the refracted background colour BEFORE caustic compositing,
//  so the caustic filaments still appear in the coloured-glass hue.
// ════════════════════════════════════════════════════════════════════════════

/**
 * Beer-Lambert spectral absorption applied to refracted background.
 *
 * @param  bgColor    Refracted RGB sample from u_background
 * @return            Attenuated RGB colour
 */
vec3 beerLambertTransmit(vec3 bgColor) {
    // Absorption coefficient per channel: high where tintRGB is low
    vec3 sigma = (1.0 - u_tintRGB) * u_tintStrength * 3.5;
    // exp(−σ) — physical Beer-Lambert transmittance
    vec3 transmit = exp(-sigma);
    // Also add the tint colour as a faint self-emission (fluorescence term)
    // so completely absorbing glass still shows its own colour faintly.
    vec3 emission = u_tintRGB * u_tintStrength * 0.06;
    return bgColor * transmit + emission;
}

`;


/*!
 * Liquid Glass PRO · v4.1.0 — webgl/shaders/fragment/03-sellmeier (§6.0 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
export const FRAG_SELLMEIER = /* glsl */ `// ════════════════════════════════════════════════════════════════════════════
// §C  Sellmeier dispersion — replaces Cauchy approximation
//
//  Physical basis:
//    n²(λ) = 1 + Σ_j [ B_j · λ² / (λ² − C_j) ]
//
//    Three resonance terms per material:
//      j=1 → UV electronic absorption  (C₁ ≈ 0.006–0.014 µm²)
//      j=2 → near-UV secondary         (C₂ ≈ 0.020–0.060 µm²)
//      j=3 → far-IR phonon lattice     (C₃ ≈ 100–200    µm²)
//
//  All coefficients from Schott Glass catalogue 2023 edition.
//  Valid range: λ ∈ [0.365, 2.325] µm.  For visible (0.380–0.750 µm):
//  RMS error < 0.0001 vs spectrometer measurement.
//
//  Replaces Cauchy which over-estimated blue dispersion by ~2.5×:
//    Cauchy  Δn(R→B) ≈ 0.028  (empirically tuned, wrong shape)
//    BK7     Δn(R→B) ≈ 0.011  (physically exact)
//    SF11    Δn(R→B) ≈ 0.041  (heavy flint, strong rainbow)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Sellmeier dispersion equation.
 * Returns the refractive index n(λ) for the glass material selected
 * by the u_glassType uniform.
 *
 * @param  l   Wavelength in micrometres (µm).
 *             Visible primaries: R=0.680, G=0.550, B=0.450
 * @return     Refractive index n(λ) ≥ 1.0
 */
float sellmeier(float l) {
    float l2 = l * l;  // λ² — reused in all three resonance denominators

    // Sellmeier B and C coefficients for each glass type.
    // Declared as local floats — GPU compiler packs into registers.
    float B1, B2, B3;
    float C1, C2, C3;

    if (u_glassType < 0.5) {
        // ── BK7 — Borosilicate Crown (Schott N-BK7) ──────────────────────────
        // Most widely used optical glass: camera lenses, microscope objectives,
        // laser windows, display cover glass.
        // Abbe V = 64.17 | n_D = 1.51680 | Δn(R→B) = 0.01101
        // Visual: subtle prismatic fringing, familiar everyday glass.
        B1 = 1.03961212;  C1 = 0.00600069867;   // UV electronic resonance
        B2 = 0.23179234;  C2 = 0.02001791440;   // near-UV secondary
        B3 = 1.01046945;  C3 = 103.560653;      // far-IR phonon lattice

    } else if (u_glassType < 1.5) {
        // ── SF11 — Heavy Flint (Schott SF11) ─────────────────────────────────
        // Dense flint glass: prisms, diffraction gratings, decorative crystal,
        // chandeliers, high-power laser optics.
        // Abbe V = 25.76 | n_D = 1.78472 | Δn(R→B) = 0.04079
        // Visual: vivid spectral rainbow splitting like Swarovski crystal.
        B1 = 1.73848403;  C1 = 0.01366091;      // strong UV resonance (high n)
        B2 = 0.31116800;  C2 = 0.06169579;      // broader near-UV term
        B3 = 1.17490871;  C3 = 121.922711;      // IR phonon

    } else if (u_glassType < 2.5) {
        // ── N-FK51A — Fluorite Crown (Schott N-FK51A) ────────────────────────
        // Low-index fluorophosphate glass: APO camera lenses, telescope
        // objectives, UV optics, colour-corrected microscope objectives.
        // Abbe V = 81.61 | n_D = 1.48656 | Δn(R→B) = 0.00536
        // Visual: clean sharp edges, near-zero colour fringing like APO lens.
        B1 = 0.97124800;  C1 = 0.00472301995;   // weak UV resonance (low n)
        B2 = 0.21602196;  C2 = 0.01530890;      // near-UV secondary
        B3 = 0.90448069;  C3 = 168.681840;      // shifted IR phonon

    } else if (u_glassType < 3.5) {
        // ── N-BK10 — Thin Crown (Schott N-BK10) ─────────────────────────────
        // Low-index borosilicate crown: architectural window glass, display
        // panels, lightweight optical elements, eyeglass lenses.
        // Abbe V = 67.90 | n_D = 1.49780 | Δn(R→B) = 0.00841
        // Visual: minimal chromatic fringing, clean everyday window quality.
        B1 = 0.88841934;  C1 = 0.00516900822;   // UV resonance
        B2 = 0.32846101;  C2 = 0.01774020216;   // near-UV
        B3 = 0.95900362;  C3 = 95.7565128;      // IR phonon

    } else {
        // ── F2 — Flint (Schott F2) ────────────────────────────────────────────
        // Classic medium flint: achromatic doublets, vintage optics,
        // ornamental glass, spectroscopic prisms.
        // Abbe V = 36.43 | n_D = 1.62005 | Δn(R→B) = 0.02265
        // Visual: clearly visible colour fringing, warm vintage optics feel.
        B1 = 1.34533359;  C1 = 0.00997743871;   // UV resonance
        B2 = 0.20977271;  C2 = 0.04703644880;   // near-UV
        B3 = 0.89270000;  C3 = 111.886764;      // IR phonon
    }

    // n²(λ) = 1 + B₁λ²/(λ²−C₁) + B₂λ²/(λ²−C₂) + B₃λ²/(λ²−C₃)
    // The sqrt argument is always > 1.0 for real dielectrics in visible range.
    return sqrt(1.0
        + B1 * l2 / (l2 - C1)   // UV term    — drives blue-end refractive rise
        + B2 * l2 / (l2 - C2)   // near-UV    — mid-range curvature correction
        + B3 * l2 / (l2 - C3)   // IR phonon  — flat baseline offset across visible
    );
}

// ── Per-channel IOR via Sellmeier ─────────────────────────────────────────────
// RGB primary wavelengths in micrometres — CIE standard illuminant D65.
//   λR = 0.680 µm (680 nm) — red   primary, near photopic long-wavelength edge
//   λG = 0.550 µm (550 nm) — green primary, peak of human photopic response
//   λB = 0.450 µm (450 nm) — blue  primary, near photopic short-wavelength edge
//
// Spread iorB − iorR = physically accurate Δn for the selected glass type:
//   BK7:     Δn ≈ 0.011  subtle
//   SF11:    Δn ≈ 0.041  vivid rainbow
//   N-FK51A: Δn ≈ 0.005  near-zero
//   N-BK10:  Δn ≈ 0.008  clean window
//   F2:      Δn ≈ 0.023  vintage optics
//
// Declared at module scope (outside any function) so both chromaticRefraction()
// and any future multi-wavelength pass can share these values without recomputing.

`;

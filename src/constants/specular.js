/*!
 * Liquid Glass PRO · v4.1.0 — constants/specular (§15.0)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

// ─────────────────────────────────────────────────────────────────────────────
// §15.0  Constants and shared state
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Physical constants for the glass medium.
 * All values match soda-lime glass (the most common optical glass).
 */
export const GLASS_IOR       = 1.52;          // Soda-lime glass refractive index
export const GLASS_F0        = Math.pow((GLASS_IOR - 1) / (GLASS_IOR + 1), 2);  // ≈ 0.0426
export const FILM_THICKNESS  = 320;           // nm — antireflection coating thickness
export const FILM_IOR        = 1.38;          // MgF₂ antireflection coating (common on optics)

/**
 * Roughness parameter for the glass surface.
 * α = 0.04 → near-perfect mirror (GGX lobe is very tight).
 * This is the "Disney reparameterisation": α = userRoughness².
 * Corresponds to a microsurface RMS slope of ~2°.
 */
export const BASE_ROUGHNESS  = 0.04;

/**
 * Anisotropy strength [0, 1].
 * 0 = isotropic (perfect circle lobe).
 * 0.35 = slight horizontal stretch, like brushed glass or float glass distortion.
 */
export const ANISOTROPY      = 0.35;

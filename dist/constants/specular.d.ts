/*!
 * Liquid Glass PRO · v4.1.0 — constants/specular (§15.0)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
/**
 * Physical constants for the glass medium.
 * All values match soda-lime glass (the most common optical glass).
 */
export declare const GLASS_IOR = 1.52;
export declare const GLASS_F0: number;
export declare const FILM_THICKNESS = 320;
export declare const FILM_IOR = 1.38;
/**
 * Roughness parameter for the glass surface.
 * α = 0.04 → near-perfect mirror (GGX lobe is very tight).
 * This is the "Disney reparameterisation": α = userRoughness².
 * Corresponds to a microsurface RMS slope of ~2°.
 */
export declare const BASE_ROUGHNESS = 0.04;
/**
 * Anisotropy strength [0, 1].
 * 0 = isotropic (perfect circle lobe).
 * 0.35 = slight horizontal stretch, like brushed glass or float glass distortion.
 */
export declare const ANISOTROPY = 0.35;

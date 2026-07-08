/*!
 * Liquid Glass PRO · v4.1.0 — webgl/shaders/fragment/05-surface-normal (§6.0 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
export const FRAG_SURFACE_NORMAL = /* glsl */ `// ════════════════════════════════════════════════════════════════════════════
// §E  Surface normal  (bump-map from animated noise)
// ════════════════════════════════════════════════════════════════════════════

/**
 * Computes a view-space surface normal for this fragment from an animated
 * gradient noise height field.  The normal encodes the local glass surface
 * tilt, which is subsequently used to:
 *   1. Displace the background UV for screen-space refraction.
 *   2. Modulate the Schlick Fresnel term (grazing-angle reflection).
 *   3. Move the specular hotspot.
 *
 * Technique: finite-difference gradient of a 2D noise field.
 *   N ≈ normalize( (−∂h/∂x, −∂h/∂y, 1) )
 *
 * @param  uv  Element-local UV (0..1)
 * @return     Normalised surface normal in view space
 */
vec3 surfaceNormal(vec2 uv) {
    float eps = 0.002;  // Finite-difference step (≈ 0.2% of element width)

    // Sample base noise field and two offset points for gradient estimation
    float hC = gnoise(uv * 7.0 + u_time * 0.07);
    float hR = gnoise((uv + vec2(eps, 0.0)) * 7.0 + u_time * 0.07);
    float hU = gnoise((uv + vec2(0.0, eps)) * 7.0 + u_time * 0.07);

    // Interactive bump: Gaussian-falloff cursor-driven distortion
    float mouseInfluence = u_hover * 0.4 * exp(-length(uv - u_mouse) * 3.5);
    float hM = gnoise(uv * 11.0 - u_mouse * 2.0 + u_time * 0.13) * mouseInfluence;

    float dX = (hR - hC) / eps + hM * 0.03;
    float dY = (hU - hC) / eps + hM * 0.03;

    return normalize(vec3(-dX * 0.8, -dY * 0.8, 1.0));
}

`;

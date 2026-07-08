/*!
 * Liquid Glass PRO · v4.1.0 — specular/shaders/fragment/02-surface-frame (§15.1 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
export const SPEC_SURFACE_FRAME = /* glsl */ `// ════════════════════════════════════════════════════════════════════════════
// §15.A  Surface normal + tangent frame
//
//  The normal is computed identically to §6 surfaceNormal() so that the
//  specular highlight sits exactly on the same surface as the caustics.
//  Additionally we extract the tangent T from the height field gradient
//  for use in anisotropic GGX — this is the Gram-Schmidt-orthogonalised
//  direction of maximum curvature on the noise surface.
// ════════════════════════════════════════════════════════════════════════════

struct SurfaceFrame {
    vec3 N;   // Surface normal
    vec3 T;   // Tangent  (aligned with noise gradient = aniso "grain" direction)
    vec3 B;   // Bitangent
};

/**
 * Computes view-space normal and full tangent frame from the animated
 * bump-map height field.  The tangent T is taken directly from the
 * finite-difference gradient of the noise, giving anisotropy a natural
 * orientation tied to the surface structure.
 *
 * @param  uv  Element-local UV
 * @return     Orthonormal SurfaceFrame { N, T, B }
 */
SurfaceFrame buildFrame(vec2 uv) {
    float eps  = 0.002;
    float hC   = gnoise(uv * 7.0 + u_time * 0.07);
    float hR   = gnoise((uv + vec2(eps, 0.0)) * 7.0 + u_time * 0.07);
    float hU   = gnoise((uv + vec2(0.0, eps)) * 7.0 + u_time * 0.07);

    float mouseInf = u_hover * 0.4 * exp(-length(uv - u_mouse) * 3.5);
    float hM       = gnoise(uv * 11.0 - u_mouse * 2.0 + u_time * 0.13) * mouseInf;

    float dX = (hR - hC) / eps + hM * 0.03;
    float dY = (hU - hC) / eps + hM * 0.03;

    vec3 N = normalize(vec3(-dX * 0.8, -dY * 0.8, 1.0));

    // Tangent: direction of maximum gradient in screen space, lifted to 3D.
    // Gram-Schmidt orthogonalisation against N ensures T ⊥ N exactly.
    vec3 Traw = normalize(vec3(dX, dY, 0.0) + vec3(0.0001));  // avoid degenerate
    vec3 T    = normalize(Traw - dot(Traw, N) * N);
    vec3 B    = cross(N, T);

    return SurfaceFrame(N, T, B);
}

`;

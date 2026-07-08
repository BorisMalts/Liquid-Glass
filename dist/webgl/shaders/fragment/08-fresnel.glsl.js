/*!
 * Liquid Glass PRO · v4.1.0 — webgl/shaders/fragment/08-fresnel (§6.0 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
export const FRAG_FRESNEL = /* glsl */ `// ════════════════════════════════════════════════════════════════════════════
// §H  Schlick Fresnel approximation
// ════════════════════════════════════════════════════════════════════════════

/**
 * Schlick's approximation: R(θ) ≈ F0 + (1−F0)·(1−cosθ)⁵
 *
 * @param  cosTheta  cos(angle between view ray and surface normal)
 * @param  f0        Reflectance at normal incidence (≈ 0.04 for glass)
 * @return           Fresnel reflectance in [f0, 1.0]
 */
float schlick(float cosTheta, float f0) {
    return f0 + (1.0 - f0) * pow(clamp(1.0 - cosTheta, 0.0, 1.0), 5.0);
}

`;

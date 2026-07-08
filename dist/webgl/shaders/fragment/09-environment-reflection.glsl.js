/*!
 * Liquid Glass PRO · v4.1.0 — webgl/shaders/fragment/09-environment-reflection (§6.0 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
export const FRAG_ENV_REFLECTION = /* glsl */ `// ════════════════════════════════════════════════════════════════════════════
// §I  Environment reflection probe
// ════════════════════════════════════════════════════════════════════════════

/**
 * Approximates environmental reflection at grazing angles via horizontal mirror.
 *
 * @param  uv             Element-local UV
 * @param  normal         Surface normal from surfaceNormal()
 * @param  fresnelFactor  Schlick reflectance at this fragment
 * @return                Environment reflection colour contribution
 */
vec3 environmentReflection(vec2 uv, vec3 normal, float fresnelFactor) {
    if (u_bgReady < 0.5 || fresnelFactor < 0.01) return vec3(0.0);

    vec2 screenUV = u_elementPos + uv * u_elementSize + u_scroll;
    vec2 mirrorUV = vec2(1.0 - screenUV.x, screenUV.y) + normal.xy * 0.05;
    mirrorUV      = clamp(mirrorUV, 0.0, 1.0);

    return texture(u_background, mirrorUV).rgb * fresnelFactor * 0.35;
}
`;

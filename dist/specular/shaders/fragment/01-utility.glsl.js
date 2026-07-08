/*!
 * Liquid Glass PRO · v4.1.0 — specular/shaders/fragment/01-utility (§15.1 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
export const SPEC_UTILITY = /* glsl */ `// ════════════════════════════════════════════════════════════════════════════
// Utility
// ════════════════════════════════════════════════════════════════════════════

const float PI    = 3.14159265358979;
const float INV_PI = 0.31830988618;

// Safe normalise: returns vec3(0,0,1) if input is degenerate.
vec3 safeNorm(vec3 v) {
    float l = length(v);
    return l > 1e-6 ? v / l : vec3(0.0, 0.0, 1.0);
}

// Perlin-style gradient noise — identical to §6 so surface normals are
// frame-accurate with the caustic pass.
vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

float gnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(dot(hash2(i + vec2(0,0)), f - vec2(0,0)),
            dot(hash2(i + vec2(1,0)), f - vec2(1,0)), u.x),
        mix(dot(hash2(i + vec2(0,1)), f - vec2(0,1)),
            dot(hash2(i + vec2(1,1)), f - vec2(1,1)), u.x),
        u.y
    ) * 0.5 + 0.5;
}

`;

/*!
 * Liquid Glass PRO · v4.1.0 — specular/shaders/fragment/13-vignette (§15.1 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
export const SPEC_VIGNETTE = /* glsl */ `// ════════════════════════════════════════════════════════════════════════════
// §15.L  Vignette + alpha derivation
// ════════════════════════════════════════════════════════════════════════════

float vignetteSpecular(vec2 uv) {
    float vx = smoothstep(0.0, 0.06, uv.x) * smoothstep(1.0, 0.94, uv.x);
    float vy = smoothstep(0.0, 0.06, uv.y) * smoothstep(1.0, 0.94, uv.y);
    return vx * vy;
}

`;

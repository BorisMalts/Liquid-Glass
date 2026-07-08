/*!
 * Liquid Glass PRO · v4.1.0 — specular/shaders/fragment/12-lights (§15.1 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
export const SPEC_LIGHTS = /* glsl */ `// ════════════════════════════════════════════════════════════════════════════
// §15.K  Three-light configuration
//
//  L0  Primary: cursor-tracking warm key light
//      Colour: 1.0, 0.97, 0.92 (warm white, 5600K tungsten-ish)
//      Position: follows u_mouse with hover intensification
//      Intensity: 2.8 base, boosted on hover
//
//  L1  Secondary: fixed upper-left environment fill
//      Colour: 0.88, 0.93, 1.00 (cool sky blue, 8000K)
//      Position: static at upper-left (0.12, 0.10)
//      Intensity: 0.55 (fill, not key)
//
//  L2  Back-scatter: opposite to L0, purple tint
//      Colour: 0.76, 0.70, 1.00 (violet, approximates indirect bounced light)
//      Position: mirror of L0 around element centre
//      Intensity: 0.30
// ════════════════════════════════════════════════════════════════════════════

struct Light {
    vec3  colour;
    vec2  uvPos;   // UV-space position for area-light distance
    vec3  dir;     // View-space direction (normalised)
};

/**
 * Builds the three-light array for this fragment.
 * L0 position is cursor-driven; L1 and L2 are partially tilt-driven.
 *
 * @param  uv   Fragment UV (used to build view-space light directions)
 * @return      Light[3]
 */
void buildLights(vec2 uv, out Light L0, out Light L1, out Light L2) {
    // Light positions in UV space
    vec2 pos0 = vec2(0.20, 0.16)
              + u_mouse * 0.30 * u_hover
              + u_tilt  * 0.10;

    vec2 pos1 = vec2(0.12, 0.10) + u_tilt * 0.05;

    vec2 pos2 = vec2(1.0, 1.0) - pos0;           // mirror of L0

    // View-space direction: light pos lifted to 3D (z = 0.7 = oblique angle)
    // This approximates a light 35° above the surface plane.
    L0.colour = vec3(1.00, 0.97, 0.92) * (2.8 + u_hover * 1.4);
    L0.uvPos  = pos0;
    L0.dir    = safeNorm(vec3(pos0 - uv, 0.7));

    L1.colour = vec3(0.88, 0.93, 1.00) * 0.55;
    L1.uvPos  = pos1;
    L1.dir    = safeNorm(vec3(pos1 - uv, 0.7));

    L2.colour = vec3(0.76, 0.70, 1.00) * 0.30;
    L2.uvPos  = pos2;
    L2.dir    = safeNorm(vec3(pos2 - uv, 0.5));
}

`;

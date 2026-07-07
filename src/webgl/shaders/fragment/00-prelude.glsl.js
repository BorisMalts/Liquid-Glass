/*!
 * Liquid Glass PRO · v4.1.0 — webgl/shaders/fragment/00-prelude (§6.0 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

export const FRAG_PRELUDE = /* glsl */`#version 300 es
precision highp float;

// ── Interpolants ─────────────────────────────────────────────────────────────
in  vec2  v_uv;       // Element-local UV (0..1, top-left origin)

// ── Output ───────────────────────────────────────────────────────────────────
out vec4  fragColor;  // Premultiplied RGBA output

// ── Uniforms ─────────────────────────────────────────────────────────────────
uniform float     u_time;         // Seconds since context creation
uniform vec2      u_mouse;        // Cursor position in element UV (spring-smoothed)
uniform float     u_hover;        // Hover intensity scalar, 0=idle 1=hovered
uniform vec2      u_tilt;         // Tilt angles per axis (−1..+1)
uniform vec2      u_res;          // Physical canvas size in pixels

// ── v2.0.0 background refraction uniforms ────────────────────────────────────
uniform sampler2D u_background;   // html2canvas snapshot, bound to TEXTURE_UNIT1
uniform vec2      u_bgRes;        // Background texture pixel dimensions (reserved)
uniform vec2      u_elementPos;   // Element top-left in normalised screen space
uniform vec2      u_elementSize;  // Element size as fraction of viewport
uniform float     u_ior;          // Physical index of refraction
uniform float     u_refractStr;   // UV displacement magnitude for refraction
uniform float     u_bgReady;      // 1.0 when u_background contains valid data
uniform vec2      u_scroll;       // Scroll drift since last capture, normalised

// ── v3.1.0 glass material type ────────────────────────────────────────────────
// Selects Sellmeier dispersion coefficients for the chosen optical glass.
//   0 = BK7     borosilicate crown   Abbe V=64.17  standard optical glass
//   1 = SF11    heavy flint          Abbe V=25.76  maximum prismatic effect
//   2 = N-FK51A fluorite crown       Abbe V=81.61  apochromat, near-zero dispersion
//   3 = N-BK10  thin crown           Abbe V=67.90  window glass character
//   4 = F2      flint                Abbe V=36.43  medium-high dispersion
uniform float     u_glassType;

// ── v4.1.0 glass variant uniforms ────────────────────────────────────────────
uniform vec3      u_tintRGB;        // Beer-Lambert tint colour (linear RGB)
uniform float     u_tintStrength;   // Absorption coefficient scale
uniform float     u_frostedAmount;  // Scatter-blur amount 0..1
uniform float     u_mirrorStrength; // Mirror reflection boost 0..1
uniform float     u_smokeDensity;   // Uniform broadband darkening 0..1
uniform float     u_causticScale;   // Caustic intensity multiplier
uniform vec3      u_causticTint;    // RGB tint applied to caustic layer
`;


/*!
 * Liquid Glass PRO · v4.1.0 — specular/shaders/fragment/00-prelude (§15.1 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

export const SPEC_PRELUDE = /* glsl */`#version 300 es
precision highp float;

// ── Interpolants ─────────────────────────────────────────────────────────────
in  vec2  v_uv;

// ── Output ───────────────────────────────────────────────────────────────────
out vec4  fragColor;

// ── Uniforms ─────────────────────────────────────────────────────────────────
uniform float     u_time;
uniform vec2      u_mouse;
uniform float     u_hover;
uniform vec2      u_tilt;
uniform vec2      u_res;
uniform float     u_ior;          // Live IOR from _opts (default 1.52)
uniform float     u_roughness;    // BASE_ROUGHNESS (0.04)
uniform float     u_anisotropy;   // ANISOTROPY (0.35)
uniform sampler2D u_lut;          // Kulla-Conty E_avg LUT (1D, 256×1)
uniform float     u_filmThick;    // Thin-film thickness in nm
uniform float     u_filmIOR;      // Thin-film coating IOR

`;


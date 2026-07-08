/*!
 * Liquid Glass PRO · v4.1.0 — webgl/shaders/vertex (§6.0 — fullscreen triangle)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

// ─────────────────────────────────────────────────────────────────────────────
// §6.0  GLSL source strings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Vertex shader source.
 *
 * Outputs a fullscreen triangle covering clip-space [−1,1]² using only 3
 * vertices (no index buffer needed).  The UV interpolant v_uv is derived
 * from the clip-space position: v_uv = a_pos * 0.5 + 0.5.
 *
 * The fullscreen-triangle trick avoids the diagonal seam artefact that can
 * appear when rendering with two triangles (a quad) at high magnification.
 *
 * @type {string}
 */
export const _VERT_SRC = /* glsl */`#version 300 es
precision mediump float;

// ── Inputs ───────────────────────────────────────────────────────────────────
in  vec2 a_pos;  // clip-space position: one of (−1,−1), (3,−1), (−1,3)

// ── Outputs ──────────────────────────────────────────────────────────────────
out vec2 v_uv;   // element-local UV (0..1), interpolated across fragment

void main() {
    // Map clip-space [−1,1] → texture UV [0,1].
    v_uv        = a_pos * 0.5 + 0.5;
    gl_Position = vec4(a_pos, 0.0, 1.0);
}`;

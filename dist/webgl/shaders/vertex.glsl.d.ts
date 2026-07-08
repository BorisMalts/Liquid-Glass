/*!
 * Liquid Glass PRO · v4.1.0 — webgl/shaders/vertex (§6.0 — fullscreen triangle)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
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
export declare const _VERT_SRC = "#version 300 es\nprecision mediump float;\n\n// \u2500\u2500 Inputs \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nin  vec2 a_pos;  // clip-space position: one of (\u22121,\u22121), (3,\u22121), (\u22121,3)\n\n// \u2500\u2500 Outputs \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\nout vec2 v_uv;   // element-local UV (0..1), interpolated across fragment\n\nvoid main() {\n    // Map clip-space [\u22121,1] \u2192 texture UV [0,1].\n    v_uv        = a_pos * 0.5 + 0.5;\n    gl_Position = vec4(a_pos, 0.0, 1.0);\n}";

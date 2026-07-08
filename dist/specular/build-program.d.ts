/*!
 * Liquid Glass PRO · v4.1.0 — specular/build-program (§15.1)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
/**
 * Compiles and links a WebGL2 shader program.
 * Identical helper to §6's _buildProgram; duplicated here so §15 is
 * self-contained (no runtime dependency on §6's private symbols).
 *
 * @param {WebGL2RenderingContext} gl
 * @param {string} vs  Vertex shader GLSL
 * @param {string} fs  Fragment shader GLSL
 * @returns {WebGLProgram}
 */
export declare function _buildSpecProgram(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram;

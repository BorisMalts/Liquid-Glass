/*!
 * Liquid Glass PRO · v4.1.0 — webgl/build-program (§6.1)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _compileShader } from './compile-shader.js';
/**
 * Creates, links, and validates a WebGL2 program from separate vertex and
 * fragment shader sources.  Returns the linked WebGLProgram handle.
 * Throws on link failure so the caller can degrade gracefully.
 *
 * @param {WebGL2RenderingContext} gl - Active WebGL2 context.
 * @param {string}                 vs - Vertex shader GLSL source.
 * @param {string}                 fs - Fragment shader GLSL source.
 * @returns {WebGLProgram}
 * @throws {Error} If linking fails.
 */
export function _buildProgram(gl, vs, fs) {
    const p = gl.createProgram();
    gl.attachShader(p, _compileShader(gl, gl.VERTEX_SHADER, vs));
    gl.attachShader(p, _compileShader(gl, gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
        throw new Error(`LG-PRO link:\n${gl.getProgramInfoLog(p)}`);
    }
    return p;
}

/*!
 * Liquid Glass PRO · v4.1.0 — specular/build-program (§15.1)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
// ─────────────────────────────────────────────────────────────────────────────
// §15.1  WebGL2 initialisation for the specular pass
// ─────────────────────────────────────────────────────────────────────────────
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
export function _buildSpecProgram(gl, vs, fs) {
    function compile(type, src) {
        const sh = gl.createShader(type);
        gl.shaderSource(sh, src);
        gl.compileShader(sh);
        if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
            const log = gl.getShaderInfoLog(sh);
            gl.deleteShader(sh);
            throw new Error(`LG-PRO §15 shader:\n${log}`);
        }
        return sh;
    }
    const prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
        throw new Error(`LG-PRO §15 link:\n${gl.getProgramInfoLog(prog)}`);
    return prog;
}

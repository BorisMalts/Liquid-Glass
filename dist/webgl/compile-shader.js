/*!
 * Liquid Glass PRO · v4.1.0 — webgl/compile-shader (§6.1)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
// ─────────────────────────────────────────────────────────────────────────────
// §6.1  WebGL2 helper functions
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Compiles a single GLSL shader stage and returns the WebGLShader handle.
 * Throws a descriptive error on compilation failure so the caller can
 * fall through to the CSS-only rendering path.
 *
 * @param {WebGL2RenderingContext} gl   - Active WebGL2 context.
 * @param {number}                 type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER.
 * @param {string}                 src  - GLSL source string.
 * @returns {WebGLShader}
 * @throws {Error} If compilation fails (includes driver info log).
 */
export function _compileShader(gl, type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(sh);
        gl.deleteShader(sh);
        throw new Error(`LG-PRO shader compile:\n${log}`);
    }
    return sh;
}

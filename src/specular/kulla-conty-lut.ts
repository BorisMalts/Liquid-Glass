/*!
 * Liquid Glass PRO · v4.1.0 — specular/kulla-conty-lut (§15.1 — E_avg LUT)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */


/**
 * Precomputes the Kulla-Conty E_avg LUT into a 1D 256-texel RGBA texture
 * stored in TEXTURE_UNIT2 (units 0 and 1 are reserved by §6).
 *
 * The LUT stores E_avg(α) in the R channel for 256 uniformly spaced roughness
 * values α ∈ [0, 1].  The G channel stores a precomputed dE/dα derivative
 * for smooth interpolation in the shader (currently unused but available).
 *
 * @param {WebGL2RenderingContext} gl
 * @returns {WebGLTexture}
 */
export function _buildKullaContyLUT(gl: WebGL2RenderingContext): WebGLTexture {
    const N    = 256;
    const data = new Float32Array(N * 4);

    for (let i = 0; i < N; i++) {
        const alpha = i / (N - 1);
        const eavg  = 1.0 - 0.2734 * alpha - 0.4694 * alpha * alpha;
        // E_avg, dE/dα, 0, 1
        data[i * 4 + 0] = Math.max(0, Math.min(1, eavg));
        data[i * 4 + 1] = -(0.2734 + 2.0 * 0.4694 * alpha);  // derivative
        data[i * 4 + 2] = 0;
        data[i * 4 + 3] = 1;
    }

    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(
        gl.TEXTURE_2D, 0, gl.RGBA32F,
        N, 1, 0,
        gl.RGBA, gl.FLOAT, data
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    return tex;
}

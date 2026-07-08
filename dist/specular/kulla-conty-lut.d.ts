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
export declare function _buildKullaContyLUT(gl: WebGL2RenderingContext): WebGLTexture;

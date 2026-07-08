/*!
 * Liquid Glass PRO · v4.1.0 — specular/render (§15.3 — renderSpecularGL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _spec } from './state.js';
import {
    GLASS_IOR,
    FILM_THICKNESS,
    FILM_IOR,
    BASE_ROUGHNESS,
    ANISOTROPY,
} from '../constants/specular.js';
import type { ElementState, LGOptions } from '../types/typedefs.js';


// ─────────────────────────────────────────────────────────────────────────────
// §15.3  Per-frame specular render
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Renders one frame of the Cook-Torrance specular pass for a single element.
 * Called from the rAF loop in §11 immediately after _renderCausticsGL().
 *
 * All physically-based calculations live exclusively in the GLSL shader;
 * this function's sole responsibility is uploading per-frame uniforms and
 * blitting the result into the element's specular canvas.
 *
 * @param {object} es   - ElementState from §10 (springs, domRect, etc.)
 * @param {CanvasRenderingContext2D} specCtx  - 2D context of specular canvas
 * @param {number} now  - rAF timestamp in milliseconds
 * @param {object} opts - Live _opts from §1 (ior, etc.)
 */
export function renderSpecularGL(es: ElementState, specCtx: CanvasRenderingContext2D, now: number, opts: LGOptions) {
    const gl  = _spec.gl;
    const uni = _spec.uniforms;
    const cvs = _spec.canvas;
    if (!gl || !_spec.program || !cvs) return;

    const w = es.width;
    const h = es.height;
    if (w < 1 || h < 1) return;

    // Resize shared specular GL canvas to match element
    if (cvs.width !== w || cvs.height !== h) {
        cvs.width  = w;
        cvs.height = h;
        gl.viewport(0, 0, w, h);
    }

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const t = (now - _spec.startTime) * 0.001;

    // Upload all per-frame uniforms
    gl.uniform1f(uni.u_time,       t);
    gl.uniform2f(uni.u_mouse,      es.springX.value, es.springY.value);
    gl.uniform1f(uni.u_hover,      es.hoverSpring.value);
    gl.uniform2f(uni.u_tilt,       es.tiltX.value, es.tiltY.value);
    gl.uniform2f(uni.u_res,        w, h);
    gl.uniform1f(uni.u_ior,        opts.ior ?? GLASS_IOR);
    gl.uniform1f(uni.u_roughness,  BASE_ROUGHNESS);
    gl.uniform1f(uni.u_anisotropy, ANISOTROPY);
    gl.uniform1f(uni.u_filmThick,  FILM_THICKNESS);
    gl.uniform1f(uni.u_filmIOR,    FILM_IOR);

    // Bind Kulla-Conty LUT
    gl.activeTexture(gl.TEXTURE2);
    gl.bindTexture(gl.TEXTURE_2D, _spec.lut);

    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // Blit to element's specular canvas
    specCtx.clearRect(0, 0, w, h);
    specCtx.drawImage(cvs, 0, 0);
}

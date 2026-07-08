/*!
 * Liquid Glass PRO · v4.1.0 — webgl/render-caustics (§6.1 — per-frame caustic pass)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _state } from '../state/runtime.js';
import { _opts } from '../state/options.js';
import { GLASS_VARIANTS } from '../variants/glass-variants.js';
/**
 * Renders one frame of the caustic + refraction effect for a single glass
 * element using the shared WebGL2 context.
 *
 * Procedure:
 *  1. Resize the shared GL canvas to match the current element's physical
 *     pixel dimensions (avoids per-element GL contexts).
 *  2. Upload all per-frame uniforms (time, mouse, tilt, element position, etc.).
 *  3. Bind the background texture to TEXTURE_UNIT1.
 *  4. Execute the fullscreen-triangle draw call.
 *  5. Blit the GL canvas into the element's dedicated 2D caustic canvas via
 *     drawImage() — this is the only cross-context transfer per frame.
 *
 * @param {ElementState} es  - Per-element state.
 * @param {number}       now - Current timestamp from requestAnimationFrame.
 */
export function _renderCausticsGL(es, now) {
    const gl = _state.glBackend;
    const uni = _state.glUniforms;
    const glCanvas = _state.glCanvas;
    if (!gl || !_state.glProgram || !glCanvas)
        return;
    const w = es.width;
    const h = es.height;
    if (w < 1 || h < 1)
        return;
    // ── Resize shared GL canvas to match this element ─────────────────────────
    // Avoid unnecessary framebuffer reallocations by checking dimensions first.
    if (glCanvas.width !== w || glCanvas.height !== h) {
        glCanvas.width = w;
        glCanvas.height = h;
        gl.viewport(0, 0, w, h);
    }
    // ── Clear ─────────────────────────────────────────────────────────────────
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // ── Time ──────────────────────────────────────────────────────────────────
    const t = (now - _state.glStartTime) * 0.001; // Convert ms → seconds
    // ── Viewport dimensions for aspect-ratio and UV mapping ───────────────────
    const sw = window.innerWidth;
    const sh = window.innerHeight;
    // Use cached domRect; it is refreshed every 4 frames in the rAF loop
    // to avoid per-frame getBoundingClientRect() layout thrashing.
    const rect = es.domRect || {
        left: 0, top: 0,
        width: w / es.dpr, height: h / es.dpr,
    };
    // ── Screen-space element position and size ────────────────────────────────
    // Normalised to [0,1] viewport space for the refraction UV mapping pass.
    const ex = rect.left / sw; // Left edge fraction
    const ey = rect.top / sh; // Top edge fraction
    const ew = rect.width / sw; // Width fraction
    const eh = rect.height / sh; // Height fraction
    // ── Scroll drift compensation ─────────────────────────────────────────────
    // Amount the page has scrolled since the last background capture,
    // normalised to viewport dimensions.  Passed to the shader as u_scroll
    // so the background sample UV is offset accordingly.
    const sdx = (window.scrollX - _state.bgScrollX) / sw;
    const sdy = (window.scrollY - _state.bgScrollY) / sh;
    // ── Upload uniforms ───────────────────────────────────────────────────────
    gl.uniform1f(uni.u_time, t);
    gl.uniform2f(uni.u_mouse, es.springX.value, es.springY.value);
    gl.uniform1f(uni.u_hover, es.hoverSpring.value);
    gl.uniform2f(uni.u_tilt, es.tiltX.value, es.tiltY.value);
    gl.uniform2f(uni.u_res, w, h);
    gl.uniform2f(uni.u_elementPos, ex, ey);
    gl.uniform2f(uni.u_elementSize, ew, eh);
    gl.uniform1f(uni.u_ior, _opts.ior);
    gl.uniform1f(uni.u_refractStr, _opts.refractionStrength);
    gl.uniform1f(uni.u_bgReady, _state.bgReady ? 1.0 : 0.0);
    gl.uniform2f(uni.u_scroll, sdx, sdy);
    // Resolve glassType string → numeric index for the GLSL uniform.
    // The shader uses a float uniform because WebGL2 integer uniforms
    // require explicit flat interpolation in the vertex stage — a float
    // with integer values is simpler and equally performant here.
    const GLASS_TYPE_MAP = { BK7: 0, SF11: 1, NK51A: 2, NBK10: 3, F2: 4 };
    const glassTypeIndex = typeof _opts.glassType === 'string'
        ? (GLASS_TYPE_MAP[_opts.glassType] ?? 0) // named string → index
        : Math.floor(_opts.glassType) % 5; // numeric → clamp to valid range
    gl.uniform1f(uni.u_glassType, glassTypeIndex);
    // ── Bind background texture to unit 1 ─────────────────────────────────────
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, _state.bgTexture);
    // ── v4.1.0 glass variant upload ───────────────────────────────────────────
    const variantKey = typeof _opts.glassVariant === 'string' ? _opts.glassVariant : 'clear';
    const vd = GLASS_VARIANTS[variantKey] ?? GLASS_VARIANTS.clear;
    gl.uniform3f(uni.u_tintRGB, vd.tintRGB[0], vd.tintRGB[1], vd.tintRGB[2]);
    gl.uniform1f(uni.u_tintStrength, vd.tintStrength);
    gl.uniform1f(uni.u_frostedAmount, vd.frosted);
    gl.uniform1f(uni.u_mirrorStrength, vd.mirror);
    gl.uniform1f(uni.u_smokeDensity, vd.smokeDensity);
    gl.uniform1f(uni.u_causticScale, vd.causticScale);
    gl.uniform3f(uni.u_causticTint, vd.causticTint[0], vd.causticTint[1], vd.causticTint[2]);
    // ── Draw fullscreen triangle ──────────────────────────────────────────────
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    // ── Blit GL output → element's 2D caustic canvas ─────────────────────────
    // This is the transfer step that moves the WebGL render result into the
    // CSS-composited canvas overlay on the glass element.
    es.ctx2d.clearRect(0, 0, w, h);
    es.ctx2d.drawImage(glCanvas, 0, 0);
}

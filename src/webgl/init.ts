/*!
 * Liquid Glass PRO · v4.1.0 — webgl/init (§6.1 — shared WebGL2 context bootstrap)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _state } from '../state/runtime.js';
import { _buildProgram } from './build-program.js';
import { _VERT_SRC } from './shaders/vertex.glsl.js';
import { _FRAG_SRC } from './shaders/fragment/index.js';
import { _startBackgroundCapture } from '../background/start.js';

/**
 * Creates and initialises the single shared WebGL2 context used by all glass
 * elements.  Called lazily on the first call to _attach() that qualifies for
 * WebGL rendering.
 *
 * Steps:
 *  1. Create a hidden 0×0 <canvas> and request a WebGL2 context.
 *  2. Compile and link the vertex + fragment shader program.
 *  3. Upload a fullscreen-triangle VBO (3 vertices, no index buffer).
 *  4. Enable premultiplied-alpha blending.
 *  5. Cache all uniform locations (including v2 background uniforms).
 *  6. Pre-bind the background sampler to texture unit 1.
 *  7. Launch the background capture subsystem.
 *
 * Returns true on success, false on any failure (GL unavailable, compile
 * error, etc.).  On failure the hidden canvas is removed so no resources leak.
 *
 * @returns {boolean} True if WebGL2 was successfully initialised.
 */
export function _initWebGL() {
    // Idempotent — return immediately if already initialised.
    if (_state.glBackend) return true;

    // The GL canvas is kept off-screen; its dimensions are resized per-element
    // before each draw call.  The fixed CSS size of 0×0 prevents it from
    // affecting page layout.
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = [
        'position:fixed',
        'width:0',
        'height:0',
        'pointer-events:none',
        'opacity:0',
        'z-index:-99999',
    ].join(';');
    document.body.appendChild(canvas);

    // Request WebGL2 with premultiplied alpha blending mode to match the
    // fragment shader output convention (col * alpha → premultiplied).
    // preserveDrawingBuffer: true is required so we can read the pixels back
    // via drawImage() after the draw call completes.
    const gl = canvas.getContext('webgl2', {
        alpha:                true,
        premultipliedAlpha:   true,
        antialias:            false,   // Not needed; caustics are inherently soft
        depth:                false,   // No depth testing — fullscreen triangle only
        stencil:              false,
        preserveDrawingBuffer: true,
    });

    if (!gl) {
        canvas.remove();
        return false;
    }

    try {
        // ── Shader program ────────────────────────────────────────────────────
        const prog = _buildProgram(gl, _VERT_SRC, _FRAG_SRC);

        // ── Fullscreen triangle VBO ───────────────────────────────────────────
        // Three vertices in clip-space that form a triangle covering the full
        // viewport when rasterized.  The third vertex at (3,−1) and fourth at
        // (−1,3) extend beyond the clip frustum but are harmlessly discarded
        // after clipping, while the interior perfectly covers [−1,1]².
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1,   3, -1,   -1, 3]),
            gl.STATIC_DRAW
        );

        gl.useProgram(prog);

        // Bind the a_pos attribute to the VBO
        const aPos = gl.getAttribLocation(prog, 'a_pos');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        // ── Blending ──────────────────────────────────────────────────────────
        // ONE, ONE_MINUS_SRC_ALPHA: standard premultiplied-alpha over blend.
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        // ── Uniform location cache ────────────────────────────────────────────
        // Calling getUniformLocation() every frame would be expensive; cache
        // all locations once here.  Includes both v1.1.1 and v2.0.0 uniforms.
        const uNames = [
            // Core timing & interaction
            'u_time',
            'u_mouse',
            'u_hover',
            'u_tilt',
            'u_res',
            // v2.0.0 background refraction
            'u_background',
            'u_bgRes',
            'u_elementPos',
            'u_elementSize',
            'u_ior',
            'u_refractStr',
            'u_bgReady',
            'u_scroll',
            // v3.1.0 glass material type
            // 0 = BK7  borosilicate crown  (default, moderate dispersion)
            // 1 = SF11 heavy flint         (high dispersion, prismatic)
            // 2 = N-FK51A fluorite crown   (low dispersion, apochromat)
            // 3 = N-BK10 thin crown        (low-index, window glass)
            // 4 = F2 flint                 (medium-high dispersion)
            'u_glassType',
            // §v4.1 glass variant uniforms
            'u_tintRGB',
            'u_tintStrength',
            'u_frostedAmount',
            'u_mirrorStrength',
            'u_smokeDensity',
            'u_causticScale',
            'u_causticTint',
        ];

        const uni: Record<string, WebGLUniformLocation | null> = {};
        uNames.forEach(n => { uni[n] = gl.getUniformLocation(prog, n); });

        // ── Bind background sampler to texture unit 1 ─────────────────────────
        // This only needs to be set once because the sampler-to-unit binding
        // is part of program state and survives gl.useProgram() calls.
        gl.useProgram(prog);
        gl.uniform1i(uni.u_background, 1);

        // ── Persist shared state ──────────────────────────────────────────────
        _state.glCanvas    = canvas;
        _state.glBackend   = gl;
        _state.glProgram   = prog;
        _state.glUniforms  = uni;
        _state.glBuffer    = buf;
        _state.glStartTime = performance.now();

        // ── Background capture subsystem ──────────────────────────────────────
        // Must be started after the GL context is ready because _startBackgroundCapture()
        // calls gl.createTexture() and uploads to TEXTURE_UNIT1.
        _startBackgroundCapture();

        return true;

    } catch (err) {
        // Shader compile / link error or context loss — degrade to CSS.
        console.warn('LG-PRO: WebGL2 init failed — CSS fallback active.\n', err);
        canvas.remove();
        return false;
    }
}

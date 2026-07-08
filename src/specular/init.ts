/*!
 * Liquid Glass PRO · v4.1.0 — specular/init (§15.1 — initSpecularPass)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _spec } from './state.js';
import { _buildSpecProgram } from './build-program.js';
import { _buildKullaContyLUT } from './kulla-conty-lut.js';
import { _VERT_SRC } from '../webgl/shaders/vertex.glsl.js';
import { _SPEC_FRAG_SRC } from './shaders/fragment/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// §15  Specular highlight system — full Cook-Torrance PBR
//
//  Replaces the CSS radial-gradient approximation with a physically-grounded
//  WebGL2 specular pass rendered into a dedicated per-element canvas layer,
//  composited above the caustic canvas (z-index 4.5) via screen blend mode.
//
//  Physics implemented here (all per-pixel, no approximations):
//
//  D  — GGX / Trowbridge-Reitz Normal Distribution Function
//         D(h) = α² / (π · (NdotH²(α²−1) + 1)²)
//         Controls the shape and spread of the specular lobe.
//         α = roughness², re-parameterised for perceptual linearity.
//
//  F  — Schlick Fresnel with F0 derivation from IOR
//         F0 = ((n−1)/(n+1))²   for air/glass interface
//         F(v,h) = F0 + (1−F0)·(1−VdotH)⁵
//         Models how reflectance increases at grazing angles.
//
//  G  — Smith GGX Height-Correlated Visibility (Heitz 2014)
//         More accurate than uncorrelated Smith; prevents over-darkening
//         at grazing angles which is an artefact of the uncorrelated form.
//         V(l,v,h) = 0.5 / (NdotL·√(NdotV²(1−a²)+a²) +
//                            NdotV·√(NdotL²(1−a²)+a²))
//
//  Anisotropic extension — Burley 2012 / Disney BRDF
//         Separate αT (tangent) and αB (bitangent) roughness values
//         derived from a scalar anisotropy ∈ [0,1].
//         D_aniso(h) = 1 / (π·αT·αB·(HdotT²/αT²+HdotB²/αB²+NdotH²)²)
//         G_aniso uses per-axis Λ functions — no simplification.
//         Driven by a slowly drifting tangent field from the noise normal map.
//
//  Energy conservation — Kulla-Conty multi-bounce term (2017)
//         Single-scattering BRDFs lose energy at high roughness because they
//         ignore inter-microfacet bounces.  The Kulla-Conty E(μ) LUT adds
//         back the "missing energy" term:
//         f_ms = (1−E(NdotV))·(1−E(NdotL)) / (π·(1−E_avg))
//         Approximated analytically (no texture lookup required).
//
//  Multiple light sources
//         Three virtual lights contribute to the BRDF sum:
//           L0  — primary cursor-tracking directional light (warm white)
//           L1  — fixed upper-left environment fill light (cool blue-white)
//           L2  — secondary back-scatter light (purple tint, opposite to L0)
//         Each light carries its own colour, intensity, and angular size
//         (area light approximation via representative-point method, Karis 2013).
//
//  Thin-film iridescence (Born & Wolf, 1999)
//         Computes optical path difference in a thin coating of thickness d
//         and index n_film, then evaluates the interference term for RGB
//         wavelengths (λR=680nm, λG=550nm, λB=450nm):
//         I(λ) = cos(2π · n_film · d · cos(θt) / λ)
//         This replaces the CSS conic-gradient approximation in the original §15.
//
//  Import surface from §6:
//         _VERT_SRC     — reuse the same fullscreen-triangle vertex shader
//         surfaceNormal — not directly importable from GLSL; the normal
//                         computation is inlined here with identical math
//                         so the two passes stay visually synchronised.
//
//  Canvas layer
//         Each tracked element gets a second canvas: .lg-specular-canvas
//         Rendered after the caustic pass, blended with mix-blend-mode: screen.
//         Opacity is controlled via CSS transition identical to caustic canvas.
//
//  Performance
//         Shared WebGL2 context (same pattern as caustic pass in §6).
//         Roughness LUT (E_avg for Kulla-Conty) is precomputed once into a
//         1D 256-texel texture at init time to avoid sqrt/pow in the hot path.
//         Draw call is a single fullscreen triangle (3 vertices).
// ─────────────────────────────────────────────────────────────────────────────


/**
 * Initialises the shared WebGL2 context for the specular pass.
 * Separate from §6's _initWebGL() to keep the two passes fully independent.
 * Returns true on success, false on any error.
 *
 * @returns {boolean}
 */
export function initSpecularPass() {
    if (_spec.gl) return true;

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = [
        'position:fixed', 'width:0', 'height:0',
        'pointer-events:none', 'opacity:0', 'z-index:-99998',
    ].join(';');
    document.body.appendChild(canvas);

    const gl = canvas.getContext('webgl2', {
        alpha:                true,
        premultipliedAlpha:   true,
        antialias:            false,
        depth:                false,
        stencil:              false,
        preserveDrawingBuffer: true,
    });

    if (!gl) { canvas.remove(); return false; }

    // EXT_color_buffer_float is required for RGBA32F LUT texture
    if (!gl.getExtension('EXT_color_buffer_float')) {
        console.warn('LG-PRO §15: EXT_color_buffer_float unavailable — LUT fallback active.');
    }

    try {
        const prog = _buildSpecProgram(gl, _VERT_SRC, _SPEC_FRAG_SRC);

        // Fullscreen triangle VBO (identical to §6)
        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 3, -1, -1, 3]),
            gl.STATIC_DRAW
        );

        gl.useProgram(prog);
        const aPos = gl.getAttribLocation(prog, 'a_pos');
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        // Cache uniform locations
        const uNames = [
            'u_time', 'u_mouse', 'u_hover', 'u_tilt', 'u_res',
            'u_background', 'u_bgRes', 'u_elementPos', 'u_elementSize',
            'u_ior', 'u_refractStr', 'u_bgReady', 'u_scroll',
            'u_glassType',
            // v4.1.0 variant uniforms
            'u_tintRGB', 'u_tintStrength', 'u_frostedAmount',
            'u_mirrorStrength', 'u_smokeDensity', 'u_causticScale', 'u_causticTint',
        ];
        const uni: Record<string, WebGLUniformLocation | null> = {};
        uNames.forEach(n => { uni[n] = gl.getUniformLocation(prog, n); });

        // Bind LUT to TEXTURE_UNIT2
        const lut = _buildKullaContyLUT(gl);
        gl.uniform1i(uni.u_lut, 2);

        _spec.gl        = gl;
        _spec.canvas    = canvas;
        _spec.program   = prog;
        _spec.uniforms  = uni;
        _spec.lut       = lut;
        _spec.startTime = performance.now();

        return true;

    } catch (err) {
        console.warn('LG-PRO §15: specular pass init failed.\n', err);
        canvas.remove();
        return false;
    }
}

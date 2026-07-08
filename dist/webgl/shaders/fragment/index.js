/*!
 * Liquid Glass PRO · v4.1.0 — webgl/shaders/fragment (§6.0 — caustics fragment shader assembly)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { FRAG_PRELUDE } from './00-prelude.glsl.js';
import { FRAG_HASH } from './01-hash.glsl.js';
import { FRAG_GRADIENT_NOISE } from './02-gradient-noise.glsl.js';
import { FRAG_SELLMEIER } from './03-sellmeier.glsl.js';
import { FRAG_VORONOI_CAUSTICS } from './04-voronoi-caustics.glsl.js';
import { FRAG_SURFACE_NORMAL } from './05-surface-normal.glsl.js';
import { FRAG_REFRACT_UV } from './06-refract-uv.glsl.js';
import { FRAG_BACKGROUND_SAMPLING } from './07-background-sampling.glsl.js';
import { FRAG_FRESNEL } from './08-fresnel.glsl.js';
import { FRAG_ENV_REFLECTION } from './09-environment-reflection.glsl.js';
import { FRAG_BEER_LAMBERT } from './10-beer-lambert.glsl.js';
import { FRAG_FROSTED_SCATTER } from './11-frosted-scatter.glsl.js';
import { FRAG_MAIN } from './12-main.glsl.js';
// ─────────────────────────────────────────────────────────────────────────────
// §6  WebGL2 caustics + refraction render engine
//
//  Shader architecture
//  ───────────────────
//  A single fullscreen triangle is rasterized (3 vertices → 1 draw call),
//  covering the entire canvas.  The fragment shader is responsible for:
//
//  1. surfaceNormal(uv)
//     Derives a perturbed surface normal from animated gradient noise.
//     The normal encodes spatially-varying glass thickness, producing the
//     characteristic "swimming" distortion of real glass.
//
//  2. chromaticRefraction(uv, N)
//     Samples u_background three times — once per colour channel — at UV
//     coordinates displaced according to Snell's law but with slightly
//     different IOR per channel (Cauchy dispersion).  This is the core
//     "real" refraction feature introduced in v2.0.0.
//
//  3. environmentReflection(uv, N, fresnelFactor)
//     At grazing angles (high Fresnel factor) the background is sampled at
//     a horizontally mirrored UV, approximating a planar reflection probe.
//
//  4. caustic(uv)
//     Multi-layer animated Voronoi distance field produces the underwater
//     caustic light-beam pattern.  Four octaves at different scales and speeds.
//
//  5. Composition pass
//     Caustics + chromatic refraction + specular + Fresnel edge glow +
//     iridescence + prismatic edges + surface wave noise are additively
//     blended, then multiplied by a vignette mask.
//
//  Coordinate systems
//  ──────────────────
//  v_uv          0..1 in element local space (origin = top-left)
//  screenUV      0..1 in viewport space; computed as:
//                  elementPos + v_uv * elementSize
//  refractedUV   screenUV displaced by Snell delta + IOR dispersion delta
//  bgUV          = refractedUV, looked up in u_background (viewport-space)
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Fragment shader source.
 *
 * Full GLSL 300 es implementation of the Liquid Glass PRO visual layer.
 * See §6 module comment for a detailed description of each functional block.
 *
 * Uniform layout:
 *   u_time         float     Seconds since GL context creation.
 *   u_mouse        vec2      Spring-smoothed cursor position in element UV space.
 *   u_hover        float     Spring-smoothed hover intensity (0–1).
 *   u_tilt         vec2      Spring-smoothed tilt angles (−1 to +1 per axis).
 *   u_res          vec2      Physical canvas dimensions in pixels.
 *   u_background   sampler2D html2canvas background texture (unit 1).
 *   u_bgRes        vec2      Background texture pixel dimensions (reserved).
 *   u_elementPos   vec2      Element top-left corner in normalised screen space (0..1).
 *   u_elementSize  vec2      Element dimensions as fraction of viewport.
 *   u_ior          float     Index of refraction.
 *   u_refractStr   float     UV displacement scale for refraction.
 *   u_bgReady      float     1.0 if background texture contains valid data, 0.0 otherwise.
 *   u_scroll       vec2      Scroll drift since last capture, normalised to screen size.
 *   u_glassType    float     Sellmeier glass material selector (0–4).
 *
 * @type {string}
 */
export const _FRAG_SRC = [
    FRAG_PRELUDE,
    FRAG_HASH,
    FRAG_GRADIENT_NOISE,
    FRAG_SELLMEIER,
    FRAG_VORONOI_CAUSTICS,
    FRAG_SURFACE_NORMAL,
    FRAG_REFRACT_UV,
    FRAG_BACKGROUND_SAMPLING,
    FRAG_FRESNEL,
    FRAG_ENV_REFLECTION,
    FRAG_BEER_LAMBERT,
    FRAG_FROSTED_SCATTER,
    FRAG_MAIN,
].join('\n');

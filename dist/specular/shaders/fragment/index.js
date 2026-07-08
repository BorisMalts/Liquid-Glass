/*!
 * Liquid Glass PRO · v4.1.0 — specular/shaders/fragment (§15.1 — Cook-Torrance shader assembly)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { SPEC_PRELUDE } from './00-prelude.glsl.js';
import { SPEC_UTILITY } from './01-utility.glsl.js';
import { SPEC_SURFACE_FRAME } from './02-surface-frame.glsl.js';
import { SPEC_GGX_NDF } from './03-ggx-ndf.glsl.js';
import { SPEC_GGX_ANISO } from './04-ggx-aniso.glsl.js';
import { SPEC_FRESNEL } from './05-fresnel.glsl.js';
import { SPEC_SMITH_VISIBILITY } from './06-smith-visibility.glsl.js';
import { SPEC_SMITH_ANISO } from './07-smith-aniso.glsl.js';
import { SPEC_KULLA_CONTY } from './08-kulla-conty.glsl.js';
import { SPEC_THIN_FILM } from './09-thin-film.glsl.js';
import { SPEC_AREA_LIGHT } from './10-area-light.glsl.js';
import { SPEC_COOK_TORRANCE } from './11-cook-torrance.glsl.js';
import { SPEC_LIGHTS } from './12-lights.glsl.js';
import { SPEC_VIGNETTE } from './13-vignette.glsl.js';
import { SPEC_MAIN } from './14-main.glsl.js';
// ─────────────────────────────────────────────────────────────────────────────
// §15.1  Fragment shader — full Cook-Torrance + anisotropic + Kulla-Conty
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Fragment shader source for the specular pass.
 *
 * Coordinate conventions (match §6 exactly for visual synchronisation):
 *   v_uv          — element-local UV [0,1], top-left origin
 *   N             — view-space surface normal from animated noise bump map
 *   V             — view direction, fixed at (0,0,1) (orthographic camera)
 *   L_i           — light direction vectors in view space
 *   H_i           — half-vectors between V and each L_i
 *
 * Tangent frame construction:
 *   T  — tangent vector, perpendicular to N, aligned with noise gradient
 *   B  — bitangent = cross(N, T), completing the orthonormal frame
 *
 * @type {string}
 */
export const _SPEC_FRAG_SRC = [
    SPEC_PRELUDE,
    SPEC_UTILITY,
    SPEC_SURFACE_FRAME,
    SPEC_GGX_NDF,
    SPEC_GGX_ANISO,
    SPEC_FRESNEL,
    SPEC_SMITH_VISIBILITY,
    SPEC_SMITH_ANISO,
    SPEC_KULLA_CONTY,
    SPEC_THIN_FILM,
    SPEC_AREA_LIGHT,
    SPEC_COOK_TORRANCE,
    SPEC_LIGHTS,
    SPEC_VIGNETTE,
    SPEC_MAIN,
].join('\n');

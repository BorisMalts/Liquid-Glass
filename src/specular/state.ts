/*!
 * Liquid Glass PRO · v4.1.0 — specular/state (§15.0)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import type { SpecState } from '../types/typedefs.js';

/** Singleton specular GL state — separate from §6 caustic GL state. */
export const _spec: SpecState = {
    gl:         null,   // WebGL2RenderingContext
    canvas:     null,   // hidden off-screen source canvas
    program:    null,   // compiled specular program
    uniforms:   {},     // cached uniform locations
    lut:        null,   // WebGLTexture — Kulla-Conty E_avg LUT
    startTime:  0,
};

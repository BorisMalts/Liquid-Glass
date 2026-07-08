/*!
 * Liquid Glass PRO · v4.1.0 — specular/destroy (§15.5 — destroySpecularPass)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _spec } from './state.js';


// ─────────────────────────────────────────────────────────────────────────────
// §15.5  Teardown
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Destroys the specular WebGL context and frees all GPU resources.
 * Call from destroyLiquidGlass() in §13 after the caustic teardown.
 */
export function destroySpecularPass() {
    if (!_spec.gl) return;

    const gl = _spec.gl;
    gl.deleteTexture(_spec.lut);
    gl.deleteProgram(_spec.program);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    _spec.canvas?.remove();

    _spec.gl       = null;
    _spec.canvas   = null;
    _spec.program  = null;
    _spec.uniforms = {};
    _spec.lut      = null;
    _spec.startTime = 0;
}

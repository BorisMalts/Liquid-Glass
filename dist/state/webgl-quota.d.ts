/*!
 * Liquid Glass PRO · v4.1.0 — state/webgl-quota (§1 — shared WebGL element counter)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
/**
 * Count of elements currently using the shared WebGL context.
 * Compared against MAX_WEBGL_ELEMENTS in _attach() to enforce the hard cap.
 * Held in an object so the counter can be mutated from _attach() / _detach()
 * / destroyLiquidGlass() across module boundaries.
 */
export declare const _webglQuota: {
    active: number;
};

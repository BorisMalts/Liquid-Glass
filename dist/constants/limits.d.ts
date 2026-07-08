/*!
 * Liquid Glass PRO · v4.1.0 — constants/limits (§1)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
/**
 * Hard limit on the number of elements that will receive WebGL caustics.
 * Elements beyond this count fall back to the CSS-only visual layer.
 * Prevents context memory exhaustion on lower-end devices.
 */
export declare const MAX_WEBGL_ELEMENTS = 32;
/**
 * Maximum physics delta-time cap in seconds.
 * Prevents the spring integrator from exploding when the tab is hidden and
 * then restored, which would produce a single enormous dt.
 */
export declare const MAX_DT = 0.05;

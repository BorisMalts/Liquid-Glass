/*!
 * Liquid Glass PRO · v4.1.0 — specular/attach-canvas (§15.2)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
// ─────────────────────────────────────────────────────────────────────────────
// §15.2  Per-element specular canvas attachment
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Attaches a dedicated specular canvas to a glass element.
 * Called after the caustic canvas is attached in §10's _attach().
 *
 * The specular canvas sits at z-index 4.5 (above caustics at 4,
 * below content at 5).  The fractional z-index is achieved by inserting
 * the canvas immediately after the caustic canvas in the DOM — the
 * stacking order is determined by DOM order for equal z-index.
 *
 * @param {HTMLElement}             el     - The .lg element
 * @param {HTMLCanvasElement}       causticCanvas  - From §10 (used for insertion point)
 * @returns {CanvasRenderingContext2D|null}
 */
export function attachSpecularCanvas(el, causticCanvas) {
    const cvs = document.createElement('canvas');
    cvs.className = 'lg-specular-canvas';
    // MAX_CANVAS guards against browser limits: width * height > 268435456
    // (16384²) causes the canvas to silently fail on Safari and Chrome.
    const MAX_CANVAS = 4096;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = el.getBoundingClientRect();
    cvs.width = Math.min(Math.round(rect.width * dpr) || 1, MAX_CANVAS);
    cvs.height = Math.min(Math.round(rect.height * dpr) || 1, MAX_CANVAS);
    // Insert directly after caustic canvas (DOM-order compositing)
    causticCanvas.insertAdjacentElement('afterend', cvs);
    return cvs.getContext('2d', { alpha: true, willReadFrequently: false });
}

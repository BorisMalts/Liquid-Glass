/*!
 * Liquid Glass PRO · v4.1.0 — specular/attach-canvas (§15.2)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
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
export declare function attachSpecularCanvas(el: HTMLElement, causticCanvas: HTMLCanvasElement): CanvasRenderingContext2D | null;

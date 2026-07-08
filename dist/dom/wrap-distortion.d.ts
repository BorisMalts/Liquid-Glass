/*!
 * Liquid Glass PRO · v4.1.0 — dom/wrap-distortion (§13)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
/**
 * Wraps an existing DOM element in a .lg-outer chromatic-aberration container.
 *
 * The wrapper is inserted at the element's current position in the DOM tree.
 * The element's original display mode (block / flex / grid) is preserved via
 * a modifier class added to the wrapper.
 *
 * @param {HTMLElement} el - The element to wrap.
 * @returns {{ wrapper: HTMLElement, unwrap: () => void }}
 *   wrapper — the newly created .lg-outer element
 *   unwrap  — restores the original DOM structure and removes the wrapper
 *
 * @example
 * const { wrapper, unwrap } = wrapWithDistortion(myCard);
 * // Later:
 * unwrap();
 */
export declare function wrapWithDistortion(el: HTMLElement): {
    wrapper: HTMLDivElement & {
        className: string;
    };
    /**
     * Removes the wrapper and restores the original DOM position of el.
     * Safe to call multiple times (checks wrapper.isConnected first).
     */
    unwrap(): void;
};

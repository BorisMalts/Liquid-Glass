/**
 * Manually attaches the glass effect to an element outside the automatic
 * selector scanning.  Useful for Shadow DOM components or dynamically
 * created elements in frameworks that render outside <body>.
 *
 * Requires initLiquidGlass() to have been called first.
 *
 * @param {HTMLElement} el - Element to attach to (must be in the DOM).
 */
export declare function attachElement(el: HTMLElement): void;
/**
 * Manually detaches the glass effect from an element.
 * Safe to call even if the element was never attached (returns immediately).
 *
 * @param {HTMLElement} el - Element to detach from.
 */
export declare function detachElement(el: HTMLElement): void;

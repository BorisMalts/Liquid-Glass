/**
 * Stores ElementState objects keyed by their .lg HTMLElement.
 * WeakMap is used deliberately — when the DOM element is garbage-collected
 * (e.g. after a SPA route change) the entry is automatically reclaimed,
 * preventing memory leaks even if _detach() is never called.
 *
 * @type {WeakMap<HTMLElement, ElementState>}
 */
export const _elements = new WeakMap();
/**
 * Strong-reference set of all currently tracked elements.
 * Required because WeakMap is not iterable; _tracked is iterated each rAF frame.
 * Must be kept in sync with _elements (both updated in _attach / _detach).
 *
 * @type {Set<HTMLElement>}
 */
export const _tracked = new Set();
/**
 * Set of .lg elements currently intersecting the viewport.
 * Maintained in real time by the IntersectionObserver created in
 * _startObserver() (_io).  Elements absent from this set are skipped
 * entirely in the WebGL render block of _rafLoop(), eliminating GPU
 * work for off-screen glass.
 *
 * Kept in sync with _tracked via:
 *   _attach()  → _io.observe(el)   adds el when it enters viewport
 *   _detach()  → _io.unobserve(el) + _visibleElements.delete(el)
 *
 * @type {Set<HTMLElement>}
 */
export const _visibleElements = new Set();

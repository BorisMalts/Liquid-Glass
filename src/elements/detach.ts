/*!
 * Liquid Glass PRO · v4.1.0 — elements/detach (§10)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _elements, _tracked, _visibleElements } from '../state/registry.js';
import { _webglQuota } from '../state/webgl-quota.js';
import { _ioRef } from '../state/viewport-observer.js';

/**
 * Detaches the Liquid Glass effect from an element, restoring it to its
 * natural state and freeing all associated resources.
 *
 * @param {HTMLElement} el - The .lg element to detach from.
 */
export function _detach(el: HTMLElement) {
    const es = _elements.get(el);
    if (!es) return;

    // ── Remove event listeners ────────────────────────────────────────────────
    el.removeEventListener('pointermove',  es.pointerMove);
    el.removeEventListener('pointerenter', es.pointerEnter);
    el.removeEventListener('pointerleave', es.pointerLeave);

    // ── Disconnect ResizeObserver ─────────────────────────────────────────────
    es.ro.disconnect();

    // ── Remove injected DOM nodes ─────────────────────────────────────────────
    es.canvas.remove();
    el.querySelector('.lg-grain')?.remove();
    es.specCanvas?.remove();

    // ── Remove CSS custom properties set by the spring system ─────────────────
    ['--lg-mx', '--lg-my', '--lg-tx', '--lg-ty', '--lg-hover', 'transform']
        .forEach(p => el.style.removeProperty(p));

    // ── Decrement WebGL usage counter ─────────────────────────────────────────
    if (el.dataset.lgWebgl) {
        _webglQuota.active = Math.max(0, _webglQuota.active - 1);
        delete el.dataset.lgWebgl;
        delete el.dataset.lgRefract;
    }

    // ── Unregister from IntersectionObserver and visibility set ───────────────
    // Must happen before _tracked.delete() so the rAF loop stops scheduling
    // GL work for this element on the very next frame.
    _ioRef.current?.unobserve(el);
    _visibleElements.delete(el);

    // ── Clean up state records ────────────────────────────────────────────────
    _elements.delete(el);
    _tracked.delete(el);
}

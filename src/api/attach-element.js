/*!
 * Liquid Glass PRO · v4.1.0 — api/attach-element (§13)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _state } from '../state/runtime.js';
import { _attach } from '../elements/attach.js';
import { _detach } from '../elements/detach.js';

/**
 * Manually attaches the glass effect to an element outside the automatic
 * selector scanning.  Useful for Shadow DOM components or dynamically
 * created elements in frameworks that render outside <body>.
 *
 * Requires initLiquidGlass() to have been called first.
 *
 * @param {HTMLElement} el - Element to attach to (must be in the DOM).
 */
export function attachElement(el) {
    if (!_state.ready) {
        console.warn('LG-PRO: call initLiquidGlass() before attachElement().');
        return;
    }
    _attach(el);
}

/**
 * Manually detaches the glass effect from an element.
 * Safe to call even if the element was never attached (returns immediately).
 *
 * @param {HTMLElement} el - Element to detach from.
 */
export function detachElement(el) { _detach(el); }

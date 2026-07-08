/*!
 * Liquid Glass PRO · v4.1.0 — observer/mutation-observer (§12 — automatic element discovery)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _state } from '../state/runtime.js';
import { _opts } from '../state/options.js';
import { _tracked, _visibleElements } from '../state/registry.js';
import { _ioRef } from '../state/viewport-observer.js';
import { _attach } from '../elements/attach.js';
import { _detach } from '../elements/detach.js';

// ─────────────────────────────────────────────────────────────────────────────
// §12  MutationObserver — automatic element discovery
//
//  The MutationObserver watches <body> for childList mutations (subtree:true).
//  When new nodes are added, _attachSubtree() checks if the node matches the
//  selector and attaches to it and any matching descendants.
//  When nodes are removed, _detachSubtree() cleans up matching nodes.
//
//  This enables glass effects on dynamically inserted content (e.g. modals,
//  chat messages, infinite scroll items) without requiring the host app to
//  call attachElement() manually.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Recursively attaches the glass effect to a DOM subtree root and all
 * matching descendants.  Skips non-element nodes (text, comment, etc.).
 *
 * @param {Node} node - Root of the subtree to process.
 */
function _attachSubtree(node: Node) {
    if (!(node instanceof HTMLElement)) return;
    const sel = _opts.selector;
    // Check the root node itself (e.g. a .lg div was directly inserted)
    if (node.matches(sel)) _attach(node);
    // Check all descendants (e.g. a container with .lg children was inserted)
    node.querySelectorAll?.<HTMLElement>(sel).forEach(_attach);
}

/**
 * Recursively detaches the glass effect from a DOM subtree root and all
 * matching descendants.
 *
 * @param {Node} node - Root of the subtree to process.
 */
function _detachSubtree(node: Node) {
    if (!(node instanceof HTMLElement)) return;
    const sel = _opts.selector;
    if (node.matches(sel)) _detach(node);
    node.querySelectorAll?.<HTMLElement>(sel).forEach(_detach);
}

/**
 * Performs an initial DOM scan to attach to existing glass elements, then
 * creates and starts the MutationObserver for dynamic content.
 */
/**
 * Performs an initial DOM scan to attach to existing glass elements, then
 * creates and starts the IntersectionObserver (_io) and MutationObserver
 * for dynamic content.
 */
export function _startObserver() {
    // ── Initial attach: process all pre-existing matching elements ────────────
    // Must run before the observers are created so that _tracked is fully
    // populated by the time the IntersectionObserver loop runs below.
    document.querySelectorAll<HTMLElement>(_opts.selector).forEach(_attach);

    // ── IntersectionObserver — viewport visibility gate ───────────────────────
    // threshold:0 → callback fires the moment any pixel crosses the viewport
    // boundary in either direction.  No rootMargin: we want strict viewport
    // intersection, not a pre-fetch buffer, because the goal is GPU savings.
    _ioRef.current = new IntersectionObserver(entries => {
        for (const e of entries) {
            if (e.isIntersecting) _visibleElements.add(e.target as HTMLElement);
            else                  _visibleElements.delete(e.target as HTMLElement);
        }
    }, { threshold: 0 });

    // Observe all elements that were just attached in the scan above.
    // Elements attached later (via MutationObserver or attachElement()) call
    // _io.observe(el) individually inside _attach().
    for (const el of _tracked) _ioRef.current.observe(el);

    // ── MutationObserver — dynamic content discovery ──────────────────────────
    // childList:true catches direct insertions/removals.
    // subtree:true catches mutations anywhere in the document tree, not just
    // direct children of <body> — necessary for SPA route changes that swap
    // deeply nested content without touching the body directly.
    _state.observer = new MutationObserver(mutations => {
        for (const m of mutations) {
            m.addedNodes.forEach(_attachSubtree);
            m.removedNodes.forEach(_detachSubtree);
        }
    });

    _state.observer.observe(document.body, { childList: true, subtree: true });
}

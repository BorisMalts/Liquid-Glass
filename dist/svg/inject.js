/*!
 * Liquid Glass PRO · v4.1.0 — svg/inject (§7)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _state } from '../state/runtime.js';
import { _buildSVGDefs } from './build-defs.js';
import { _detectGpuTier } from '../gpu/detect-tier.js';
/**
 * Creates the hidden SVG element, populates it with the filter definitions,
 * and appends it to <body>.  Idempotent — only runs once per init cycle.
 */
export function _injectSVG() {
    if (_state.svgReady)
        return;
    _state.svgReady = true;
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('aria-hidden', 'true');
    // Position fixed at 0×0; overflow:hidden prevents any filter expansion
    // from introducing scrollbars or layout impact.
    svg.setAttribute('style', [
        'position:fixed',
        'width:0',
        'height:0',
        'overflow:hidden',
        'pointer-events:none',
        'z-index:-9999',
    ].join(';'));
    svg.innerHTML = _buildSVGDefs(_detectGpuTier());
    document.body.appendChild(svg);
    _state.svgEl = svg;
}

/*!
 * Liquid Glass PRO · v4.2 — svg/update-aberration (§7 — Δn-driven aberration)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _state } from '../state/runtime.js';
import { _opts } from '../state/options.js';
import { _detectGpuTier } from '../gpu/detect-tier.js';

/**
 * Sellmeier Δn(R→B) per glass type (Schott catalogue 2023).
 * Drives how strongly the DOM-level chromatic aberration (#lg-distort)
 * scales with the selected glass — previously the SVG filter was static,
 * so switching BK7 → SF11 changed the WebGL pass but not the much more
 * visible DOM aberration (v4.1 audit finding: "dispersion is the headline
 * feature yet the rainbow split is barely visible").
 */
const GLASS_DN: Record<string, number> = {
    BK7:   0.0110,
    SF11:  0.0408,
    NK51A: 0.0054,
    NBK10: 0.0084,
    F2:    0.0227,
};

/** Numeric glassType indices map to names in this order (matches §6 GLSL). */
const GLASS_INDEX_ORDER = ['BK7', 'SF11', 'NK51A', 'NBK10', 'F2'];

/** aberrationStrength is calibrated against BK7's Δn. */
const BASELINE_DN = 0.0110;

/**
 * Re-scales the #lg-distort feDisplacementMap stages so the DOM chromatic
 * aberration tracks the physical dispersion of the active glass type:
 * SF11 ≈ 3.7× BK7, N-FK51A ≈ 0.5× BK7.
 *
 * Called from setGlassType() and once after _injectSVG() so an init with
 * a non-default glassType is reflected immediately.  No-ops when the SVG
 * bank is absent (before init) or on the 'low' tier (stub filters).
 */
export function _updateAberration() {
    const svg = _state.svgEl;
    if (!svg) return;

    const tier = _detectGpuTier();
    if (tier === 'low') return;  // low tier ships no-op filter stubs (§7)

    const key = typeof _opts.glassType === 'string'
        ? _opts.glassType
        : GLASS_INDEX_ORDER[Math.floor(_opts.glassType) % 5];
    const dn = GLASS_DN[key ?? 'BK7'] ?? BASELINE_DN;

    // Same tier staging as _buildSVGDefs: half strength on 'mid'.
    const base = tier === 'high'
        ? _opts.aberrationStrength
        : _opts.aberrationStrength * 0.5;

    // Physical Δn ratio, clamped so SF11 reads as vivid fringing rather
    // than mush (3.7 × 1.6 px ≈ 5.9 px at default strength).
    const aber = Math.min(base * (dn / BASELINE_DN), 8);

    // R/G/B stage ratios must match the static markup in _buildSVGDefs (§7).
    const stageRatios = [1, 0.62, 0.36];
    svg.querySelectorAll('#lg-distort feDisplacementMap').forEach((m, i) => {
        m.setAttribute('scale', (aber * (stageRatios[i] ?? 1)).toFixed(1));
    });
}

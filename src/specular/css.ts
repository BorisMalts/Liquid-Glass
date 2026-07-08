/*!
 * Liquid Glass PRO · v4.1.0 — specular/css (§15.4 — buildSpecularCSS)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */


// ─────────────────────────────────────────────────────────────────────────────
// §15.4  CSS for the specular canvas layer
//
//  .lg-specular-canvas sits between caustic (z-index 4) and content (5).
//  screen blend mode: specular adds light, never darkens.
//  Opacity is managed separately from the caustic canvas:
//    — always slightly visible (base opacity 0.045) so the highlight
//      is subtly present even without hover
//    — increases to 0.92 on hover to reveal the full physical highlight
//
//  The transition curve uses a custom cubic-bezier matching a spring
//  response (fast attack, soft tail) to feel physically plausible.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the CSS rule block for the specular canvas layer.
 * Intended to be appended to the output of §8's _buildCSS().
 *
 * @returns {string}
 */
export function buildSpecularCSS() {
    return `
/* ─────────────────────────────────────────────────────────────────────────── */
/* .lg-specular-canvas — Cook-Torrance PBR specular overlay (§15)             */
/* Sits above caustic canvas (z 4), below content (z 5).                     */
/* screen blend: specular adds light energy, satisfies energy conservation.  */
/* ─────────────────────────────────────────────────────────────────────────── */

.lg-specular-canvas {
    position:       absolute;
    inset:          0;
    width:          100%;
    height:         100%;
    pointer-events: none;
    z-index:        4;          /* Same as caustic; DOM order makes it render above */
    border-radius:  inherit;
    mix-blend-mode: screen;
    opacity:        0.045;      /* Always-on: subtle highlight even at rest */
    transition:     opacity .28s cubic-bezier(0.34, 1.20, 0.64, 1);
                    /* Spring-like easing: fast attack, gentle overshoot tail */
}

/* Hover: reveal full physical highlight */
.lg.lg-interactive:hover .lg-specular-canvas {
    opacity: 0.92;
}

/* Active: reduce highlight on press (light recedes as glass compresses) */
.lg.lg-interactive:active .lg-specular-canvas {
    opacity: 0.35;
    transition-duration: .06s;
}

/* Reduced motion: keep a static minimal specular, disable transition */
@media (prefers-reduced-motion: reduce) {
    .lg-specular-canvas {
        opacity:    0.03 !important;
        transition: none !important;
        animation:  none !important;
    }
}`;
}

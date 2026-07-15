/*!
 * Liquid Glass PRO · v4.1.0 — css/build-css (§8 — full stylesheet builder)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _opts } from '../state/options.js';
import { _buildSpecularCSS } from './specular-fallback.js';

// ─────────────────────────────────────────────────────────────────────────────
// §8  CSS injection
//
//  A single <style id="liquid-glass-pro-style-200"> element is injected into
//  <head> once.  All glass visual language is expressed here.
//
//  CSS architecture layers (outermost → innermost, back → front):
//    .lg-outer            — SVG filter wrapper; provides distortion context
//    .lg                  — Main glass element: backdrop-filter, radial highlights,
//                           box-shadow stack, CSS custom property bindings
//    .lg::before          — Secondary highlight layer (cursor-tracking specular)
//    .lg::after           — Thin-film iridescence (conic-gradient + overlay blend)
//    .lg-grain            — Film grain texture (SVG noise via data-URI)
//    .lg-caustic-canvas   — WebGL caustic overlay (screen blend)
//    .lg > *              — Content (z-index:5 keeps it above all overlay layers)
//
//  z-index stacking within .lg (isolation:isolate creates a new stacking context):
//    1  ::before    secondary specular highlight
//    2  ::after     iridescence conic overlay
//    3  .lg-grain   film grain
//    4  .lg-caustic-canvas  WebGL caustic / refraction
//    5  content children
//
//  Key CSS features used:
//    backdrop-filter      — hardware-accelerated blur + saturate + brightness
//    CSS custom properties — animated per-frame by JS spring system (§3)
//    will-change          — hints browser to promote to compositor layer
//    @keyframes           — lg-irid-spin, lg-grain-shift, lg-breathe
//    @media (prefers-reduced-motion) — fully disables all motion
//    CSS.registerProperty — Houdini typed transitions (see §4)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds the complete CSS string for the Liquid Glass PRO visual system.
 * The breathe @keyframes block is conditionally included based on _opts.breathe.
 *
 * @returns {string} Raw CSS text ready for a <style> element.
 */
export function _buildCSS() {
    const breatheKF = _opts.breathe ? `
@keyframes lg-breathe {
     0% { border-radius: 16px 19px 14px 21px / 19px 14px 21px 16px; }
    20% { border-radius: 21px 14px 19px 16px / 14px 21px 16px 19px; }
    40% { border-radius: 14px 22px 16px 18px / 22px 16px 18px 14px; }
    60% { border-radius: 19px 16px 22px 13px / 16px 19px 13px 22px; }
    80% { border-radius: 13px 21px 17px 20px / 21px 17px 20px 13px; }
   100% { border-radius: 16px 19px 14px 21px / 19px 14px 21px 16px; }
}` : '';

    const { before, hover, specCanvas } = _buildSpecularCSS();

    return `
/* ─────────────────────────────────────────────────────────────────────────── */
/* .lg-outer — SVG filter wrapper                                              */
/* ─────────────────────────────────────────────────────────────────────────── */

.lg-outer {
    display: inline-flex;
    position: relative;
    margin: -10px;
    padding: 10px;
}

.lg-outer.block { display: block;  }
.lg-outer.flex  { display: flex;   }
.lg-outer.grid  { display: grid;   }

@media (prefers-reduced-motion: no-preference) {
    .lg-outer { filter: url(#lg-distort); }
}


/* ─────────────────────────────────────────────────────────────────────────── */
/* .lg — Main glass element                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

.lg {
    --lg-mx:    50%;
    --lg-my:    30%;
    --lg-irid:  0deg;
    --lg-hover: 0;
    --lg-tx:    0;
    --lg-ty:    0;

    position:   relative;
    isolation:  isolate;
    overflow:   hidden;
    border-radius: 16px;
    will-change: transform, box-shadow;

    background:
        radial-gradient(
            ellipse 48% 34% at var(--lg-mx) var(--lg-my),
            rgba(255,255,255,0.08)  0%,
            rgba(255,255,255,0.02) 48%,
            transparent            68%
        ),
        rgba(255,255,255,0.06);

    backdrop-filter:         blur(12px) saturate(110%) brightness(1.06);
    -webkit-backdrop-filter: blur(12px) saturate(110%) brightness(1.06);

    box-shadow:
        inset  0  1.5px 0   rgba(255,255,255,0.44),
        inset  1px 0    0   rgba(255,255,255,0.20),
        inset  0 -1px   0   rgba(0,0,0,0.12),
        0  4px 18px  -4px   rgba(0,0,0,0.30),
        0 16px 48px -12px   rgba(0,0,0,0.20),
        0  1px  4px  0      rgba(0,0,0,0.18),
        0  0   48px -18px   rgba(185,160,255,0.22);

    transition:
        transform    .22s cubic-bezier(.34,1.56,.64,1),
        box-shadow   .22s ease,
        background   .22s ease;
}


/* ─────────────────────────────────────────────────────────────────────────── */
/* .lg::before — CSS fallback specular (§16.A)                                 */
/* Active only on .lg:not([data-lg-webgl]) — low tier / init failure.         */
/* ─────────────────────────────────────────────────────────────────────────── */

${before}


/* ─────────────────────────────────────────────────────────────────────────── */
/* .lg::after — Thin-film iridescence overlay                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

.lg::after {
    content:  '';
    position: absolute;
    inset:    0;
    border-radius: inherit;
    pointer-events: none;
    z-index:  2;

    background: conic-gradient(
        from var(--lg-irid) at 50% 50%,
        hsla(195, 100%, 88%, .000),
        hsla(235, 100%, 92%, .044),
        hsla(278, 100%, 88%, .029),
        hsla(328, 100%, 92%, .044),
        hsla( 18, 100%, 88%, .029),
        hsla( 78, 100%, 92%, .044),
        hsla(138, 100%, 88%, .029),
        hsla(195, 100%, 88%, .000)
    );

    mix-blend-mode: overlay;
    opacity: .94;
    animation: lg-irid-spin 15s linear infinite;
}


/* ─────────────────────────────────────────────────────────────────────────── */
/* .lg-grain — Film grain overlay                                               */
/* ─────────────────────────────────────────────────────────────────────────── */

.lg-grain {
    position: absolute;
    inset:    0;
    border-radius: inherit;
    pointer-events: none;
    z-index:  3;
    will-change: background-position;

    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.76' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E");
    background-size:  240px 240px;

    mix-blend-mode: soft-light;
    opacity: .038;
    animation: lg-grain-shift .12s steps(1) infinite;
}


/* ─────────────────────────────────────────────────────────────────────────── */
/* .lg-caustic-canvas — WebGL caustic/refraction overlay                       */
/* ─────────────────────────────────────────────────────────────────────────── */

.lg-caustic-canvas {
    position: absolute;
    inset:    0;
    width:    100%;
    height:   100%;
    pointer-events: none;
    z-index:  4;
    border-radius:   inherit;
    mix-blend-mode:  screen;
    /* v4.2: an experiment raising this to 0.16/0.38 made the large Voronoi
       cells distractingly visible at rest — reverted to the subtle original.
       Dispersion visibility is carried by the Δn-scaled DOM aberration (§7)
       and the widened GLSL split constants instead. */
    opacity: 0;
    transition: opacity .35s ease;
}

.lg.lg-interactive:hover .lg-caustic-canvas { opacity: 0.035; }


/* ─────────────────────────────────────────────────────────────────────────── */
/* Refraction status indicator                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */

.lg[data-lg-refract="1"]::before {
    outline: 1px solid rgba(100, 200, 255, 0.0);
}


/* ─────────────────────────────────────────────────────────────────────────── */
/* Content children                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */

.lg > *:not(.lg-grain):not(.lg-caustic-canvas):not(.lg-specular-canvas) {
    position: relative;
    z-index: 5;
}


/* ─────────────────────────────────────────────────────────────────────────── */
/* Interactive state                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */

.lg.lg-interactive { cursor: pointer; }

/* :hover — box-shadow amplification (§16.B), synchronized with L0 ×1.5      */
${hover}

/* :active — press-down */
.lg.lg-interactive:active {
    transform: translateY(1px) scale(.991) translateZ(0) !important;
    transition-duration: .07s;
    box-shadow:
        inset  0  1px  0  rgba(255,255,255,0.32),
        inset  1px 0   0  rgba(255,255,255,0.14),
        0  2px  8px -3px  rgba(0,0,0,0.28),
        0  6px 22px -8px  rgba(0,0,0,0.18);
}


/* ─────────────────────────────────────────────────────────────────────────── */
/* .lg-reply                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */

.lg-reply {
    display:        flex;
    flex-direction: column;
    gap:            3px;
    padding:        8px 12px;
    margin-bottom:  8px;
    border-radius:  10px;

    box-shadow:
        inset 2.5px 0 0  rgba(255,255,255,.40),
        inset 0    1px 0 rgba(255,255,255,.18),
        inset 0   -1px 0 rgba(0,0,0,.10),
        0  2px 10px -3px rgba(0,0,0,.22);
}

.lg-reply .lg-sender {
    font-size:      11px;
    font-weight:    700;
    color:          rgba(255,255,255,.85);
    letter-spacing: .02em;
    white-space:    nowrap;
    overflow:       hidden;
    text-overflow:  ellipsis;
    position:       relative;
    z-index:        5;
}

.lg-reply .lg-text {
    font-size:    12px;
    color:        rgba(255,255,255,.50);
    white-space:  nowrap;
    overflow:     hidden;
    text-overflow: ellipsis;
    position:     relative;
    z-index:      5;
}


/* ─────────────────────────────────────────────────────────────────────────── */
/* .lg.lg-own                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

.lg.lg-own {
    background:
        radial-gradient(
            ellipse 36% 26% at var(--lg-mx) var(--lg-my),
            rgba(200,175,255,.22)  0%,
            rgba(180,150,255,.06) 38%,
            transparent           62%
        ),
        rgba(110,68,202,.055);

    box-shadow:
        inset  0  2px  0  rgba(220,195,255,.32),
        inset  1px 0   0  rgba(200,175,255,.16),
        inset  0 -1px  0  rgba(0,0,0,.12),
        0  4px 18px  -4px rgba(0,0,0,.26),
        0 16px 44px -12px rgba(0,0,0,.16),
        0  0   38px -12px rgba(165,100,255,.24);
}

.lg.lg-own::after {
    background: conic-gradient(
        from var(--lg-irid) at 50% 50%,
        hsla(248, 100%, 88%, 0    ),
        hsla(278, 100%, 92%, .054 ),
        hsla(312, 100%, 88%, .034 ),
        hsla(338, 100%, 92%, .054 ),
        hsla(248, 100%, 88%, 0    )
    );
}

.lg.lg-own .lg-sender { color: rgba(226,202,255,.92); }


/* ─────────────────────────────────────────────────────────────────────────── */
/* Shape modifiers                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

.lg.lg-pill { border-radius: 999px; padding: 6px 18px; }
.lg.lg-card { border-radius: 22px;  padding: 20px; }
.lg.lg-fab  {
    border-radius: 50%;
    width:  56px;
    height: 56px;
    display:         flex;
    align-items:     center;
    justify-content: center;
    flex-shrink: 0;
}


/* ─────────────────────────────────────────────────────────────────────────── */
/* @keyframes                                                                  */
/* ─────────────────────────────────────────────────────────────────────────── */

@keyframes lg-irid-spin {
    from { --lg-irid: 0deg;   }
    to   { --lg-irid: 360deg; }
}

@keyframes lg-grain-shift {
      0% { background-position:   0px   0px; }
     11% { background-position: -48px -34px; }
     22% { background-position:  34px  56px; }
     33% { background-position: -72px  24px; }
     44% { background-position:  20px -60px; }
     55% { background-position: -42px  78px; }
     66% { background-position:  66px -16px; }
     77% { background-position: -22px  46px; }
     88% { background-position:  46px -30px; }
}

${breatheKF}


/* ─────────────────────────────────────────────────────────────────────────── */
/* Animation assignments                                                       */
/* ─────────────────────────────────────────────────────────────────────────── */

.lg:not(.lg-pill):not(.lg-fab):not(.lg-reply) {
    animation: lg-irid-spin 15s linear infinite
               ${_opts.breathe ? ', lg-breathe 9s ease-in-out infinite' : ''};
}

.lg.lg-pill,
.lg.lg-fab,
.lg.lg-reply  { animation: lg-irid-spin 15s linear infinite; }

.lg::after    { animation: lg-irid-spin 15s linear infinite; }


/* ─────────────────────────────────────────────────────────────────────────── */
/* @media (prefers-reduced-motion)                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {
    .lg,
    .lg::before,
    .lg::after,
    .lg-grain,
    .lg-caustic-canvas,
    .lg-specular-canvas {
        animation:   none !important;
        transition:  none !important;
        will-change: auto !important;
    }

    .lg { border-radius: 16px !important; transform: none !important; }
    .lg-outer { filter: none !important; }
    .lg-caustic-canvas   { display: none; }
    .lg-specular-canvas  { display: none; }
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* §16.C  Specular canvas + thin-film CSS overrides                            */
/* ─────────────────────────────────────────────────────────────────────────── */

${specCanvas}

/* ═══════════════════════════════════════════════════════════════════════════ */
/* §v4.1  Glass Variant CSS Overrides                                          */
/*                                                                             */
/*  Each variant class overrides backdrop-filter and background gradient.      */
/*  Applied via .lg.lg-v-{name}. Set programmatically by setGlassVariant().   */
/*  Physical parameters (Beer-Lambert, scatter, mirror) live in GLSL §H2-H3.  */
/*  The CSS layer handles perceptual "feel" and first-frame appearance before  */
/*  the WebGL pass renders.                                                    */
/* ═══════════════════════════════════════════════════════════════════════════ */

/* ── 1. Clear ─────────────────────────────────────────────────────────────── */
/* Near-invisible: minimal blur, maximum saturation boost, slight brightness.  */
.lg.lg-v-clear {
    backdrop-filter:         blur(7px) saturate(155%) brightness(1.08);
    -webkit-backdrop-filter: blur(7px) saturate(155%) brightness(1.08);
    background:
        radial-gradient(ellipse 48% 34% at var(--lg-mx) var(--lg-my),
            rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 50%, transparent 70%),
        rgba(255,255,255,0.04);
}

/* ── 2. Frosted ───────────────────────────────────────────────────────────── */
/* 40px blur = full optical diffusion; saturate 78% = desaturated scatter.    */
/* White radial gradient simulates light spread through ground glass surface.  */
.lg.lg-v-frosted {
    backdrop-filter:         blur(40px) saturate(78%) brightness(1.16);
    -webkit-backdrop-filter: blur(40px) saturate(78%) brightness(1.16);
    background:
        radial-gradient(ellipse 60% 45% at var(--lg-mx) var(--lg-my),
            rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 50%, transparent 72%),
        rgba(255,255,255,0.20);
    box-shadow:
        inset  0  2px  0  rgba(255,255,255,0.65),
        inset  1px 0   0  rgba(255,255,255,0.35),
        inset  0  -1px 0  rgba(0,0,0,0.08),
        0  4px 18px  -4px rgba(0,0,0,0.22),
        0 14px 40px -10px rgba(0,0,0,0.14),
        0  0   60px -20px rgba(220,230,255,0.18);
}

/* ── 3. Smoke ─────────────────────────────────────────────────────────────── */
/* Low brightness (0.66) + reduced saturation = dark neutral-density glass.   */
/* bg tint rgba(18,20,28) = very dark blue-grey (automotive tint film colour). */
.lg.lg-v-smoke {
    backdrop-filter:         blur(16px) saturate(58%) brightness(0.66);
    -webkit-backdrop-filter: blur(16px) saturate(58%) brightness(0.66);
    background:
        radial-gradient(ellipse 42% 30% at var(--lg-mx) var(--lg-my),
            rgba(80,85,105,0.18) 0%, rgba(30,32,42,0.08) 50%, transparent 68%),
        rgba(18,20,28,0.52);
    box-shadow:
        inset  0  1px  0  rgba(120,130,160,0.25),
        inset  1px 0   0  rgba(100,110,140,0.12),
        inset  0  -1px 0  rgba(0,0,0,0.22),
        0  4px 20px  -4px rgba(0,0,0,0.50),
        0 18px 50px -12px rgba(0,0,0,0.38),
        0  0   40px -15px rgba(60,70,120,0.20);
}

/* ── 4. Tinted Blue ───────────────────────────────────────────────────────── */
/* Cobalt colour comes from the dense blue overlay — hue-rotate removed        */
/* (v4.1 defect: it pushed the variant into purple on violet backgrounds).     */
.lg.lg-v-tinted-blue {
    backdrop-filter:         blur(12px) saturate(135%) brightness(1.02);
    -webkit-backdrop-filter: blur(12px) saturate(135%) brightness(1.02);
    background:
        radial-gradient(ellipse 50% 36% at var(--lg-mx) var(--lg-my),
            rgba(70,140,255,0.24) 0%, rgba(30,90,220,0.10) 50%, transparent 70%),
        rgba(22,80,225,0.24);
    box-shadow:
        inset  0  1.5px 0  rgba(140,195,255,0.50),
        inset  1px  0   0  rgba(100,165,255,0.22),
        inset  0  -1px  0  rgba(0,0,0,0.12),
        0  4px 18px  -4px  rgba(0,0,0,0.28),
        0 16px 48px -12px  rgba(0,0,0,0.18),
        0  0   60px -20px  rgba(50,120,255,0.28);
}

/* ── 5. Tinted Violet ─────────────────────────────────────────────────────── */
/* hue-rotate(270deg) maximises shift toward violet/ultraviolet.              */
.lg.lg-v-tinted-violet {
    backdrop-filter:         blur(12px) saturate(135%) brightness(1.02) hue-rotate(270deg);
    -webkit-backdrop-filter: blur(12px) saturate(135%) brightness(1.02) hue-rotate(270deg);
    background:
        radial-gradient(ellipse 50% 36% at var(--lg-mx) var(--lg-my),
            rgba(155,80,255,0.16) 0%, rgba(100,30,210,0.06) 50%, transparent 70%),
        rgba(100,30,210,0.14);
    box-shadow:
        inset  0  1.5px 0  rgba(200,155,255,0.48),
        inset  1px  0   0  rgba(165,110,255,0.22),
        inset  0  -1px  0  rgba(0,0,0,0.12),
        0  4px 18px  -4px  rgba(0,0,0,0.28),
        0 16px 48px -12px  rgba(0,0,0,0.18),
        0  0   60px -20px  rgba(130,60,255,0.32);
}

/* ── 6. Tinted Amber ──────────────────────────────────────────────────────── */
/* Honey-gold colour comes from the dense amber overlay — sepia removed        */
/* (v4.1 defect: sepia + green page content drifted the tint into olive).      */
.lg.lg-v-tinted-amber {
    /* saturate < 100%: mutes green/teal page content instead of amplifying it
       (the olive cast came from saturate(130%) boosting what bled through) */
    backdrop-filter:         blur(11px) saturate(95%) brightness(1.06);
    -webkit-backdrop-filter: blur(11px) saturate(95%) brightness(1.06);
    background:
        radial-gradient(ellipse 52% 38% at var(--lg-mx) var(--lg-my),
            rgba(255,196,80,0.32) 0%, rgba(228,145,30,0.16) 50%, transparent 72%),
        rgba(232,148,28,0.32);
    box-shadow:
        inset  0  1.5px 0  rgba(255,220,120,0.52),
        inset  1px  0   0  rgba(240,190,80,0.24),
        inset  0  -1px  0  rgba(0,0,0,0.12),
        0  4px 18px  -4px  rgba(0,0,0,0.28),
        0 16px 48px -12px  rgba(0,0,0,0.16),
        0  0   55px -18px  rgba(220,150,30,0.30);
}

/* ── 7. Pearl ─────────────────────────────────────────────────────────────── */
/* Former v4.1 mirror appearance, preserved verbatim as its own variant:       */
/* bright milky mother-of-pearl — minimal blur, high brightness, soft rims.    */
.lg.lg-v-pearl {
    backdrop-filter:         blur(3px) saturate(125%) brightness(1.18);
    -webkit-backdrop-filter: blur(3px) saturate(125%) brightness(1.18);
    background:
        radial-gradient(ellipse 45% 30% at var(--lg-mx) var(--lg-my),
            rgba(240,245,255,0.16) 0%, rgba(210,220,240,0.06) 46%, transparent 66%),
        rgba(220,228,240,0.08);
    box-shadow:
        inset  0   2px  0  rgba(255,255,255,0.70),
        inset  1px  0   0  rgba(255,255,255,0.35),
        inset  0  -1px  0  rgba(0,0,0,0.15),
        0  6px 24px  -4px  rgba(0,0,0,0.36),
        0 20px 60px -12px  rgba(0,0,0,0.26),
        0  2px  6px  0     rgba(0,0,0,0.22),
        0  0   70px -20px  rgba(160,185,230,0.26);
}

/* ── 8. Ice ───────────────────────────────────────────────────────────────── */
/* Milky polycrystalline ice: heavy blur + desaturation + brightness lift.     */
/* No hue-rotate — rotating backdrop hues turns coloured pages swampy-green;   */
/* the cold cast comes from the blue-white overlay gradient instead.           */
.lg.lg-v-ice {
    backdrop-filter:         blur(26px) saturate(45%) brightness(1.28);
    -webkit-backdrop-filter: blur(26px) saturate(45%) brightness(1.28);
    background:
        radial-gradient(ellipse 55% 42% at var(--lg-mx) var(--lg-my),
            rgba(222,242,255,0.38) 0%, rgba(180,220,255,0.18) 52%, transparent 76%),
        rgba(198,228,255,0.34);
    box-shadow:
        inset  0  2.5px 0  rgba(220,240,255,0.65),
        inset  1px  0   0  rgba(190,225,255,0.30),
        inset  0  -1px  0  rgba(100,160,220,0.15),
        0  4px 20px  -4px  rgba(0,0,0,0.22),
        0 16px 48px -12px  rgba(0,0,0,0.14),
        0  0   70px -22px  rgba(100,180,255,0.30);
}

/* ── 9. Bronze ────────────────────────────────────────────────────────────── */
/* sepia(40%) + warm-shifted saturate for bronze/copper dichroic appearance.  */
.lg.lg-v-bronze {
    backdrop-filter:         blur(13px) saturate(128%) brightness(0.96) sepia(40%);
    -webkit-backdrop-filter: blur(13px) saturate(128%) brightness(0.96) sepia(40%);
    background:
        radial-gradient(ellipse 50% 36% at var(--lg-mx) var(--lg-my),
            rgba(210,130,30,0.20) 0%, rgba(180,100,20,0.07) 50%, transparent 70%),
        rgba(180,100,20,0.14);
    box-shadow:
        inset  0  1.5px 0  rgba(245,195,110,0.50),
        inset  1px  0   0  rgba(220,160,70,0.22),
        inset  0  -1px  0  rgba(0,0,0,0.14),
        0  4px 18px  -4px  rgba(0,0,0,0.32),
        0 16px 48px -12px  rgba(0,0,0,0.20),
        0  0   50px -16px  rgba(200,110,20,0.28);
}

/* ── 10. Emerald ──────────────────────────────────────────────────────────── */
/* Saturated gem green from a dense overlay — hue-rotate removed               */
/* (v4.1 defect: it landed in desaturated cyan; that look now lives in Cyan).  */
.lg.lg-v-emerald {
    backdrop-filter:         blur(12px) saturate(150%) brightness(1.00);
    -webkit-backdrop-filter: blur(12px) saturate(150%) brightness(1.00);
    background:
        radial-gradient(ellipse 50% 36% at var(--lg-mx) var(--lg-my),
            rgba(24,200,84,0.26) 0%, rgba(10,140,45,0.12) 50%, transparent 70%),
        rgba(12,130,52,0.26);
    box-shadow:
        inset  0  1.5px 0  rgba(100,240,150,0.50),
        inset  1px  0   0  rgba(70,210,110,0.22),
        inset  0  -1px  0  rgba(0,0,0,0.12),
        0  4px 18px  -4px  rgba(0,0,0,0.28),
        0 16px 48px -12px  rgba(0,0,0,0.18),
        0  0   55px -18px  rgba(20,180,70,0.32);
}

/* ── 11. Rose ─────────────────────────────────────────────────────────────── */
/* Clean rose-quartz pink from a dense overlay — hue-rotate removed            */
/* (v4.1 defect: it muddied into brownish mauve; that look now lives in Mauve).*/
.lg.lg-v-rose {
    backdrop-filter:         blur(11px) saturate(140%) brightness(1.06);
    -webkit-backdrop-filter: blur(11px) saturate(140%) brightness(1.06);
    background:
        radial-gradient(ellipse 50% 36% at var(--lg-mx) var(--lg-my),
            rgba(255,145,175,0.26) 0%, rgba(245,95,135,0.11) 50%, transparent 70%),
        rgba(248,105,145,0.20);
    box-shadow:
        inset  0  1.5px 0  rgba(255,180,200,0.50),
        inset  1px  0   0  rgba(255,150,175,0.22),
        inset  0  -1px  0  rgba(0,0,0,0.10),
        0  4px 18px  -4px  rgba(0,0,0,0.26),
        0 16px 48px -12px  rgba(0,0,0,0.16),
        0  0   55px -18px  rgba(240,80,120,0.28);
}

/* ── 11b. Cyan ────────────────────────────────────────────────────────────── */
/* Former v4.1 emerald appearance, preserved verbatim as its own variant:      */
/* desaturated teal-cyan (hue-rotate kept intentionally for fidelity).         */
.lg.lg-v-cyan {
    backdrop-filter:         blur(12px) saturate(158%) brightness(1.03) hue-rotate(140deg);
    -webkit-backdrop-filter: blur(12px) saturate(158%) brightness(1.03) hue-rotate(140deg);
    background:
        radial-gradient(ellipse 50% 36% at var(--lg-mx) var(--lg-my),
            rgba(20,180,70,0.18) 0%, rgba(10,140,45,0.06) 50%, transparent 70%),
        rgba(15,140,50,0.14);
    box-shadow:
        inset  0  1.5px 0  rgba(100,240,150,0.50),
        inset  1px  0   0  rgba(70,210,110,0.22),
        inset  0  -1px  0  rgba(0,0,0,0.12),
        0  4px 18px  -4px  rgba(0,0,0,0.28),
        0 16px 48px -12px  rgba(0,0,0,0.18),
        0  0   55px -18px  rgba(20,180,70,0.32);
}

/* ── 11c. Mauve ───────────────────────────────────────────────────────────── */
/* Former v4.1 rose appearance, preserved verbatim as its own variant:         */
/* muted dusty rose-mauve (hue-rotate kept intentionally for fidelity).        */
.lg.lg-v-mauve {
    backdrop-filter:         blur(11px) saturate(138%) brightness(1.05) hue-rotate(330deg);
    -webkit-backdrop-filter: blur(11px) saturate(138%) brightness(1.05) hue-rotate(330deg);
    background:
        radial-gradient(ellipse 50% 36% at var(--lg-mx) var(--lg-my),
            rgba(255,120,150,0.16) 0%, rgba(240,80,115,0.05) 50%, transparent 70%),
        rgba(240,80,120,0.12);
    box-shadow:
        inset  0  1.5px 0  rgba(255,180,200,0.50),
        inset  1px  0   0  rgba(255,150,175,0.22),
        inset  0  -1px  0  rgba(0,0,0,0.10),
        0  4px 18px  -4px  rgba(0,0,0,0.26),
        0 16px 48px -12px  rgba(0,0,0,0.16),
        0  0   55px -18px  rgba(240,80,120,0.28);
}

/* ── 12. Obsidian ─────────────────────────────────────────────────────────── */
/* Very dark: brightness(0.54) + near-black bg tint.                          */
/* Subtle purple glow in shadow stack = characteristic obsidian iridescence.  */
.lg.lg-v-obsidian {
    backdrop-filter:         blur(15px) saturate(55%) brightness(0.54);
    -webkit-backdrop-filter: blur(15px) saturate(55%) brightness(0.54);
    background:
        radial-gradient(ellipse 40% 28% at var(--lg-mx) var(--lg-my),
            rgba(60,40,90,0.25) 0%, rgba(20,14,38,0.10) 48%, transparent 68%),
        rgba(8,5,18,0.72);
    box-shadow:
        inset  0  1.5px 0  rgba(110,80,160,0.28),
        inset  1px  0   0  rgba(80,55,120,0.14),
        inset  0  -1px  0  rgba(0,0,0,0.30),
        0  4px 22px  -4px  rgba(0,0,0,0.65),
        0 20px 58px -12px  rgba(0,0,0,0.52),
        0  2px  6px  0     rgba(0,0,0,0.30),
        0  0   45px -14px  rgba(80,40,140,0.22);
}

/* ── Variant hover amplification ─────────────────────────────────────────── */
/* Shared for all tinted variants: slightly brighter on hover.               */
.lg.lg-v-tinted-blue.lg-interactive:hover,
.lg.lg-v-tinted-violet.lg-interactive:hover,
.lg.lg-v-tinted-amber.lg-interactive:hover,
.lg.lg-v-emerald.lg-interactive:hover,
.lg.lg-v-cyan.lg-interactive:hover,
.lg.lg-v-rose.lg-interactive:hover,
.lg.lg-v-mauve.lg-interactive:hover,
.lg.lg-v-bronze.lg-interactive:hover {
    filter: brightness(1.08);
}

/* Pearl hover: former mirror hover treatment */
.lg.lg-v-pearl.lg-interactive:hover {
    filter: brightness(1.12) contrast(1.05);
}

/* Obsidian + Smoke hover: slight brightness lift from dark base */
.lg.lg-v-obsidian.lg-interactive:hover,
.lg.lg-v-smoke.lg-interactive:hover {
    filter: brightness(1.14);
}
`;
}

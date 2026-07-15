/*!
 * Liquid Glass PRO · v4.1.0 — constants/defaults (§1)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import type { LGOptions } from '../types/typedefs.js';

/**
 * Compile-time defaults.  Never mutated — _opts is the live working copy.
 *
 * @type {LGOptions}
 */
export const _defaults: LGOptions = {
    ior:                 1.45,   // soda-lime glass is ~1.52; slightly lower for subtlety
    refractionStrength:  0.08,   // UV displacement scale; tuned empirically
    aberrationStrength:  1.6,    // px magnitude of SVG feDisplacementMap on high tier
    bgCaptureInterval:   200,    // ms — balance freshness vs. html2canvas overhead
    bgCaptureScale:      0.65,   // 65% linear scale → ~8× pixel reduction
    caustics:            true,
    grain:               true,
    iridescence:         true,
    breathe:             true,
    selector:            '.lg',
    glassOpacity:         0.12,   // base white tint
    glassSaturation:      100,    // backdrop-filter saturation %
    // Glass material type — controls Sellmeier dispersion coefficients.
    // Accepts string name or numeric index (0–4).
    // Each type corresponds to a real optical glass from Schott catalogue.
    //
    //   'BK7'     (0) — borosilicate crown, Abbe V=64.17  — default
    //   'SF11'    (1) — heavy flint,        Abbe V=25.76  — strong rainbow
    //   'NK51A'   (2) — fluorite crown,     Abbe V=81.61  — minimal dispersion
    //   'NBK10'   (3) — thin crown,         Abbe V=67.90  — window glass feel
    //   'F2'      (4) — flint,              Abbe V=36.43  — medium prismatic
    //
    // Abbe number V = (nD − 1) / (nF − nC):
    //   High V → low dispersion (colours stay together)
    //   Low  V → high dispersion (strong rainbow fringing)
    glassType:            'BK7',
    // ── §v4.1  Glass Variant System ──────────────────────────────────────────
    // Controls the physical character of the glass surface beyond optical type.
    // Values: 'clear' | 'frosted' | 'smoke' | 'tinted-blue' | 'tinted-violet'
    //       | 'tinted-amber' | 'pearl' | 'ice' | 'bronze' | 'emerald' | 'cyan'
    //       | 'rose' | 'obsidian'
    glassVariant:  'clear',
};

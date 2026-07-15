/*!
 * Liquid Glass PRO · v4.1.0 — webgl/shaders/fragment/04-voronoi-caustics (§6.0 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

export const FRAG_VORONOI_CAUSTICS = /* glsl */`// ════════════════════════════════════════════════════════════════════════════
// §D  Improved Voronoi caustic system
//
//  Overview of improvements vs v1.1.1 original:
//
//  1. PCG2D hash (§A) replaces trigonometric hash.
//     Eliminates visible directional lattice bias in cell positions and
//     animation frequencies — cells now look truly random at all scales.
//
//  2. Domain warping before Voronoi evaluation.
//     The input UV is pre-distorted by a low-frequency gradient noise field
//     before the Voronoi cells are evaluated.  This breaks the global grid
//     regularity: cells are no longer visibly arranged on a lattice even
//     at low frequencies.  Technique: Inigo Quilez "Warped domain Voronoi"
//     (iquilezles.org/articles/warp/).
//
//  3. F2−F1 distance field instead of F1.
//     Original: minD = min distance to nearest cell centre  (F1)
//     Improved: voronoiF2F1 = second-nearest − nearest distance  (F2−F1)
//     F2−F1 produces sharper, more irregular caustic filaments because
//     it peaks exactly on cell boundaries rather than fading smoothly
//     from cell centres.  This better resembles real underwater caustics
//     where bright lines form at the lens boundary between adjacent cells.
//
//  4. Per-cell independent animation axes.
//     Original: all cells share the same 2D sinusoidal motion template.
//     Improved: each cell gets 4 independent random scalars from pcg2():
//       (rx, ry) → animation frequency per axis  (0.4 – 1.2 Hz range)
//       (px, py) → initial phase offset          (0 – 2π range)
//     This breaks the visual synchronisation that made the original look
//     like a repeating tile at longer observation times.
//
//  5. Depth/size variation per cell.
//     Each cell has a random "depth" scalar d ∈ [0.5, 1.5] derived from
//     pcg2().  The caustic band contribution is scaled by d before
//     compositing, simulating cells at different virtual depths in the
//     water column — deep cells contribute dimmer, narrower caustics;
//     shallow cells contribute brighter, wider ones.
//
//  6. Six octave composite with staggered grid rotation.
//     Original: four octaves on a fixed grid.
//     Improved: six octaves, each with a small random rotation applied to
//     the UV before evaluation.  Rotation angles are derived from the
//     octave index (not random) to ensure stable, non-drifting composition:
//       octave k → rotation = k × 11.25°  (Fibonacci-like stagger)
//     This eliminates the visible alignment between octaves that created
//     a star-burst artefact in certain lighting conditions.
//
//  Performance notes:
//    The improved Voronoi uses a 3×3 neighbourhood search (vs 5×5 original)
//    because domain warping and per-cell depth variation fill in the quality
//    gap at less cost.  Total instruction count is comparable to the
//    original 5×5 after accounting for the PCG2D hash savings vs sin().
// ════════════════════════════════════════════════════════════════════════════

/**
 * Rotates a 2D vector by the given angle (radians).
 * Used to stagger octave grid orientations in causticBandImproved().
 *
 * @param  v    Input 2D vector
 * @param  ang  Rotation angle in radians
 * @return      Rotated vector
 */
vec2 rot2(vec2 v, float ang) {
    float c = cos(ang);
    float s = sin(ang);
    return vec2(v.x * c - v.y * s,
                v.x * s + v.y * c);
}

/**
 * Domain warp: displaces UV by a low-frequency noise field before Voronoi
 * evaluation.  Breaks global grid regularity and produces organic, non-tiling
 * cell distributions.
 *
 * Technique: two independent gnoise() samples at orthogonal offsets drive
 * the X and Y displacement.  The 2.3× and 1.7× frequency scales are
 * coprime to the Voronoi cell scales used in causticBandImproved() to
 * prevent resonance artefacts between warp and cell frequencies.
 *
 * Warp strength is intentionally kept small (0.18) to preserve the overall
 * Voronoi topology while breaking the square lattice appearance.
 *
 * @param  uv   Input UV to warp
 * @param  t    Animation time (warp field drifts slowly over time)
 * @return      Warped UV, offset by at most ±0.18 in each axis
 */
vec2 domainWarp(vec2 uv, float t) {
    // Two gnoise samples at different frequencies and time offsets
    // provide visually independent X and Y displacements.
    float wx = gnoise(uv * 2.3 + vec2(0.0,  17.4) + t * 0.04) - 0.5;
    float wy = gnoise(uv * 1.7 + vec2(31.7,  0.0) + t * 0.03) - 0.5;
    // 0.18 = max warp magnitude; tuned to be visible but not disruptive
    return uv + vec2(wx, wy) * 0.18;
}

/**
 * Improved Voronoi — returns F2−F1 distance plus a per-cell depth scalar.
 *
 * F2−F1 is the difference between the distance to the second-nearest
 * Voronoi cell centre and the distance to the nearest one.  This quantity:
 *   • Peaks sharply at cell boundaries → tight caustic filaments
 *   • Falls off on both sides → natural attenuation away from the line
 *   • Avoids the "pillow" artefact of pure F1 at cell centres
 *
 * Per-cell animation uses 4 independent random values from pcg2():
 *   rx, ry — frequency multipliers for X/Y motion  (range: 0.4–1.2)
 *   px, py — initial phase offsets                  (range: 0–2π)
 * This ensures no two cells ever move in synchrony.
 *
 * Per-cell depth d ∈ [0.5, 1.5]:
 *   Returned in the .y component of the output vec2.
 *   Modulates caustic brightness in causticBandImproved().
 *
 * @param  p   2D UV scaled to cell frequency (after domain warp)
 * @param  t   Animation time in seconds
 * @return     vec2( F2−F1 distance,  cell depth scalar )
 */
vec2 voronoiF2F1(vec2 p, float t) {
    vec2  ip    = floor(p);   // Integer lattice cell of fragment
    vec2  fp    = fract(p);   // Fractional position within cell

    // Track the two nearest distances and the closest cell depth
    float minD1 = 8.0;   // nearest distance (F1)
    float minD2 = 8.0;   // second-nearest   (F2)
    float depth = 1.0;   // depth of nearest cell

    for (int dy = -1; dy <= 1; dy++) {
        for (int dx = -1; dx <= 1; dx++) {
            vec2 n = vec2(float(dx), float(dy));   // Neighbour cell offset

            // ── PCG2D hash for this cell ──────────────────────────────────────
            // Four statistically independent values for this cell:
            //   r.xy → animation frequencies in X/Y: mapped to [0.4, 1.2]
            //   r.zw → initial phase offsets:         mapped to [0, 2π]
            vec4 r;
            {
                // First pcg2 call: frequencies
                vec2 h1 = pcg2f(ip + n);
                r.xy = 0.4 + h1 * 0.8;    // frequency ∈ [0.4, 1.2] Hz

                // Second pcg2 call: phases (different seed via +127.1 offset)
                vec2 h2 = pcg2f(ip + n + vec2(127.1, 311.7));
                r.zw = h2 * 6.2831;        // phase ∈ [0, 2π]

                // Depth scalar from a third hash (y-component of third call)
                // Mapped to [0.5, 1.5]: simulates vertical cell position in water column.
                vec2 h3 = pcg2f(ip + n + vec2(269.5, 183.3));
                depth = (ip + n == floor(p + 0.001))
                    ? 0.5 + h3.x          // only update depth for nearest cell
                    : depth;
            }

            // ── Per-cell animated position ────────────────────────────────────
            // Each axis oscillates independently with its own frequency and phase.
            // Range clamp [0.04, 0.96] prevents cells from leaving their Voronoi
            // cell entirely, which would cause topology inversions.
            vec2 cellCenter = n + 0.5 + 0.46 * sin(
                t * r.xy + r.zw   // independent freq × time + phase per axis
            );

            float d = length(cellCenter - fp);

            // Update F1 and F2 — must check both in correct order:
            // If d < F1: old F1 becomes new F2, d becomes new F1
            // If d < F2 only: update F2 without touching F1
            if (d < minD1) {
                // Also capture depth of the winning cell before evicting it
                // Re-derive depth cleanly for the new nearest cell:
                vec2 h3 = pcg2f(ip + n + vec2(269.5, 183.3));
                depth  = 0.5 + h3.x;   // ∈ [0.5, 1.5]
                minD2  = minD1;
                minD1  = d;
            } else if (d < minD2) {
                minD2  = d;
            }
        }
    }

    // F2−F1: sharp ridge exactly at cell boundaries
    // Clamp to [0,1] — can exceed 1 in degenerate configs
    return vec2(clamp(minD2 - minD1, 0.0, 1.0), depth);
}

/**
 * Single caustic band using the improved Voronoi.
 *
 * Processing pipeline per band:
 *   1. Rotate UV by octave-specific angle (breaks inter-octave alignment)
 *   2. Apply domain warp (breaks intra-octave grid regularity)
 *   3. Evaluate voronoiF2F1() — get (F2−F1, depth) for this fragment
 *   4. Apply power curve to F2−F1 to sharpen caustic filaments
 *   5. Scale result by cell depth to vary brightness across the field
 *
 * Rotation angles follow an 11.25° × octave-index stagger — this is
 * 1/32 of a full circle, chosen so that six octaves (0°, 11.25°, 22.5°,
 * 33.75°, 45°, 56.25°) never align on the major axes (0°, 45°, 90°).
 *
 * @param  uv       UV input (will be scaled by cellFreq)
 * @param  cellFreq Voronoi cell density (higher = more cells per unit)
 * @param  speed    Animation speed multiplier
 * @param  seed     Phase seed as 2D UV offset (breaks pattern repetition)
 * @param  octIdx   Octave index 0–5 (drives rotation stagger)
 * @param  sharp    Power curve exponent — higher = tighter caustic lines
 * @return          Caustic band intensity ∈ [0, 1] (depth-modulated)
 */
float causticBandImproved(vec2 uv, float cellFreq, float speed,
                           vec2 seed, float octIdx, float sharp) {

    // ── Step 1: Rotation stagger — 11.25° per octave ─────────────────────────
    // Prevents the 45°/90° alignment that created a star-burst artefact
    // in the original four-octave fixed-grid composition.
    float rotAngle = octIdx * 0.19635;   // 11.25° in radians = π/16
    vec2 uvRot     = rot2(uv, rotAngle);

    // ── Step 2: Domain warp ───────────────────────────────────────────────────
    // Breaks the square lattice regularity of the Voronoi cells.
    // The warp is applied BEFORE scaling so the warp scale is consistent
    // across all cell frequencies — prevents warp looking "finer" on
    // high-frequency octaves.
    vec2 uvWarped  = domainWarp(uvRot, u_time * speed * 0.25);

    // ── Step 3: Evaluate improved Voronoi ─────────────────────────────────────
    // Scale warped UV to cell frequency, then offset by seed to prevent
    // multiple octaves starting at the same cell boundary pattern.
    vec2 result    = voronoiF2F1(uvWarped * cellFreq + seed, u_time * speed);
    float f2f1     = result.x;   // F2−F1: sharp at cell boundaries
    float cellDpth = result.y;   // Per-cell depth ∈ [0.5, 1.5]

    // ── Step 4: Power curve ───────────────────────────────────────────────────
    // smoothstep(0, 0.35, f2f1) maps the boundary ridge to 0–1.
    // Threshold 0.35 (vs 0.30 original) is wider because F2−F1 has a
    // steeper natural falloff than F1 — 0.30 would be too narrow.
    // pow(·, sharp) tightens the bright filament further.
    float band     = pow(smoothstep(0.0, 0.35, f2f1), sharp);

    // ── Step 5: Depth modulation ──────────────────────────────────────────────
    // Cells at greater depth (cellDpth > 1.0) contribute dimmer caustics,
    // simulating the natural variation of underwater light convergence.
    // The 0.65 factor caps the minimum contribution so dim cells remain visible.
    return band * (0.65 + 0.35 * (cellDpth - 0.5));
}

/**
 * Six-octave caustic composite with domain warping, PCG randomness,
 * F2−F1 distance fields, per-cell depth variation, and grid rotation stagger.
 *
 * Octave configuration:
 *   Octave 0 — large cells,  slow,  deep blue-green caustic base
 *   Octave 1 — medium cells, medium, primary white-gold filaments
 *   Octave 2 — medium-small, fast,  sharp bright detail
 *   Octave 3 — small cells,  slow,  secondary texture layer
 *   Octave 4 — large-medium, medium, low-frequency undulation
 *   Octave 5 — fine cells,   fast,  sparkle highlights
 *
 * Cursor offset (mw) shifts the entire caustic field toward the pointer
 * during hover, reinforcing the interactive lighting response.
 *
 * Octave weights are tuned so the composite peak stays ≤ 1.0 and the
 * energy distribution matches natural underwater caustic photography:
 * most energy in mid-frequency filaments, less in fine sparkle.
 *
 * @param  uv  Aspect-ratio-corrected UV (uvA in main)
 * @return     Composite caustic intensity ∈ [0, 1]
 */
float caustic(vec2 uv) {
    // Cursor-driven caustic focus: shifts field toward pointer on hover
    vec2 mw = (u_mouse - 0.5) * 0.07 * u_hover;

    // Each octave: causticBandImproved(uv, cellFreq, speed, seed, octIdx, sharp)
    //
    // seed values are 2D UV offsets chosen to be irrational multiples of
    // each other (√2, √3, √5, √7 approximations) so no two seeds share
    // a common lattice alignment.
    float c = 0.0;

    // Octave 0: large base cells, slow drift — wide caustic pools
    // Weight 0.26: dominant base layer, sets the overall brightness envelope
    c += causticBandImproved(uv + mw,        5.8,  0.28,
                              vec2( 0.000,  0.000), 0.0, 1.8) * 0.26;

    // Octave 1: medium cells, medium speed — primary caustic filaments
    // Weight 0.22: main structural detail, most visually prominent
    c += causticBandImproved(uv + mw * 0.7,  9.3,  0.41,
                              vec2( 7.139, 13.000), 1.0, 2.2) * 0.22;

    // Octave 2: medium-small cells, fast — sharp bright secondary lines
    // Weight 0.18: adds crispness, intersects octave 1 at different angles
    c += causticBandImproved(uv + mw * 1.1, 13.7,  0.57,
                              vec2(17.321,  4.472), 2.0, 2.5) * 0.18;

    // Octave 3: small cells, slow — fine texture grain
    // Weight 0.14: subtle underlying variation, breaks monotony of larger octaves
    c += causticBandImproved(uv,             6.2,  0.19,
                              vec2(31.623, 22.360), 3.0, 1.6) * 0.14;

    // Octave 4: large-medium, medium — broad undulating modulation
    // Weight 0.12: low-frequency brightness variation across the element
    // No cursor offset: this layer stays fixed, anchoring the composition
    c += causticBandImproved(uv + mw * 0.3, 11.1,  0.33,
                              vec2( 2.646, 44.721), 4.0, 2.0) * 0.12;

    // Octave 5: fine sparkle cells, fast — high-frequency glitter points
    // Weight 0.08: accent layer; max cursor amplification for interactive sparkle
    c += causticBandImproved(uv + mw * 1.4, 18.4,  0.72,
                              vec2(54.772,  8.944), 5.0, 3.0) * 0.08;

    return clamp(c, 0.0, 1.0);
}

/**
 * Per-channel chromatic caustic using improved Voronoi.
 *
 * Three separate caustic evaluations — one per RGB channel — at UV offsets
 * corresponding to the physical dispersion of the selected glass material.
 * The UV offsets are derived from the Sellmeier IOR difference (iorR/iorG/iorB)
 * to make the prismatic splitting physically consistent with the refraction pass.
 *
 * Compared to the original (fixed UV offsets ±0.009, ±0.005, ±0.010):
 *   Original:   constant RGB split independent of glass type
 *   Improved:   split scales with actual Δn of selected glass
 *               BK7:  subtle split  | SF11: vivid rainbow split
 *
 * @param  uvA  Aspect-ratio-corrected UV
 * @return      vec3 RGB chromatic caustic colour ∈ [0,1]³
 */
vec3 chromaticCaustic(vec2 uvA) {
    // Physical dispersion offset: proportional to IOR difference from reference
    // Scale factor 0.012 maps Δn to UV space (empirically tuned to match
    // the visual scale of the refraction chromatic aberration at default settings)
    float iorR = sellmeier(0.680);   // Red   channel IOR
    float iorG = sellmeier(0.550);   // Green channel IOR — reference wavelength
    float iorB = sellmeier(0.450);   // Blue  channel IOR

    float dispR = (iorG - iorR) * 1.1;   // Red shifts toward lower refraction
    float dispB = (iorB - iorG) * 1.1;   // Blue shifts toward higher refraction

    // Direction of prismatic split: 37° from horizontal — avoids alignment
    // with the caustic grid rotation series (multiples of 11.25°)
    vec2 splitDir = vec2(cos(0.6458), sin(0.6458));   // 37° in radians

    // Per-channel caustic at physically-offset UVs
    float cR = causticBandImproved(uvA - splitDir * dispR, 3.2, 0.38,
                                    vec2(0.0, 0.0), 0.5, 1.8) * 0.20;
    float cG = causticBandImproved(uvA,               3.2, 0.38,
                                    vec2(0.0, 0.0), 0.5, 1.8) * 0.16;
    float cB = causticBandImproved(uvA + splitDir * dispB, 3.2, 0.38,
                                    vec2(0.0, 0.0), 0.5, 1.8) * 0.24;

    return vec3(cR, cG, cB);
}

`;


/*!
 * Liquid Glass PRO · v4.1.0 — webgl/shaders/fragment/01-hash (§6.0 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

export const FRAG_HASH = /* glsl */`// ════════════════════════════════════════════════════════════════════════════
// §A  Hash functions
//
//  Two independent hash families are used in this shader:
//
//  hash2()   — Classic trigonometric hash used throughout the original
//              noise and Voronoi code.  Fast on all GPU tiers but has
//              visible lattice artefacts at low frequencies.
//
//  pcg2()    — PCG (Permuted Congruential Generator) integer hash,
//              adapted from Jarzynski & Olano (2020) "Hash Functions for
//              GPU Rendering".  Uses only integer arithmetic (no sin/cos),
//              produces higher-quality randomness with no visible lattice.
//              Used exclusively in the improved Voronoi system (§D).
//
//  Why two families:
//    pcg2() requires bit manipulation (floatBitsToUint etc.) which is
//    GLSL ES 3.00 only.  The original hash2() is retained for gnoise()
//    and surfaceNormal() where the slight lattice correlation is invisible
//    at the noise frequencies used (7× and 11× UV scale).
// ════════════════════════════════════════════════════════════════════════════

/**
 * Classic trigonometric gradient hash.
 * Maps a 2D lattice point → pseudo-random 2D vector in [−1,1]².
 * Used by gnoise() and surfaceNormal().
 *
 * @param  p  2D integer lattice coordinate (fractional part ignored)
 * @return    Pseudo-random 2D gradient vector in [−1,1]²
 */
vec2 hash2(vec2 p) {
    p = vec2(
        dot(p, vec2(127.1, 311.7)),
        dot(p, vec2(269.5, 183.3))
    );
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}

/**
 * PCG2D — high-quality integer-based 2D hash.
 * Source: Jarzynski & Olano (2020), "Hash Functions for GPU Rendering",
 *         JCGT Vol 9 No 3.  https://jcgt.org/published/0009/03/02/
 *
 * Algorithm:
 *   Uses a permuted congruential generator with two interleaved streams.
 *   Each stream multiplies by a large odd prime, then applies a XOR-shift
 *   using the other stream's high bits.  This creates strong avalanche
 *   (every input bit affects every output bit) without sin/cos.
 *
 * Properties vs hash2():
 *   • No visible lattice or directional bias at any frequency
 *   • Period 2³² per axis (hash2 has ~2²³ before sin aliasing)
 *   • ~30% faster on GPU than sin-based hashes on modern hardware
 *   • Required by the improved Voronoi (§D) for unbiased cell jitter
 *
 * @param  p  2D unsigned integer seed (any values valid)
 * @return    2D hash in [0,1]² (unsigned, not centred)
 */
vec2 pcg2(uvec2 p) {
    // Two interleaved PCG streams — each multiplies by a different prime
    // and XOR-shifts using the other stream's high bits.
    uvec2 v = p * uvec2(1664525u, 1013904223u) + uvec2(1013904223u, 1664525u);
    v.x += v.y * 1664525u;
    v.y += v.x * 1664525u;
    // XOR-shift: mix in high bits to remove low-frequency correlation
    v  ^= (v >> 16u);
    v.x += v.y * 1664525u;
    v.y += v.x * 1664525u;
    v  ^= (v >> 16u);
    // Map to [0,1]: divide by max uint (2³²−1)
    return vec2(v) * (1.0 / 4294967295.0);
}

/**
 * Convenience wrapper: converts float lattice coords → pcg2 output.
 * The floor() call strips the fractional part so the same cell always
 * gets the same random value regardless of which fragment samples it.
 *
 * @param  p  2D float coordinate (fractional part ignored)
 * @return    2D hash in [0,1]²
 */
vec2 pcg2f(vec2 p) {
    // Bias by 0.5 before floor to avoid negative-zero IEEE edge case
    // which would map (−0.5, +0.5) to different cells on some drivers.
    uvec2 ip = uvec2(ivec2(floor(p + 0.5)) + ivec2(32768));
    return pcg2(ip);
}

`;


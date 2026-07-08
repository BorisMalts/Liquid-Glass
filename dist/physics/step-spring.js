/*!
 * Liquid Glass PRO · v4.1.0 — physics/step-spring (§3 — semi-implicit Euler)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { MAX_DT } from '../constants/limits.js';
// ─────────────────────────────────────────────────────────────────────────────
// §3  Spring physics
//
//  Implementation: semi-implicit (symplectic) Euler integration of a damped
//  harmonic oscillator.  This integrator is unconditionally stable for the
//  parameter ranges used here and is computationally cheap (two multiplies,
//  two additions per axis per frame).
//
//  Semi-implicit Euler:
//    F        = −k · (x − target) − d · v     [restoring + damping force]
//    v(t+dt)  = v(t) + (F / m) · dt           [velocity update first]
//    x(t+dt)  = x(t) + v(t+dt) · dt           [position update uses new v]
//
//  The key property is that energy is conserved (never grows) for any
//  positive dt, unlike explicit Euler which can diverge for stiff springs.
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Advances a spring by one time step using semi-implicit Euler integration.
 * Mutates the spring state object in place (no allocation per frame).
 *
 * @param {SpringState}                          s    - Spring state (mutated).
 * @param {{ stiffness: number, damping: number, mass: number }} cfg - Spring constants.
 * @param {number}                               dt   - Delta time in seconds.
 */
export function _stepSpring(s, cfg, dt) {
    // Clamp dt to MAX_DT so tab-wake-up or long GC pauses don't teleport values.
    const safe = Math.min(dt, MAX_DT);
    // Net force: restoring (Hooke's law) + velocity-proportional damping.
    const f = -cfg.stiffness * (s.value - s.target) - cfg.damping * s.velocity;
    // Semi-implicit Euler: update velocity before position.
    s.velocity += (f / cfg.mass) * safe;
    s.value += s.velocity * safe;
}

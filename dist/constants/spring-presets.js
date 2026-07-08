/**
 * Immutable spring configuration presets.
 * Each preset is a { stiffness, damping, mass } tuple that controls the
 * character of the corresponding spring animation:
 *
 *   cursor  — fast, snappy tracking of pointer position
 *   hover   — slightly slower fade-in/out of hover intensity
 *   tilt    — slow, weighty tilt that lags behind the cursor
 *
 * The spring equation used is a semi-implicit Euler integration of:
 *   F = −k·(x − target) − d·v    (damped harmonic oscillator)
 *   a = F / m
 *
 * Tuning guide:
 *   Increase stiffness → faster response (higher natural frequency)
 *   Increase damping   → less overshoot / oscillation
 *   Increase mass      → slower, more inertial feel
 */
export const SPRING = Object.freeze({
    cursor: { stiffness: 180, damping: 18, mass: 1.0 },
    hover: { stiffness: 120, damping: 14, mass: 1.0 },
    tilt: { stiffness: 90, damping: 12, mass: 1.2 },
});

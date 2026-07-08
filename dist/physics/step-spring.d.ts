import type { SpringState, SpringConfig } from '../types/typedefs.js';
/**
 * Advances a spring by one time step using semi-implicit Euler integration.
 * Mutates the spring state object in place (no allocation per frame).
 *
 * @param {SpringState}                          s    - Spring state (mutated).
 * @param {{ stiffness: number, damping: number, mass: number }} cfg - Spring constants.
 * @param {number}                               dt   - Delta time in seconds.
 */
export declare function _stepSpring(s: SpringState, cfg: SpringConfig, dt: number): void;

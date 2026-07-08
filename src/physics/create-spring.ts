/*!
 * Liquid Glass PRO · v4.1.0 — physics/create-spring (§3)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import type { SpringState } from '../types/typedefs.js';

/**
 * Constructs a SpringState with value, velocity, and target all set to
 * the same initial value so the spring begins in a resting equilibrium.
 *
 * @param {number} v - Initial (and target) value.
 * @returns {SpringState}
 */
export const _createSpring = (v: number): SpringState => ({ value: v, velocity: 0, target: v });

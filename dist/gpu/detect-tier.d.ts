/*!
 * Liquid Glass PRO · v4.1.0 — gpu/detect-tier (§2 — GPU tier detection)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import type { GpuTier } from '../types/typedefs.js';
/**
 * Detects the device GPU tier by probing WebGL renderer information.
 * Result is memoised in _gpuTierCache after the first call.
 *
 * @returns {GpuTier}
 */
export declare function _detectGpuTier(): GpuTier;
/**
 * Resets the memoised GPU tier.  Called by destroyLiquidGlass() so a
 * subsequent re-init re-probes the GPU.
 */
export declare function _resetGpuTierCache(): void;

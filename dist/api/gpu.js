/*!
 * Liquid Glass PRO · v4.1.0 — api/gpu (§13 — getGpuTier)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _detectGpuTier } from '../gpu/detect-tier.js';
/**
 * Returns the detected GPU capability tier for the current device.
 * Useful for host apps that want to conditionally enable or disable
 * other graphics-intensive features based on the same GPU data.
 *
 * @returns {GpuTier}
 */
export function getGpuTier() { return _detectGpuTier(); }

import type { GpuTier } from '../types/typedefs.js';
/**
 * Builds the inner SVG <defs> markup containing the two filter definitions.
 * Returns a simplified no-op version for 'low' tier to avoid filter overhead.
 *
 * @param {GpuTier} tier - GPU capability tier.
 * @returns {string} SVG markup string (safe to assign to .innerHTML).
 */
export declare function _buildSVGDefs(tier: GpuTier): string;

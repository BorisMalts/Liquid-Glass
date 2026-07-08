/**
 * Returns the detected GPU capability tier for the current device.
 * Useful for host apps that want to conditionally enable or disable
 * other graphics-intensive features based on the same GPU data.
 *
 * @returns {GpuTier}
 */
export declare function getGpuTier(): import("../index.js").GpuTier;

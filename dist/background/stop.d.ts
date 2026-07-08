/**
 * Cancels the periodic capture interval and resets capture-related state.
 * Called by destroyLiquidGlass().  Does NOT delete the WebGL texture
 * (that happens when the GL context is freed).
 */
export declare function _stopBackgroundCapture(): void;

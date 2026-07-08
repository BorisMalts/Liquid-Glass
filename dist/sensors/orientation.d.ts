/**
 * Attaches the 'deviceorientation' event listener and starts updating
 * _state.deviceTilt on each sensor reading.
 * Idempotent — will not add duplicate listeners if called again.
 */
export declare function _startOrientationTracking(): void;
/**
 * Removes the 'deviceorientation' listener and resets tilt to zero.
 * Called during destroyLiquidGlass() cleanup.
 */
export declare function _stopOrientationTracking(): void;

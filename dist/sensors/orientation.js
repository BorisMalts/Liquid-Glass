/*!
 * Liquid Glass PRO · v4.1.0 — sensors/orientation (§9 — gyroscope tilt parallax)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _state } from '../state/runtime.js';
// ─────────────────────────────────────────────────────────────────────────────
// §9  Device orientation (gyroscope tilt)
//
//  On supported mobile devices the 'deviceorientation' event provides real-time
//  Euler angles from the device's IMU (inertial measurement unit):
//
//    e.gamma  — rotation around Z (device tilted left/right), range −90..+90°
//    e.beta   — rotation around X (device tilted forward/back), range −180..+180°
//
//  These are normalised to the range [−1, +1] and fed to the tilt spring
//  targets (_state.deviceTilt) in the rAF loop, which then drives the CSS
//  perspective transform and the u_tilt GLSL uniform.
//
//  The 0.5 offset on beta shifts the "neutral" position from the device lying
//  flat (beta=0) to the device held upright at ~45° — a more natural
//  use-case for reading content.
//
//  iOS 13+ requires a user gesture + DeviceOrientationEvent.requestPermission()
//  call before orientation events fire.  This module does not request that
//  permission automatically; the host app should call it before init if
//  gyroscope parallax is desired on iOS.
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Attaches the 'deviceorientation' event listener and starts updating
 * _state.deviceTilt on each sensor reading.
 * Idempotent — will not add duplicate listeners if called again.
 */
export function _startOrientationTracking() {
    if (_state.orientHandler)
        return;
    const h = (e) => {
        // Clamp to [−1, +1] after normalising: gamma / 45° for X, (beta−45°) / 45° for Y
        _state.deviceTilt.x = Math.max(-1, Math.min(1, (e.gamma ?? 0) / 45));
        _state.deviceTilt.y = Math.max(-1, Math.min(1, (e.beta ?? 0) / 45 - 0.5));
    };
    window.addEventListener('deviceorientation', h, { passive: true });
    _state.orientHandler = h;
}
/**
 * Removes the 'deviceorientation' listener and resets tilt to zero.
 * Called during destroyLiquidGlass() cleanup.
 */
export function _stopOrientationTracking() {
    if (!_state.orientHandler)
        return;
    window.removeEventListener('deviceorientation', _state.orientHandler);
    _state.orientHandler = null;
    _state.deviceTilt = { x: 0, y: 0 };
}

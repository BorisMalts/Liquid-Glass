/*!
 * Liquid Glass PRO · v4.1.0 — background/schedule (§5 — idle-callback capture chain)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _state } from '../state/runtime.js';
import { _opts } from '../state/options.js';
import { _captureBackground } from './capture.js';

/**
 * Schedules the next background capture using requestIdleCallback when
 * available, falling back to setTimeout.  Only one pending schedule exists
 * at any time — the function is called exclusively from the Promise.finally
 * of _captureBackground(), so there is no concurrent scheduling.
 *
 * Guard conditions that abort rescheduling:
 *   • _state.bgCaptureId === 0  — _stopBackgroundCapture() was called;
 *                                  do not re-queue after destroy.
 *   • document.visibilityState  — skip when tab is hidden; the scroll/resize
 *                                  listeners will trigger a fresh capture when
 *                                  the user returns.
 */
/**
 * Schedules the next background capture using requestIdleCallback when
 * available, falling back to setTimeout.  Only one pending schedule exists
 * at any time — the function is called exclusively from the Promise.finally
 * of _captureBackground(), so there is no concurrent scheduling.
 *
 * bgCaptureId sentinel values:
 *   0   — _stopBackgroundCapture() was called; chain must terminate immediately.
 *  -1   — first-run sentinel set by _startBackgroundCapture() before the initial
 *          _captureBackground() call.  Allows _scheduleCapture() to proceed even
 *          though no real rIC/setTimeout handle has been assigned yet.
 *  > 0  — live rIC or setTimeout handle from a previous schedule call.
 *
 * Guard conditions that abort rescheduling:
 *   • _state.bgCaptureId === 0  — _stopBackgroundCapture() was called;
 *                                  do not re-queue after destroy.
 *   • document.visibilityState  — skip when tab is hidden; the scroll/resize
 *                                  listeners will trigger a fresh capture when
 *                                  the user returns.
 */
export function _scheduleCapture() {
    // 0 = _stopBackgroundCapture() has been called — terminate the chain.
    // −1 = sentinel from _startBackgroundCapture() for the very first run;
    //      no real handle exists yet, but the chain should continue normally.
    if (_state.bgCaptureId === 0) return;

    const delay = _opts.bgCaptureInterval;

    // Shared callback: re-check the sentinel before firing to handle the edge
    // case where destroyLiquidGlass() is called while an idle/timeout is queued.
    const run = () => {
        if (_state.bgCaptureId === 0) return;
        _captureBackground().finally(_scheduleCapture);
    };

    if (typeof window.requestIdleCallback === 'function') {
        // requestIdleCallback fires during browser idle time so html2canvas
        // does not compete with user interactions or rAF callbacks.
        // The timeout option guarantees execution within delay+200 ms even if
        // the browser never goes idle (e.g. on a continuously animated page).
        _state.bgCaptureId = requestIdleCallback(run, { timeout: delay + 200 });
    } else {
        // Plain setTimeout fallback for browsers without rIC (Safari < 16.4).
        _state.bgCaptureId = setTimeout(run, delay);
    }
}

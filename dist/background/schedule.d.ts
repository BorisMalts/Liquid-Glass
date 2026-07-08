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
export declare function _scheduleCapture(): void;

/**
 * Starts the rAF render loop if it is not already running.
 * Resets _lastTs to prevent a large dt spike on the first frame.
 */
export declare function _startLoop(): void;
/**
 * Cancels the rAF render loop.  The next scheduled frame is cancelled
 * immediately; any already-executing frame will complete naturally.
 */
export declare function _stopLoop(): void;

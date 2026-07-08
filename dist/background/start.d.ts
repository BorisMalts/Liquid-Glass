/**
 * Creates the background WebGL texture, kicks off the first capture, and
 * registers the three refresh triggers (interval, scroll, resize).
 *
 * Called once by _initWebGL() after the WebGL context has been successfully
 * created.  Safe to call from a non-document-ready state — html2canvas
 * itself handles the case where the DOM is still loading.
 */
export declare function _startBackgroundCapture(): void;

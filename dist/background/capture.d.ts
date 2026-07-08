/**
 * Performs a single background capture using html2canvas and uploads the
 * result to the shared WebGL background texture (TEXTURE_UNIT1).
 *
 * The function is guarded by a mutex (_state.bgCapturing) so that even if
 * called rapidly (e.g. during fast scroll), no more than one html2canvas
 * instance runs concurrently.
 *
 * Silently degrades if html2canvas is not loaded — the shader's u_bgReady
 * uniform will remain 0.0 and refraction will be disabled for that frame.
 *
 * @async
 * @returns {Promise<void>}
 */
export declare function _captureBackground(): Promise<void>;

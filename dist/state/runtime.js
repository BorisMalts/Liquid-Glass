// ─────────────────────────────────────────────────────────────────────────────
// §1  Module-level state
//
//  All mutable singleton state lives in these two objects plus a handful of
//  top-level variables.  Keeping state centralised:
//    • makes destroyLiquidGlass() trivial — one Object.assign() resets it all
//    • avoids hidden cross-function coupling through module-level locals
//    • lets future versions snapshot/restore state across SPA navigations
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Global singleton runtime state.
 *
 * Naming conventions used in this object:
 *   gl*       — WebGL2 objects (context, program, buffers, textures)
 *   bg*       — Background capture subsystem state
 *   device*   — Physical sensor readings
 *   *Handler  — Event listener function references (for cleanup)
 *   *Id       — setInterval / requestAnimationFrame handles
 *   *Ready    — Boolean flags indicating subsystem initialisation status
 */
export const _state = {
    // ── Lifecycle flags ──────────────────────────────────────────────────────
    ready: false, // true after initLiquidGlass() has been called
    svgReady: false, // true after SVG filter bank has been injected
    houdiniReg: false, // true after CSS.registerProperty() calls succeeded
    started: false,
    // ── DOM references ───────────────────────────────────────────────────────
    observer: /** @type {MutationObserver|null} */ (null), // watches for new .lg nodes
    styleEl: /** @type {HTMLStyleElement|null} */ (null), // injected <style> tag
    svgEl: /** @type {SVGSVGElement|null}    */ (null), // injected <svg> with filters
    // ── rAF ──────────────────────────────────────────────────────────────────
    rafId: 0, // non-zero while animation loop is running
    // ── WebGL2 caustics back-end ─────────────────────────────────────────────
    // A single WebGL2 context services ALL glass elements — each frame the
    // viewport is resized to the current element's dimensions before drawing,
    // and the result is blitted via drawImage() into the element's 2D canvas.
    // This 1-context-N-elements design avoids browser limits on WebGL contexts.
    glBackend: /** @type {WebGL2RenderingContext|null} */ (null),
    glCanvas: /** @type {HTMLCanvasElement|null}      */ (null), // hidden 0×0 source
    glProgram: /** @type {WebGLProgram|null}           */ (null),
    glUniforms: /** @type {Record<string,WebGLUniformLocation|null>} */ ({}),
    glBuffer: /** @type {WebGLBuffer|null}            */ (null), // fullscreen triangle VBO
    glStartTime: 0, // performance.now() at context creation; used to derive u_time
    // ── Background capture (introduced in v2.0.0) ────────────────────────────
    // html2canvas renders the page into a low-res canvas; that canvas is
    // uploaded to bgTexture on TEXTURE_UNIT1 for the refraction shader pass.
    bgTexture: /** @type {WebGLTexture|null}             */ (null),
    bgCanvas: /** @type {HTMLCanvasElement|null}        */ (null), // CPU-side 2D copy
    bgCtx: /** @type {CanvasRenderingContext2D|null} */ (null),
    bgCaptureId: 0, // setInterval handle — cleared in _stopBackgroundCapture()
    bgReady: false, // true once the first successful capture has completed
    bgCapturing: false, // mutex — prevents concurrent html2canvas invocations
    bgScrollX: 0, // window.scrollX at last capture — used to compute scroll drift
    bgScrollY: 0, // window.scrollY at last capture
    // ── Physical sensors ─────────────────────────────────────────────────────
    deviceTilt: { x: 0, y: 0 }, // normalised gyroscope data; fed to tilt springs
    orientHandler: /** @type {Function|null} */ (null), // stored for removeEventListener
};

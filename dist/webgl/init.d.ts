/**
 * Creates and initialises the single shared WebGL2 context used by all glass
 * elements.  Called lazily on the first call to _attach() that qualifies for
 * WebGL rendering.
 *
 * Steps:
 *  1. Create a hidden 0×0 <canvas> and request a WebGL2 context.
 *  2. Compile and link the vertex + fragment shader program.
 *  3. Upload a fullscreen-triangle VBO (3 vertices, no index buffer).
 *  4. Enable premultiplied-alpha blending.
 *  5. Cache all uniform locations (including v2 background uniforms).
 *  6. Pre-bind the background sampler to texture unit 1.
 *  7. Launch the background capture subsystem.
 *
 * Returns true on success, false on any failure (GL unavailable, compile
 * error, etc.).  On failure the hidden canvas is removed so no resources leak.
 *
 * @returns {boolean} True if WebGL2 was successfully initialised.
 */
export declare function _initWebGL(): boolean;

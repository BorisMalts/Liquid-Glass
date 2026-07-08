/**
 * Initialises the shared WebGL2 context for the specular pass.
 * Separate from §6's _initWebGL() to keep the two passes fully independent.
 * Returns true on success, false on any error.
 *
 * @returns {boolean}
 */
export declare function initSpecularPass(): boolean;

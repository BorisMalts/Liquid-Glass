/**
 * Creates, links, and validates a WebGL2 program from separate vertex and
 * fragment shader sources.  Returns the linked WebGLProgram handle.
 * Throws on link failure so the caller can degrade gracefully.
 *
 * @param {WebGL2RenderingContext} gl - Active WebGL2 context.
 * @param {string}                 vs - Vertex shader GLSL source.
 * @param {string}                 fs - Fragment shader GLSL source.
 * @returns {WebGLProgram}
 * @throws {Error} If linking fails.
 */
export declare function _buildProgram(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram;

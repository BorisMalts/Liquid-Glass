/** Singleton specular GL state — separate from §6 caustic GL state. */
export const _spec = {
    gl: null, // WebGL2RenderingContext
    canvas: null, // hidden off-screen source canvas
    program: null, // compiled specular program
    uniforms: {}, // cached uniform locations
    lut: null, // WebGLTexture — Kulla-Conty E_avg LUT
    startTime: 0,
};

import type { ElementState, LGOptions } from '../types/typedefs.js';
/**
 * Renders one frame of the Cook-Torrance specular pass for a single element.
 * Called from the rAF loop in §11 immediately after _renderCausticsGL().
 *
 * All physically-based calculations live exclusively in the GLSL shader;
 * this function's sole responsibility is uploading per-frame uniforms and
 * blitting the result into the element's specular canvas.
 *
 * @param {object} es   - ElementState from §10 (springs, domRect, etc.)
 * @param {CanvasRenderingContext2D} specCtx  - 2D context of specular canvas
 * @param {number} now  - rAF timestamp in milliseconds
 * @param {object} opts - Live _opts from §1 (ior, etc.)
 */
export declare function renderSpecularGL(es: ElementState, specCtx: CanvasRenderingContext2D, now: number, opts: LGOptions): void;

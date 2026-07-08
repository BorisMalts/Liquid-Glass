import type { ElementState } from '../types/typedefs.js';
/**
 * Renders one frame of the caustic + refraction effect for a single glass
 * element using the shared WebGL2 context.
 *
 * Procedure:
 *  1. Resize the shared GL canvas to match the current element's physical
 *     pixel dimensions (avoids per-element GL contexts).
 *  2. Upload all per-frame uniforms (time, mouse, tilt, element position, etc.).
 *  3. Bind the background texture to TEXTURE_UNIT1.
 *  4. Execute the fullscreen-triangle draw call.
 *  5. Blit the GL canvas into the element's dedicated 2D caustic canvas via
 *     drawImage() — this is the only cross-context transfer per frame.
 *
 * @param {ElementState} es  - Per-element state.
 * @param {number}       now - Current timestamp from requestAnimationFrame.
 */
export declare function _renderCausticsGL(es: ElementState, now: number): void;

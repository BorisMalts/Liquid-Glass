/**
 * Fragment shader source.
 *
 * Full GLSL 300 es implementation of the Liquid Glass PRO visual layer.
 * See §6 module comment for a detailed description of each functional block.
 *
 * Uniform layout:
 *   u_time         float     Seconds since GL context creation.
 *   u_mouse        vec2      Spring-smoothed cursor position in element UV space.
 *   u_hover        float     Spring-smoothed hover intensity (0–1).
 *   u_tilt         vec2      Spring-smoothed tilt angles (−1 to +1 per axis).
 *   u_res          vec2      Physical canvas dimensions in pixels.
 *   u_background   sampler2D html2canvas background texture (unit 1).
 *   u_bgRes        vec2      Background texture pixel dimensions (reserved).
 *   u_elementPos   vec2      Element top-left corner in normalised screen space (0..1).
 *   u_elementSize  vec2      Element dimensions as fraction of viewport.
 *   u_ior          float     Index of refraction.
 *   u_refractStr   float     UV displacement scale for refraction.
 *   u_bgReady      float     1.0 if background texture contains valid data, 0.0 otherwise.
 *   u_scroll       vec2      Scroll drift since last capture, normalised to screen size.
 *   u_glassType    float     Sellmeier glass material selector (0–4).
 *
 * @type {string}
 */
export declare const _FRAG_SRC: string;

/**
 * Fragment shader source for the specular pass.
 *
 * Coordinate conventions (match §6 exactly for visual synchronisation):
 *   v_uv          — element-local UV [0,1], top-left origin
 *   N             — view-space surface normal from animated noise bump map
 *   V             — view direction, fixed at (0,0,1) (orthographic camera)
 *   L_i           — light direction vectors in view space
 *   H_i           — half-vectors between V and each L_i
 *
 * Tangent frame construction:
 *   T  — tangent vector, perpendicular to N, aligned with noise gradient
 *   B  — bitangent = cross(N, T), completing the orthonormal frame
 *
 * @type {string}
 */
export declare const _SPEC_FRAG_SRC: string;

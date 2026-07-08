/*!
 * Liquid Glass PRO · v4.1.0 — specular/shaders/fragment/14-main (§15.1 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
export const SPEC_MAIN = /* glsl */ `// ════════════════════════════════════════════════════════════════════════════
// §15.M  Main
// ════════════════════════════════════════════════════════════════════════════

void main() {
    vec2 uv  = v_uv;

    // ── Surface frame ─────────────────────────────────────────────────────────
    SurfaceFrame frame = buildFrame(uv);

    // ── Camera / view direction ───────────────────────────────────────────────
    // Orthographic projection: V is constant (0,0,1) plus a small tilt offset
    // that simulates perspective parallax from the viewer moving.
    vec3 V = safeNorm(vec3(-u_tilt.x * 0.15, -u_tilt.y * 0.15, 1.0));

    // ── Material parameters ───────────────────────────────────────────────────
    // α = roughness², IOR-derived F0, anisotropy from §15 constants.
    float alpha = u_roughness * u_roughness;
    float F0    = pow((u_ior - 1.0) / (u_ior + 1.0), 2.0);

    // ── Build lights ──────────────────────────────────────────────────────────
    Light L0, L1, L2;
    buildLights(uv, L0, L1, L2);

    // ── BRDF sum over three lights ────────────────────────────────────────────
    vec3 specular = vec3(0.0);
    specular += brdf_cookTorrance(V, L0.dir, frame, alpha, u_anisotropy,
                                  F0, L0.colour, L0.uvPos, uv);
    specular += brdf_cookTorrance(V, L1.dir, frame, alpha, u_anisotropy,
                                  F0, L1.colour, L1.uvPos, uv);
    specular += brdf_cookTorrance(V, L2.dir, frame, alpha, u_anisotropy,
                                  F0, L2.colour, L2.uvPos, uv);

    // ── Thin-film iridescence ─────────────────────────────────────────────────
    // Evaluate for the primary light half-vector.
    vec3  H0     = safeNorm(V + L0.dir);
    float VdotH0 = max(dot(V, H0), 0.0);
    vec3  irid   = thinFilmIridescence(VdotH0, u_filmThick, u_filmIOR);

    // Fresnel-weight: iridescence is most visible at grazing angles (F→1)
    float fresnelEdge = F_Schlick(max(dot(frame.N, V), 0.0), F0);
    // Modulate iridescence strength: subtle at centre, vivid at edges
    vec3  iridContrib = irid * fresnelEdge * 0.12;

    // ── Combine ───────────────────────────────────────────────────────────────
    vec3 col = specular + iridContrib;

    // ── Vignette ──────────────────────────────────────────────────────────────
    col *= vignetteSpecular(uv);

    // ── Alpha: luminance-driven, capped for glass translucency ────────────────
    float luma  = dot(col, vec3(0.2126, 0.7152, 0.0722));  // Rec. 709 coefficients
    float alpha_out = clamp(luma * 2.2, 0.0, 1.0) * 0.82;

    // Premultiplied alpha output
    fragColor = vec4(col * alpha_out, alpha_out);
}`;

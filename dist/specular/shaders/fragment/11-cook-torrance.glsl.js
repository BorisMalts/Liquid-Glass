/*!
 * Liquid Glass PRO · v4.1.0 — specular/shaders/fragment/11-cook-torrance (§15.1 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
export const SPEC_COOK_TORRANCE = /* glsl */ `// ════════════════════════════════════════════════════════════════════════════
// §15.J  Full Cook-Torrance BRDF evaluation for one light
//
//  f_r(l,v) = D(h) · F(v,h) · V(l,v)  +  f_ms(l,v)
//           ──────────────────────────
//            single-scatter specular     multi-bounce correction
//
//  Returns radiance contribution L_out = f_r · NdotL · lightColour.
// ════════════════════════════════════════════════════════════════════════════

/**
 * Evaluates the full Cook-Torrance BRDF for a single directional light.
 *
 * @param  V         View direction (view space, normalised)
 * @param  L         Light direction (view space, normalised)
 * @param  frame     SurfaceFrame at this fragment
 * @param  alpha     Roughness²
 * @param  aniso     Anisotropy [0,1]
 * @param  F0        Fresnel at normal incidence (scalar, for glass ≈ 0.04)
 * @param  lColour   RGB light colour and intensity
 * @param  lightPos  UV-space light position (for area light calculation)
 * @param  fragUV    Fragment UV (for area light distance)
 * @return           Outgoing radiance contribution
 */
vec3 brdf_cookTorrance(vec3 V, vec3 L, SurfaceFrame frame,
                       float alpha, float aniso, float F0,
                       vec3 lColour, vec2 lightPos, vec2 fragUV) {
    float NdotL = max(dot(frame.N, L), 0.0);
    float NdotV = max(dot(frame.N, V), 1e-4);
    if (NdotL < 1e-5) return vec3(0.0);

    vec3  H     = safeNorm(V + L);
    float NdotH = max(dot(frame.N, H), 0.0);
    float VdotH = max(dot(V, H), 0.0);

    // ── Area light roughness modification ─────────────────────────────────────
    float lightRadius = 0.08 * (1.0 - u_hover * 0.6);   // focused on hover
    float lightDist   = length(fragUV - lightPos);
    vec2  areaResult  = areaLightRoughness(alpha, lightRadius, lightDist);
    float alphaEff    = areaResult.x;
    float normFactor  = areaResult.y;

    // ── D: Anisotropic GGX NDF ─────────────────────────────────────────────────
    float D = D_GGX_aniso(H, frame, alphaEff, aniso) * normFactor * normFactor;

    // ── F: Schlick Fresnel ─────────────────────────────────────────────────────
    float F = F_Schlick(VdotH, F0);

    // ── V: Height-correlated Smith GGX (anisotropic) ──────────────────────────
    float Vis = V_SmithGGX_aniso(V, L, frame, alphaEff, aniso);

    // ── Single-scatter specular term ───────────────────────────────────────────
    float singleSpec = D * F * Vis;

    // ── Kulla-Conty multi-bounce (energy compensation) ────────────────────────
    // The F0 colour is F0·(1−F_avg) for the multi-bounce Fresnel tint.
    // F_avg(F0) ≈ F0 + (1−F0)·0.04762  (Kulla-Conty Eq. 12)
    float Favg  = F0 + (1.0 - F0) * 0.04762;
    float ms    = f_multiScatter(NdotL, NdotV, alphaEff);
    float msF   = Favg * Favg * ms;   // multi-bounce is F0-tinted

    float total = singleSpec + msF;

    return lColour * total * NdotL;
}

`;

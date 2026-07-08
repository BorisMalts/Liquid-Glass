/*!
 * Liquid Glass PRO · v4.1.0 — webgl/shaders/fragment/12-main (§6.0 GLSL)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

export const FRAG_MAIN = /* glsl */`// ════════════════════════════════════════════════════════════════════════════
// §J  Main fragment program
// ════════════════════════════════════════════════════════════════════════════

void main() {
    vec2  uv  = v_uv;
    // Aspect-ratio-corrected UV for scale-invariant caustic patterns
    float ar  = u_res.x / max(u_res.y, 1.0);
    vec2  uvA = vec2(uv.x * ar, uv.y);

    // ── 1. Surface normal ─────────────────────────────────────────────────────
    // Derived from animated noise; drives all refraction / reflection terms.
    vec3 N = surfaceNormal(uv);

    // ── 2. Chromatic refraction — Sellmeier dispersion ────────────────────────
    // Per-channel background sample using physically accurate IOR per glass type.
    // Returns black if background texture is not yet ready.
    // §v4.1: Frosted variants replace sharp refraction with scatter-blur.
    vec3 refractedBg;
    if (u_frostedAmount > 0.02) {
        // Frosted: blend between sharp chromatic refraction and scatter-blur
        // The mix is frostedAmount-weighted so partial frost gives haze gradient.
        vec3 sharpRefract  = chromaticRefraction(uv, N);
        vec3 scatterRefract = frostedScatterRefraction(uv, N);
        refractedBg = mix(sharpRefract, scatterRefract, u_frostedAmount);
    } else {
        refractedBg = chromaticRefraction(uv, N);
    }

    // §v4.1: Beer-Lambert chromatic absorption
    // Attenuates refracted background by the glass colorant absorption spectrum.
    if (u_bgReady > 0.5 && u_tintStrength > 0.001) {
        refractedBg = beerLambertTransmit(refractedBg);
    }

    // ── 3. Fresnel factor ─────────────────────────────────────────────────────
    // F0 is derived from the Sellmeier reference IOR (green channel) rather
    // than the uniform u_ior, for consistency with the dispersion model.
    float iorG = sellmeier(0.550);   // Green channel IOR — reference wavelength
    float f0ref = pow((iorG - 1.0) / (iorG + 1.0), 2.0);   // F0 from Sellmeier n_G
    vec2  centered = uv * 2.0 - 1.0;
    vec3  Nfull    = normalize(vec3(
        centered * 0.55 + u_tilt * 0.30,
        max(0.001, sqrt(1.0 - dot(centered * 0.55, centered * 0.55)))
    ));
    float fr = schlick(max(dot(Nfull, vec3(0, 0, 1)), 0.0), f0ref);

    // ── 4. Environment reflection ─────────────────────────────────────────────
    vec3 envRefl = environmentReflection(uv, N, fr);

    // ── 5. Improved Voronoi caustic base ──────────────────────────────────────
    // Six-octave composite with PCG2D hash, domain warping, F2−F1 distance,
    // per-cell depth variation, and rotation-staggered grids.
    // 1.7 power concentrates energy into bright caustic filaments.
    // §v4.1: u_causticScale and u_causticTint applied per variant.
    float cBase = pow(caustic(uvA), 1.7) * u_causticScale;

    // ── 6. Chromatic caustic — physically-based spectral splitting ────────────
    // Per-channel caustic UV offsets derived from Sellmeier Δn, not fixed values.
    // RGB split magnitude scales with actual glass dispersion (SF11 >> BK7).
    // §v4.1: Tinted with per-variant causticTint colour.
    vec3 chromCaustic = chromaticCaustic(uvA) * u_causticScale * u_causticTint;

    // ── 7. Specular highlight ─────────────────────────────────────────────────
    vec2  lightPos = vec2(0.22, 0.18)
                   + u_mouse * 0.28 * u_hover
                   + u_tilt  * 0.12;
    float sd = length(uv - lightPos);

    float specular =
          pow(max(0.0, 1.0 - sd * 2.1),  7.0) * 0.95   // Broad soft glow
        + pow(max(0.0, 1.0 - sd * 5.8), 16.0) * 0.55   // Tight sharp highlight
        + pow(max(0.0, 1.0 - length(uv - (1.0 - lightPos)) * 4.0), 11.0) * 0.14;

    // ── 8. Fresnel edge glow ──────────────────────────────────────────────────
    float edgeR   = length(centered);
    float topEdge = pow(smoothstep(0.15, 0.0, uv.y), 2.3) * 0.65;
    float botEdge = pow(smoothstep(0.90, 1.0, uv.y), 3.0) * 0.12;
    float lftEdge = pow(smoothstep(0.12, 0.0, uv.x), 2.0) * 0.32;
    float edgeGlow = topEdge + lftEdge + botEdge + fr * 0.28;

    // ── 9. Thin-film iridescence ──────────────────────────────────────────────
    // Phase offsets (0, 2.0944, 4.1888) = 120° = Born & Wolf λR/λG/λB spacing
    float iridMask = smoothstep(0.25, 1.08, edgeR);
    float iridAng  = atan(centered.y, centered.x);
    vec3  irid = (0.5 + 0.5 * cos(
        iridAng * 2.0
        + u_time  * 0.30
        + u_tilt.x * 3.14159
        + vec3(0.0, 2.0944, 4.1888)
    )) * iridMask * 0.08;

    // ── 10. Prismatic edge caustics ───────────────────────────────────────────
    float prismBand  = smoothstep(0.80, 0.92, edgeR)
                     * smoothstep(1.06, 0.92, edgeR);
    vec3  prismColor = (0.5 + 0.5 * cos(
        iridAng  * 4.0
        + u_time * 0.55
        + vec3(0.0, 2.0944, 4.1888)
    )) * prismBand * 0.16;

    // ── 11. Surface undulation ────────────────────────────────────────────────
    float wave = gnoise(uv * 5.5 + u_time * 0.11) * 0.013
               + gnoise(uv * 9.2 - u_time * 0.08) * 0.006;

    // ── 12. Composition ───────────────────────────────────────────────────────
    // §v4.1: Caustic tint already applied above; causticTint shifts hue of
    // cBase white contribution to match glass colour.
    vec3 causticColour = u_causticTint * cBase * 0.52;
    vec3 col = causticColour + chromCaustic * 0.5;
    col += vec3(specular) + vec3(edgeGlow);
    col += irid + prismColor + vec3(wave);

    // §v4.1: Mirror boost — amplify environment reflection before adding
    vec3 envReflBoosted = envRefl * (1.0 + u_mirrorStrength * 5.5);
    col += envReflBoosted;

    // ── 13. Background refraction blend ──────────────────────────────────────
    // §v4.1: Mirror variant reduces transmission (refractedBg contribution).
    // At mirrorStrength=1: refraction is fully replaced by reflection.
    float transmitFactor = 1.0 - u_mirrorStrength * 0.92;
    float refrBlend = smoothstep(0.0, 0.18, 1.0 - edgeR)
                    * 0.28 * u_bgReady * transmitFactor;
    col = mix(col, refractedBg, refrBlend);

    // §v4.1: Smoke density — uniform broadband absorption after all blending
    // Simulates soot/metallic-oxide absorption not captured by Beer-Lambert tint.
    col *= (1.0 - u_smokeDensity * 0.68);

    // ── 14. Vignette mask ─────────────────────────────────────────────────────
    float vx = smoothstep(0.0, 0.05, uv.x) * smoothstep(1.0, 0.95, uv.x);
    float vy = smoothstep(0.0, 0.05, uv.y) * smoothstep(1.0, 0.95, uv.y);
    col *= vx * vy;

    // ── 15. Alpha derivation ──────────────────────────────────────────────────
    float luma  = dot(col, vec3(0.299, 0.587, 0.114));
    float alpha = clamp(luma * 1.85, 0.0, 1.0);

    // Premultiplied RGBA output
    fragColor = vec4(col, alpha * 0.88);
}`;


/*!
 * Liquid Glass PRO · v4.1.0 — index (public entry point)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

// liquid-glass-pro.js · v4.1.0
//
// Physically-based liquid glass rendering for the web, built on WebGL2 + CSS backdrop-filter.
//
// ── How it works ──────────────────────────────────────────────────────────────
//
//   1. html2canvas captures the page at reduced resolution and uploads the
//      result to a WebGL2 texture (TEXTURE_UNIT1, sampler u_background).
//
//   2. The fragment shader derives a surface normal from animated gradient noise
//      and displaces the background UV via Snell's law — independently for each
//      RGB channel using physically accurate Sellmeier IOR values.
//
//   3. An SVG feDisplacementMap on the .lg-outer wrapper adds chromatic
//      aberration at the DOM level, running in parallel with the WebGL pass.
//
//   4. A full Cook-Torrance PBR specular highlight is rendered into a dedicated
//      .lg-specular-canvas per element:
//        · Anisotropic GGX NDF              (Burley 2012,  αT=0.0483, αB=0.0331)
//        · Smith height-correlated visibility (Heitz 2014)
//        · Schlick Fresnel — F0 derived from Sellmeier n(550 nm), not fixed 0.04
//        · Kulla-Conty multi-bounce energy compensation (2017)
//        · Thin-film iridescence             (Born & Wolf 1999, d=320 nm, n=1.38)
//        · Three-light config: L0 cursor key · L1 fill · L2 back-scatter
//
//   5. Six octaves of Voronoi caustics (PCG2D hash · F2−F1 distance field ·
//      domain warping · rotation stagger) produce caustic patterns that are
//      physically consistent with the Sellmeier dispersion of the active glass.
//
//   6. Semi-implicit Euler spring physics drives cursor tracking and device tilt
//      with three presets: cursor (stiff, snappy) · hover (soft) · tilt (inertial).
//
//   7. Houdini CSS custom properties (--lg-mx, --lg-my, --lg-tx …) are written
//      every rAF frame, enabling smooth browser-native CSS transitions.
//
//   8. Twelve glass surface variants (clear · frosted · smoke · tinted-blue ·
//      tinted-violet · tinted-amber · mirror · ice · bronze · emerald · rose ·
//      obsidian) define physical optical character via Beer-Lambert absorption,
//      Fresnel F0, scatter amount, and per-variant caustic tinting — all driven
//      by GLSL uniforms uploaded per frame, switchable at runtime without reinit.
//
// ── What's new in v4.1.0 ──────────────────────────────────────────────────────
//
//   Glass Variant System
//     Twelve physically-grounded surface presets derived from real optical
//     constants (Schott catalogue 2023, Warren & Brandt 2008, Palik 1998).
//     Each variant encodes: IOR · Beer-Lambert tintRGB · tintStrength · frosted ·
//     mirror · smokeDensity · causticScale · causticTint · blurPx · CSS overrides.
//     Switch at runtime: setGlassVariant('obsidian') takes effect in one rAF frame.
//
//   Beer-Lambert chromatic absorption  (§H2)
//     Per-channel absorption: σ_ch = (1 − tintRGB_ch) · tintStrength · 3.5
//     Applied to refracted background before caustic compositing so tinted-glass
//     caustic filaments appear in the glass's own hue.
//
//   Frosted scatter refraction  (§H3)
//     Multi-scale noise UV jitter (11× + 27× frequency, independent drift axes)
//     approximates sub-surface scattering in ground glass.  Three-tap average
//     simulates the scatter lobe integral.  Blended with sharp refraction by
//     frostedAmount so partial frost gives a continuous haze gradient.
//
//   Mirror reflection mode  (§12 composition pass)
//     u_mirrorStrength collapses transmission (refractedBg · (1−mirror·0.92))
//     and amplifies environmentReflection() by a factor of up to 6.5×.
//     IOR 1.785 (SF11) yields F0 ≈ 0.079 — 2× standard glass — for crisp Fresnel.
//
//   Smoke density uniform  (§12 composition pass)
//     Broadband post-composite darkening: col *= (1 − smokeDensity · 0.68).
//     Simulates Fe²⁺/Fe³⁺ absorption not captured by the Beer-Lambert tint term.
//
//   CSS variant override layer  (§8)
//     Each variant class (.lg-v-clear … .lg-v-obsidian) overrides backdrop-filter
//     and background gradient for accurate first-frame appearance before the WebGL
//     pass renders.  Hover/active states per variant class.
//
//   _buildSpecularCSS() refactored into §16
//     CSS fallback specular geometry analytically derived from GGX NDF α=0.04,
//     anisotropy=0.35: three lobes (GGX peak, fill shoulder, back-scatter) with
//     colours matching L0/L1/L2 from §15.K.  Thin-film CSS fallback phase offsets
//     derived from Born & Wolf OPD equation at FILM_THICKNESS=320 nm.
//
// ── What's new in v4.0.0 ──────────────────────────────────────────────────────
//
//   Sellmeier dispersion replaces Cauchy approximation
//     Equation: n²(λ) = 1 + Σ Bⱼλ²/(λ²−Cⱼ)   (three resonance terms)
//     Cauchy over-estimated blue-channel dispersion by ~2.5×. Sellmeier accuracy:
//     RMS error < 0.0001 vs spectrometer across the full visible range 380–750 nm.
//
//   Five optical glass types from the Schott catalogue 2023
//     BK7    Abbe V=64.17  Δn=0.0110  standard optical, camera lenses, cover glass
//     SF11   Abbe V=25.76  Δn=0.0408  heavy flint, crystal, Swarovski, prisms
//     NK51A  Abbe V=81.61  Δn=0.0054  fluorite crown, APO lenses, near-zero fringing
//     NBK10  Abbe V=67.90  Δn=0.0084  thin crown, architectural window glass
//     F2     Abbe V=36.43  Δn=0.0227  flint, achromatic doublets, vintage optics
//
//   Rebuilt Voronoi caustic engine
//     · PCG2D integer hash (Jarzynski & Olano, JCGT 2020) — no sin/cos,
//       no lattice bias, period 2³² per axis, ~30% faster than trig hash
//     · F2−F1 distance field — caustic filaments peak at cell boundaries,
//       eliminates the cell-centre pillow artefact present in F1
//     · Domain warping (IQ "Warped domain Voronoi") — breaks square lattice
//       regularity at all frequencies before Voronoi evaluation
//     · Six octaves with 11.25° (π/16) rotation stagger per octave index
//     · Per-cell independent animation: 4 PCG2D scalars (rx, ry, px, py)
//       + one depth scalar — no two cells ever move in synchrony
//
//   Physical chromatic caustics
//     Per-channel RGB caustic UV offset is now derived from the Sellmeier Δn
//     of the active glass type — SF11 shows 3.7× wider spectral splitting than BK7.
//
//   Full Cook-Torrance PBR specular pass  (§15)
//     Dedicated .lg-specular-canvas per element, rendered by a shared WebGL2
//     context.  Anisotropic GGX NDF + Smith height-correlated visibility +
//     Schlick Fresnel + Kulla-Conty multi-bounce + thin-film iridescence.
//     Three area lights with Karis (2013) representative-point roughness modification.
//
//   Fresnel F0 derived from Sellmeier n(550 nm) — was fixed constant 0.04 in v3.
//   getOptions() returns a live reference — glass type can be changed at runtime
//   without calling destroyLiquidGlass() / initLiquidGlass() again.
//
// ── Render loop frame budget  (at 60 fps, high-tier GPU) ────────────────────
//
//   Every frame     Spring integration (5 springs × N elements) + CSS writes
//   Every 2 frames  Caustic WebGL pass          (~30 fps, imperceptible at these frequencies)
//   Every frame     Specular WebGL pass          (60 fps, cursor tracking requires full rate)
//   Every 8 frames  domRect refresh              (~7.5 Hz, avoids layout thrash)
//   Every 30 frames data-lg-refract attr sync    (~2 Hz, CSS only, no urgency)
//   Idle / scroll   html2canvas background capture  (debounced 150 ms on scroll)
//
// ── Degradation tiers ────────────────────────────────────────────────────────
//
//   high  — desktop + Apple Silicon: full feature set, max aberration,
//            background refraction, 6-octave caustics, PBR specular
//   mid   — Adreno 5xx/6xx, Mali-G57/G75: caustics + specular,
//            chromatic aberration at ½ strength, no background refraction
//   low   — legacy mobile (Adreno 2xx-4xx, Mali-2/4, PowerVR SGX):
//            CSS-only (backdrop-filter + SVG no-op stubs), no WebGL
//
// ── IntersectionObserver viewport gate ──────────────────────────────────────
//
//   Off-screen elements are excluded from all GPU work entirely.
//   The IO fires at threshold:0 so the gate activates the moment any pixel
//   of a tracked element enters or leaves the viewport, with no root margin.
//   This eliminates GPU cost for glass elements scrolled out of view.
//
// ── Limitations ───────────────────────────────────────────────────────────────
//
//   Refraction is a snapshot, not a live compositor feed. html2canvas fails on
//   cross-origin <iframe>, CDN images without CORS headers and external fonts.
//   The background is automatically re-captured every bgCaptureInterval ms,
//   on scroll (debounced 150 ms) and on viewport resize.
//
// ── Dependencies ──────────────────────────────────────────────────────────────
//
//   html2canvas ^1.4.1 — must be loaded before initLiquidGlass() is called.
//   WebGL2 — required for caustics and refraction. On failure the system
//   degrades automatically: high → mid → low CSS-only tier.
//
// ── Quick start ───────────────────────────────────────────────────────────────
//
//   import {
//     initLiquidGlass,
//     setGlassType,
//     setGlassVariant,
//     refreshBackground,
//   } from './liquid-glass-pro.js'
//
//   initLiquidGlass({
//     glassType:          'BK7',      // 'BK7' | 'SF11' | 'NK51A' | 'NBK10' | 'F2'
//     glassVariant:       'clear',    // see GLASS_VARIANTS for all 12 options
//     ior:                1.45,
//     refractionStrength: 0.035,
//     bgCaptureInterval:  2000,
//   })
//
//   <div class="lg lg-card lg-interactive">hello, glass</div>
//
//   // Switch glass material and variant at runtime — no reinit required:
//   setGlassType('SF11')             // heavy flint — vivid rainbow splitting
//   setGlassVariant('tinted-amber')  // cobalt-amber Beer-Lambert absorption
//   setGlassVariant('obsidian')      // near-black, volcanic glass, purple sheen
//   refreshBackground()              // immediate re-capture with new IOR values
//
// ── Module structure ──────────────────────────────────────────────────────────
//
//   src/
//     index.ts                  — this file: public API surface
//     types/typedefs.ts         — §0   JSDoc type definitions
//     constants/                — §1   defaults, limits, spring presets, §15.0 specular
//     state/                    — §1   options, runtime singleton, element registry,
//                                       WebGL quota counter, IntersectionObserver ref
//     variants/                 — §1.5 GLASS_VARIANTS presets
//     gpu/                      — §2   GPU tier detection
//     physics/                  — §3   spring physics (semi-implicit Euler)
//     houdini/                  — §4   Houdini CSS custom properties
//     background/               — §5   html2canvas capture engine
//     webgl/                    — §6   caustics + refraction render engine
//       shaders/vertex.glsl.ts  — §6.0 fullscreen-triangle vertex shader
//       shaders/fragment/       — §6.0 fragment shader, one GLSL chunk per §A–§J
//     svg/                      — §7   SVG filter bank
//     css/                      — §8   CSS injection + §16 specular CSS fallback
//     sensors/                  — §9   device orientation tracking
//     elements/                 — §10  per-element attach / detach
//     loop/                     — §11  requestAnimationFrame render loop
//     observer/                 — §12  MutationObserver element discovery
//     api/                      — §13  public API functions
//     dom/                      — §13  DOM factories (grain, wrapper, reply quote)
//     adapters/                 — §14  React hook adapter
//     specular/                 — §15  Cook-Torrance PBR specular pass
//       shaders/fragment/       — §15.1 GLSL, one chunk per §15.A–§15.M

// ── §13  Public API ───────────────────────────────────────────────────────────
export { initLiquidGlass } from './api/init.js';
export { destroyLiquidGlass } from './api/destroy.js';
export { attachElement, detachElement } from './api/attach-element.js';
export { refreshBackground, isRefractionActive } from './api/background.js';
export { getGpuTier } from './api/gpu.js';
export { setGlassType } from './api/glass-type.js';
export { setGlassVariant, getGlassVariants } from './api/glass-variant.js';
export { getOptions } from './api/options.js';
export { version } from './api/version.js';

// ── §13  DOM factories ────────────────────────────────────────────────────────
export { wrapWithDistortion } from './dom/wrap-distortion.js';
export { createGrainLayer } from './dom/grain-layer.js';
export { createReplyQuote } from './dom/reply-quote.js';

// ── §14  React hook adapter ───────────────────────────────────────────────────
export { useLiquidGlass } from './adapters/react.js';

// ── §15  Cook-Torrance PBR specular pass ──────────────────────────────────────
export { initSpecularPass } from './specular/init.js';
export { attachSpecularCanvas } from './specular/attach-canvas.js';
export { renderSpecularGL } from './specular/render.js';
export { buildSpecularCSS } from './specular/css.js';
export { destroySpecularPass } from './specular/destroy.js';

// ── §0  Public types ──────────────────────────────────────────────────────────
export type {
    GpuTier,
    LGOptions,
    SpringState,
    SpringConfig,
    ElementState,
    GlassVariantKey,
    GlassVariantDef,
    LGState,
    SpecState,
} from './types/typedefs.js';

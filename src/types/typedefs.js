/*!
 * Liquid Glass PRO · v4.1.0 — types/typedefs (§0 JSDoc type definitions)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

// ─────────────────────────────────────────────────────────────────────────────
// §0  JSDoc type definitions
//
//  These types are used throughout the module for IDE intellisense and static
//  analysis (e.g. via VS Code + TypeScript "checkJs" mode).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Three-tier GPU capability classification derived from WebGL renderer string
 * inspection and mobile user-agent analysis.
 *
 *   'low'  — old mobile GPUs (Adreno 2xx–4xx, Mali-2/4, PowerVR SGX)
 *             → CSS-only mode, no WebGL caustics, no refraction.
 *
 *   'mid'  — mid-range mobile GPUs (Adreno 5xx–6xx, Mali-G57/G75)
 *             → WebGL caustics enabled, chromatic aberration at ½ strength.
 *
 *   'high' — desktop and Apple silicon GPUs
 *             → Full feature set, maximum aberration, background refraction.
 *
 * @typedef {'low'|'mid'|'high'} GpuTier
 */

/**
 * Configuration options accepted by initLiquidGlass() and stored in _opts.
 * All properties are optional; missing values fall back to _defaults.
 *
 * @typedef {Object} LGOptions
 *
 * @property {number}  [ior=1.45]
 *   Index of refraction of the virtual glass medium.
 *   Physical range: 1.0 (air) → 1.9 (dense flint glass).
 *   Values near 1.0 produce minimal bending; higher values exaggerate the
 *   displacement of the background texture in the refraction pass.
 *
 * @property {number}  [refractionStrength=0.035]
 *   Scalar applied to the Snell-derived UV displacement vector.
 *   Increase for a more dramatic "fish-eye" lens effect; decrease for subtlety.
 *
 * @property {number}  [aberrationStrength=1.6]
 *   Pixel magnitude of the SVG feDisplacementMap chromatic-aberration filter
 *   on 'high'-tier GPUs. Half this value is used on 'mid' tier.
 *
 * @property {number}  [bgCaptureInterval=600]
 *   Milliseconds between automatic background re-captures.
 *   Lower values keep the refracted texture fresher but increase CPU load
 *   (each html2canvas call is ~10–40 ms on a modern machine at scale 0.35).
 *
 * @property {number}  [bgCaptureScale=0.35]
 *   Resolution scale factor passed to html2canvas.
 *   0.35 means the capture canvas is 35% of viewport dimensions, yielding
 *   ~8× fewer pixels than full resolution — a major performance saving.
 *   Raise toward 1.0 for crisper refraction at the cost of capture speed.
 *
 * @property {boolean} [caustics=true]
 *   Master switch for the WebGL2 Voronoi caustic/refraction pass.
 *   When false, only the CSS backdrop-filter layer is rendered.
 *
 * @property {boolean} [grain=true]
 *   When true a film-grain <div class="lg-grain"> overlay is injected inside
 *   each glass element to break up banding in the caustic gradient.
 *
 * @property {boolean} [iridescence=true]
 *   Enables the thin-film interference CSS conic-gradient animation (::after
 *   pseudo-element). Disable if the rainbow shimmer is too distracting.
 *
 * @property {boolean} [breathe=true]
 *   Enables the 'lg-breathe' border-radius keyframe animation that morphs the
 *   glass outline, simulating a slow viscous liquid surface tension.
 *
 * @property {string}  [selector='.lg']
 *   CSS selector used to auto-discover glass elements in the DOM.
 *   Change to a more specific selector for scoped component usage.
 */

/**
 * Single-axis spring state. All three fields are mutated in-place each frame
 * by _stepSpring() to advance the spring toward its target value.
 *
 * @typedef {Object} SpringState
 * @property {number} value    - Current interpolated value.
 * @property {number} velocity - Current velocity (units per second).
 * @property {number} target   - Desired resting value the spring pulls toward.
 */

/**
 * Per-element runtime state stored in the _elements WeakMap.
 * Created once in _attach() and cleaned up in _detach().
 *
 * @typedef {Object} ElementState
 *
 * @property {HTMLCanvasElement}        canvas
 *   The offscreen caustic canvas injected as the first child of the .lg element.
 *   Receives drawImage() output from the shared WebGL back-buffer each frame.
 *
 * @property {CanvasRenderingContext2D} ctx2d
 *   2D context of the caustic canvas; used only for drawImage() blitting.
 *
 * @property {ResizeObserver}           ro
 *   Observes the .lg element's content rect; resizes canvas.width/height when
 *   the element's layout dimensions change.
 *
 * @property {SpringState}              springX
 *   Horizontal cursor position (0–1 across element width). Drives --lg-mx and
 *   the u_mouse.x uniform in the GLSL shader.
 *
 * @property {SpringState}              springY
 *   Vertical cursor position (0–1 across element height). Drives --lg-my and
 *   the u_mouse.y uniform.
 *
 * @property {SpringState}              hoverSpring
 *   0 = pointer outside element, 1 = pointer inside. Animates the caustic
 *   canvas opacity, specular hotspot intensity, and the mouse-warp term in
 *   surfaceNormal(). Uses softer spring constants than cursor tracking.
 *
 * @property {SpringState}              tiltX
 *   Horizontal tilt angle (−1 to +1). Driven by pointer position while hovered
 *   and by device orientation (gyroscope) while idle. Feeds CSS perspective
 *   rotateY and the u_tilt.x shader uniform.
 *
 * @property {SpringState}              tiltY
 *   Vertical tilt angle (−1 to +1). Mirrors tiltX on the Y axis; drives
 *   CSS rotateX and u_tilt.y.
 *
 * @property {number}                   width
 *   Physical pixel width of the caustic canvas (logical CSS px × DPR).
 *
 * @property {number}                   height
 *   Physical pixel height of the caustic canvas.
 *
 * @property {boolean}                  hovered
 *   True when the pointer is currently inside the element's bounding box.
 *   Used to switch between cursor-driven tilt and gyroscope-driven tilt.
 *
 * @property {number}                   dpr
 *   Clamped device pixel ratio (max 2) at the time the element was attached.
 *
 * @property {DOMRect}                  domRect
 *   Cached result of getBoundingClientRect(). Updated every 4 rAF frames to
 *   avoid layout thrash; used to compute screen-space UV offsets for refraction.
 *
 * @property {Function}                 pointerMove
 *   Bound pointermove handler stored here so it can be removed in _detach().
 *
 * @property {Function}                 pointerEnter
 *   Bound pointerenter handler.
 *
 * @property {Function}                 pointerLeave
 *   Bound pointerleave handler.
 */

export {};

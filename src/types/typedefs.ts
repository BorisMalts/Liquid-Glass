/*!
 * Liquid Glass PRO · v4.1.0 — types/typedefs (§0 type definitions)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */

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
 */
export type GpuTier = 'low' | 'mid' | 'high';

/**
 * Configuration options accepted by initLiquidGlass() and stored in _opts.
 * All properties are optional at the call site (Partial<LGOptions>); missing
 * values fall back to _defaults, so the live _opts object is always complete.
 */
export interface LGOptions {
    /** Index of refraction of the virtual glass medium (1.0 air → 1.9 dense flint). */
    ior: number;
    /** Scalar applied to the Snell-derived UV displacement vector. */
    refractionStrength: number;
    /** Pixel magnitude of the SVG feDisplacementMap chromatic aberration ('high' tier). */
    aberrationStrength: number;
    /** Milliseconds between automatic background re-captures. */
    bgCaptureInterval: number;
    /** Resolution scale factor passed to html2canvas (0..1). */
    bgCaptureScale: number;
    /** Master switch for the WebGL2 Voronoi caustic/refraction pass. */
    caustics: boolean;
    /** Inject a film-grain overlay inside each glass element. */
    grain: boolean;
    /** Enable the thin-film interference conic-gradient animation. */
    iridescence: boolean;
    /** Enable the 'lg-breathe' border-radius morph animation. */
    breathe: boolean;
    /** CSS selector used to auto-discover glass elements in the DOM. */
    selector: string;
    /** Base white tint opacity. */
    glassOpacity: number;
    /** backdrop-filter saturation %. */
    glassSaturation: number;
    /**
     * Glass material type — controls Sellmeier dispersion coefficients.
     * Accepts string name ('BK7' | 'SF11' | 'NK51A' | 'NBK10' | 'F2')
     * or numeric index (0–4).
     */
    glassType: string | number;
    /** Glass surface variant — one of the GLASS_VARIANTS keys. */
    glassVariant: string;
}

/**
 * Single-axis spring state. All three fields are mutated in-place each frame
 * by _stepSpring() to advance the spring toward its target value.
 */
export interface SpringState {
    /** Current interpolated value. */
    value: number;
    /** Current velocity (units per second). */
    velocity: number;
    /** Desired resting value the spring pulls toward. */
    target: number;
}

/** Spring constants tuple controlling the character of a spring animation. */
export interface SpringConfig {
    stiffness: number;
    damping: number;
    mass: number;
}

/**
 * Per-element runtime state stored in the _elements WeakMap.
 * Created once in _attach() and cleaned up in _detach().
 */
export interface ElementState {
    /** Offscreen caustic canvas injected as the first child of the .lg element. */
    canvas: HTMLCanvasElement;
    /** 2D context of the caustic canvas; used only for drawImage() blitting. */
    ctx2d: CanvasRenderingContext2D;
    /** Observes the element's content rect; resizes the canvas on layout change. */
    ro: ResizeObserver;
    /** Horizontal cursor position spring (0–1 across element width). */
    springX: SpringState;
    /** Vertical cursor position spring (0–1 across element height). */
    springY: SpringState;
    /** Hover intensity spring: 0 = pointer outside, 1 = inside. */
    hoverSpring: SpringState;
    /** Horizontal tilt spring (−1..+1); drives rotateY and u_tilt.x. */
    tiltX: SpringState;
    /** Vertical tilt spring (−1..+1); drives rotateX and u_tilt.y. */
    tiltY: SpringState;
    /** Physical pixel width of the caustic canvas (CSS px × DPR). */
    width: number;
    /** Physical pixel height of the caustic canvas. */
    height: number;
    /** True while the pointer is inside the element's bounding box. */
    hovered: boolean;
    /** Clamped device pixel ratio (max 2) at attach time. */
    dpr: number;
    /** Cached getBoundingClientRect() result, refreshed every 8 rAF frames. */
    domRect: DOMRect;
    /** Bound pointermove handler (stored for removal in _detach()). */
    pointerMove: (e: PointerEvent) => void;
    /** Bound pointerenter handler. */
    pointerEnter: () => void;
    /** Bound pointerleave handler. */
    pointerLeave: () => void;
    /** 2D context of the .lg-specular-canvas (§15) or null when unavailable. */
    specCtx: CanvasRenderingContext2D | null;
    /** The specular canvas element itself (for resize + cleanup). */
    specCanvas: HTMLCanvasElement | null;
}

/** Valid keys of the GLASS_VARIANTS preset table (§1.5). */
export type GlassVariantKey =
    | 'clear' | 'frosted' | 'smoke'
    | 'tinted-blue' | 'tinted-violet' | 'tinted-amber'
    | 'pearl' | 'ice' | 'bronze'
    | 'emerald' | 'cyan' | 'rose' | 'mauve' | 'obsidian';

/**
 * Complete optical + visual character of a glass surface variant.
 * Parameters map directly onto the GLSL uniforms of §6's fragment shader.
 */
export interface GlassVariantDef {
    label: string;
    cssClass: string;
    ior: number;
    /** Beer-Lambert tint colour, linear RGB 0..1. */
    tintRGB: [number, number, number];
    /** Absorption coefficient scale 0..1. */
    tintStrength: number;
    /** Scatter amount 0..1. */
    frosted: number;
    /** Mirror boost 0..1. */
    mirror: number;
    /** Uniform darkening 0..1. */
    smokeDensity: number;
    /** Caustic intensity multiplier. */
    causticScale: number;
    /** RGB tint for caustics. */
    causticTint: [number, number, number];
    /** CSS backdrop-filter blur in px. */
    blurPx: number;
    /** CSS backdrop-filter saturate %. */
    saturate: number;
    /** CSS backdrop-filter brightness. */
    brightness: number;
    /** CSS rgba() string for the background gradient tint. */
    bgTint: string;
}

/**
 * Global singleton runtime state (§1).
 *
 * Naming conventions:
 *   gl*       — WebGL2 objects (context, program, buffers, textures)
 *   bg*       — Background capture subsystem state
 *   device*   — Physical sensor readings
 *   *Handler  — Event listener references (for cleanup)
 *   *Id       — setInterval / requestAnimationFrame handles
 *   *Ready    — Subsystem initialisation flags
 */
export interface LGState {
    ready: boolean;
    svgReady: boolean;
    houdiniReg: boolean;
    started: boolean;

    observer: MutationObserver | null;
    styleEl: HTMLStyleElement | null;
    svgEl: SVGSVGElement | null;

    rafId: number;

    glBackend: WebGL2RenderingContext | null;
    glCanvas: HTMLCanvasElement | null;
    glProgram: WebGLProgram | null;
    glUniforms: Record<string, WebGLUniformLocation | null>;
    glBuffer: WebGLBuffer | null;
    glStartTime: number;

    bgTexture: WebGLTexture | null;
    bgCanvas: HTMLCanvasElement | null;
    bgCtx: CanvasRenderingContext2D | null;
    bgCaptureId: number;
    bgReady: boolean;
    bgCapturing: boolean;
    bgScrollX: number;
    bgScrollY: number;
    /** Debounce timer handle for the scroll-driven capture refresh (§5). */
    bgScrollDebounce?: number;
    /** Scroll listener reference (§5), stored for removeEventListener. */
    bgScrollHandler?: (() => void) | null;
    /** ResizeObserver on <body> (§5) triggering re-captures on reflow. */
    bgResizeObserver?: ResizeObserver | null;

    deviceTilt: { x: number; y: number };
    orientHandler: ((e: DeviceOrientationEvent) => void) | null;
}

/** Singleton specular GL state (§15.0) — separate from §6 caustic GL state. */
export interface SpecState {
    gl: WebGL2RenderingContext | null;
    canvas: HTMLCanvasElement | null;
    program: WebGLProgram | null;
    uniforms: Record<string, WebGLUniformLocation | null>;
    lut: WebGLTexture | null;
    startTime: number;
}

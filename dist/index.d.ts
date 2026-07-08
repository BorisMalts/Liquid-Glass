/*!
 * Liquid Glass PRO · v4.1.0 — index (public entry point)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
export { initLiquidGlass } from './api/init.js';
export { destroyLiquidGlass } from './api/destroy.js';
export { attachElement, detachElement } from './api/attach-element.js';
export { refreshBackground, isRefractionActive } from './api/background.js';
export { getGpuTier } from './api/gpu.js';
export { setGlassType } from './api/glass-type.js';
export { setGlassVariant, getGlassVariants } from './api/glass-variant.js';
export { getOptions } from './api/options.js';
export { version } from './api/version.js';
export { wrapWithDistortion } from './dom/wrap-distortion.js';
export { createGrainLayer } from './dom/grain-layer.js';
export { createReplyQuote } from './dom/reply-quote.js';
export { useLiquidGlass } from './adapters/react.js';
export { initSpecularPass } from './specular/init.js';
export { attachSpecularCanvas } from './specular/attach-canvas.js';
export { renderSpecularGL } from './specular/render.js';
export { buildSpecularCSS } from './specular/css.js';
export { destroySpecularPass } from './specular/destroy.js';
export type { GpuTier, LGOptions, SpringState, SpringConfig, ElementState, GlassVariantKey, GlassVariantDef, LGState, SpecState, } from './types/typedefs.js';

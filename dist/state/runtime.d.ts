/*!
 * Liquid Glass PRO · v4.1.0 — state/runtime (§1 — global singleton state)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import type { LGState } from '../types/typedefs.js';
/**
 * Global singleton runtime state.
 *
 * Naming conventions used in this object:
 *   gl*       — WebGL2 objects (context, program, buffers, textures)
 *   bg*       — Background capture subsystem state
 *   device*   — Physical sensor readings
 *   *Handler  — Event listener function references (for cleanup)
 *   *Id       — setInterval / requestAnimationFrame handles
 *   *Ready    — Boolean flags indicating subsystem initialisation status
 */
export declare const _state: LGState;

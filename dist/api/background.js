/*!
 * Liquid Glass PRO · v4.1.0 — api/background (§13 — refreshBackground / isRefractionActive)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _state } from '../state/runtime.js';
import { _captureBackground } from '../background/capture.js';
/**
 * Forces an immediate background capture outside the regular interval cycle.
 *
 * Call this after:
 *  • A significant DOM mutation (modal open/close, content insertion)
 *  • SPA route navigation where the page content changes substantially
 *  • Any operation that modifies content visible behind glass elements
 *
 * The returned Promise resolves when the capture and texture upload are
 * complete (or immediately if html2canvas is unavailable).
 *
 * @returns {Promise<void>}
 */
export function refreshBackground() { return _captureBackground(); }
/**
 * Returns true if the background refraction texture is populated with at
 * least one successful html2canvas capture.  Before this returns true,
 * the glass effect will show caustics only (no background transmission).
 *
 * @returns {boolean}
 */
export function isRefractionActive() { return _state.bgReady; }

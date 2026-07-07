/*!
 * Liquid Glass PRO · v4.1.0 — css/inject (§8)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _state } from '../state/runtime.js';
import { _buildCSS } from './build-css.js';

/**
 * Injects the generated CSS into a <style> element in <head>.
 * Idempotent — guards against duplicate injection using a stable element ID.
 */
export function _injectCSS() {
    // Use a version-specific style tag id so old injected CSS
    // from previous builds cannot block the new stylesheet.
    const STYLE_ID = 'liquid-glass-pro-style-300';

    // If an older stylesheet exists, remove it explicitly.
    document.getElementById('liquid-glass-pro-style-200')?.remove();

    // Prevent duplicate injection for the current version only.
    if (document.getElementById(STYLE_ID)) return;

    _state.styleEl = Object.assign(document.createElement('style'), {
        id: STYLE_ID,
        textContent: _buildCSS(),
    });

    document.head.appendChild(_state.styleEl);
}

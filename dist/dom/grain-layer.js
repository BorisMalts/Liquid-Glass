/*!
 * Liquid Glass PRO · v4.1.0 — dom/grain-layer (§13)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
/**
 * Creates a detached .lg-grain film-grain overlay element.
 * Returned element must be inserted into a .lg container to take effect.
 * The CSS class 'lg-grain' provides all necessary styling.
 *
 * @returns {HTMLDivElement}
 */
export function createGrainLayer() {
    return Object.assign(document.createElement('div'), { className: 'lg-grain' });
}

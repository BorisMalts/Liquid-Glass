/*!
 * Liquid Glass PRO · v4.1.0 — state/viewport-observer (§1 — IntersectionObserver ref)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
/**
 * Shared IntersectionObserver instance that populates _visibleElements.
 * Created once in _startObserver() with threshold:0 so it fires as soon
 * as a single pixel of a tracked element enters or leaves the viewport.
 * Null before _startObserver() runs — all call sites guard with optional
 * chaining (_ioRef.current?.observe).
 *
 * Held in a ref object so the observer can be reassigned across modules.
 *
 * @type {{ current: IntersectionObserver|null }}
 */
export const _ioRef = { current: null };

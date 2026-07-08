/*!
 * Liquid Glass PRO · v4.1.0 — types/globals (ambient browser globals)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 */

/** Minimal html2canvas signature — the library is loaded globally via <script>. */
type Html2Canvas = (
    element: HTMLElement,
    options?: Record<string, unknown>,
) => Promise<HTMLCanvasElement>;

declare global {
    interface Window {
        /** html2canvas ^1.4.1, loaded before initLiquidGlass() is called. */
        html2canvas?: Html2Canvas;
        /** React 16.8+, accessed dynamically by the useLiquidGlass hook (§14). */
        React?: {
            useEffect?: (effect: () => void | (() => void), deps?: unknown[]) => void;
        };
    }
}

export {};

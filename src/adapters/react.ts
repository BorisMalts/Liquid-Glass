/*!
 * Liquid Glass PRO · v4.1.0 — adapters/react (§14 — useLiquidGlass hook)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _state } from '../state/runtime.js';
import { _opts } from '../state/options.js';
import { initLiquidGlass } from '../api/init.js';
import { _attach } from '../elements/attach.js';
import { _detach } from '../elements/detach.js';

// ─────────────────────────────────────────────────────────────────────────────
// §14  React hook adapter
//
//  useLiquidGlass() is a React hook that attaches the glass effect to a ref
//  and automatically detaches it when the component unmounts.
//
//  Design notes:
//  • React is not a hard dependency — it is accessed via window.React to
//    support both CJS and ESM React installations without a bundler.
//  • The hook uses useEffect with a cleanup return to mirror the attach/detach
//    lifecycle, which is idiomatic React for imperative DOM integrations.
//  • The ref dependency array ([ref]) ensures the effect re-runs if the ref
//    object itself changes, though in practice this is rare.
//  • SSR is guarded by the typeof window === 'undefined' check at the top,
//    which makes this safe to import in Next.js / Remix server components
//    (the hook body is skipped entirely on the server).
//
//  Vue and Svelte adapter patterns:
//
//  Vue 3 composable:
//    import { onMounted, onUnmounted } from 'vue'
//    import { attachElement, detachElement } from './liquid-glass-pro.js'
//    export function useLiquidGlass(elRef) {
//      onMounted(() => attachElement(elRef.value))
//      onUnmounted(() => detachElement(elRef.value))
//    }
//
//  Svelte action:
//    import { attachElement, detachElement } from './liquid-glass-pro.js'
//    export function liquidGlass(node) {
//      attachElement(node)
//      return { destroy: () => detachElement(node) }
//    }
//    // Usage: <div class="lg lg-card" use:liquidGlass>...</div>
// ─────────────────────────────────────────────────────────────────────────────

/**
 * React hook that attaches the Liquid Glass PRO effect to a React ref and
 * automatically cleans up on unmount.
 *
 * Requires React 16.8+ (hooks support).  Automatically calls initLiquidGlass()
 * with the current options if it has not been called already.
 *
 * @param {React.RefObject<HTMLElement>} ref - Ref attached to the glass element.
 *
 * @example
 * import { useRef } from 'react';
 * import { useLiquidGlass } from './liquid-glass-pro.js';
 *
 * function GlassCard() {
 *   const ref = useRef(null);
 *   useLiquidGlass(ref);
 *   return <div ref={ref} className="lg lg-card lg-interactive">Hello</div>;
 * }
 */
export function useLiquidGlass(ref: { current: HTMLElement | null } | null | undefined) {
    // SSR guard: window does not exist in Node.js / edge runtimes.
    if (typeof window === 'undefined') return;

    // Access React dynamically to avoid hard dependency.
    // This pattern works with React 16.8+ loaded via CDN, CJS, or ESM.
    const React = window.React;

    if (!React?.useEffect) {
        console.warn('LG-PRO: useLiquidGlass() requires React 16.8+ with useEffect.');
        return;
    }

    React.useEffect(() => {
        const el = ref?.current;
        if (!el) return;

        // Auto-initialise with current options if not already done.
        if (!_state.ready) initLiquidGlass(_opts);

        _attach(el);

        // Return cleanup function: called on component unmount or ref change.
        return () => _detach(el);

    }, [ref]);  // Re-run only if the ref object itself changes (uncommon)
    }

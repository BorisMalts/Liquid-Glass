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
export declare function useLiquidGlass(ref: {
    current: HTMLElement | null;
} | null | undefined): void;

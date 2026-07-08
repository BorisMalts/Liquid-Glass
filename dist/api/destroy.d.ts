/**
 * Completely tears down the Liquid Glass PRO system.
 *
 * This function is safe to call:
 *  • Before re-initialising with different options
 *  • On SPA route navigation to prevent orphaned listeners/timers
 *  • During component unmount in React / Vue / Svelte
 *
 * After this call, all tracked elements revert to their original styles,
 * all WebGL resources are freed, all intervals/observers are stopped, and
 * the injected <style> and <svg> elements are removed from the DOM.
 * initLiquidGlass() can be called again afterwards.
 */
export declare function destroyLiquidGlass(): void;

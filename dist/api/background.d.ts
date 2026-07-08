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
export declare function refreshBackground(): Promise<void>;
/**
 * Returns true if the background refraction texture is populated with at
 * least one successful html2canvas capture.  Before this returns true,
 * the glass effect will show caustics only (no background transmission).
 *
 * @returns {boolean}
 */
export declare function isRefractionActive(): boolean;

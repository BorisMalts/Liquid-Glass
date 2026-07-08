/**
 * Changes the glass type at runtime without reinitialising.
 * The new type takes effect on the next rendered frame.
 *
 * @param {string|number} type - Glass type name ('BK7','SF11','NK51A','NBK10','F2')
 *                               or numeric index 0–4.
 */
export declare function setGlassType(type: string | number): void;

/**
 * Returns a shallow copy of the currently active options object.
 * Mutating the returned object has no effect — use destroyLiquidGlass()
 * followed by initLiquidGlass(newOptions) to change live options.
 *
 * @returns {LGOptions}
 */
export declare function getOptions(): {
    ior: number;
    refractionStrength: number;
    aberrationStrength: number;
    bgCaptureInterval: number;
    bgCaptureScale: number;
    caustics: boolean;
    grain: boolean;
    iridescence: boolean;
    breathe: boolean;
    selector: string;
    glassOpacity: number;
    glassSaturation: number;
    glassType: string | number;
    glassVariant: string;
};

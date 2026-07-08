/**
 * Cached GPU tier result — _detectGpuTier() is idempotent; the WebGL probe
 * canvas is created only once and the result is memoised here.
 *
 * @type {GpuTier|null}
 */
let _gpuTierCache = null;
// ─────────────────────────────────────────────────────────────────────────────
// §2  GPU tier detection
//
//  Strategy:
//    1. Create a temporary WebGL1 context (WebGL1 is more universally supported
//       for probing than WebGL2 — we only need renderer string info here).
//    2. Query WEBGL_debug_renderer_info for the unmasked renderer string.
//    3. Match the string against known low/mid/high regex patterns.
//    4. If the extension is unavailable (privacy browsers, iOS 16+), fall back
//       to a user-agent mobile check: mobile → 'low', desktop → 'high'.
//    5. Apple GPU: use the core count from the renderer string to distinguish
//       low-core (≤7, iPad/iPhone) → 'mid' vs. high-core (≥10, M-series) → 'high'.
//    6. Tear down the probe context immediately to avoid consuming GPU resources.
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Detects the device GPU tier by probing WebGL renderer information.
 * Result is memoised in _gpuTierCache after the first call.
 *
 * @returns {GpuTier}
 */
export function _detectGpuTier() {
    // Return cached result immediately on subsequent calls.
    if (_gpuTierCache !== null)
        return _gpuTierCache;
    const canvas = document.createElement('canvas');
    try {
        // Prefer explicit 'webgl' context; fall back to legacy 'experimental-webgl'
        // for very old Chrome / Safari builds.
        const gl = (canvas.getContext('webgl')
            || canvas.getContext('experimental-webgl'));
        if (!gl) {
            // WebGL entirely unavailable (headless, old IE, restricted CSP).
            _gpuTierCache = 'low';
            return 'low';
        }
        // Broad mobile heuristic used when renderer string is unavailable.
        const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        if (!dbg) {
            // Extension blocked (Firefox resistFingerprinting, iOS 16+, etc.).
            // Best-effort classification: mobile devices default to 'low' to avoid
            // shipping expensive WebGL effects to potentially weak GPUs.
            _gpuTierCache = isMobile ? 'low' : 'high';
        }
        else {
            const r = gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL).toLowerCase();
            if (/adreno [2-4]\d{2}|mali-[24t]|powervr sgx|sgx 5/.test(r)) {
                // Qualcomm Adreno 2xx–4xx, ARM Mali-2/4/T series, PowerVR SGX:
                // Legacy mobile GPUs with limited fill-rate and memory bandwidth.
                _gpuTierCache = 'low';
            }
            else if (/adreno [56]\d{2}|mali-g[57]/.test(r)) {
                // Adreno 500/600 series, Mali-G57/G75:
                // Capable mid-range mobile GPUs found in recent Android flagships.
                _gpuTierCache = 'mid';
            }
            else if (/apple gpu/.test(r)) {
                // Apple GPU — differentiate by core count in the renderer string
                // (e.g. "Apple GPU (10-core)" for M1 Pro vs "Apple GPU (4-core)" for iPhone).
                const m = r.match(/(\d+)-core/);
                _gpuTierCache = (m && parseInt(m[1], 10) >= 10) ? 'high' : 'mid';
            }
            else {
                // All other renderers (NVIDIA, AMD, Intel Iris, generic desktop):
                // Assume high-tier capability.
                _gpuTierCache = 'high';
            }
        }
        // Politely release the WebGL context to free GPU resources.
        gl.getExtension('WEBGL_lose_context')?.loseContext();
    }
    catch (_) {
        // Any unexpected error (security exception, context creation failure)
        // → conservative 'low' to avoid broken rendering.
        _gpuTierCache = 'low';
    }
    finally {
        // Zero out canvas dimensions to trigger resource reclamation in browsers
        // that do not free GPU memory until canvas dimensions reach zero.
        canvas.width = canvas.height = 0;
    }
    return _gpuTierCache;
}
/**
 * Resets the memoised GPU tier.  Called by destroyLiquidGlass() so a
 * subsequent re-init re-probes the GPU.
 */
export function _resetGpuTierCache() {
    _gpuTierCache = null;
}

/*!
 * Liquid Glass PRO · v4.1.0 — svg/build-defs (§7 — SVG filter bank)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _opts } from '../state/options.js';

// ─────────────────────────────────────────────────────────────────────────────
// §7  SVG filter bank
//
//  Two SVG filters are injected into a hidden <svg> element in <body>:
//
//  #lg-distort
//    Applied to the .lg-outer wrapper element via CSS filter:url(#lg-distort).
//    Produces per-channel chromatic aberration (RGB split) using three
//    feDisplacementMap stages driven by animated feTurbulence.  Each channel
//    is isolated with feColorMatrix before being recombined with feBlend(screen).
//    On 'high' tier, aberrationStrength is used at full value; 'mid' at 0.5×.
//    On 'low' tier, both filters are replaced with no-op <feComposite> stubs.
//
//  #lg-refract
//    Applied directly to content inside .lg via filter:url(#lg-refract).
//    Uses a fractalNoise feTurbulence driving feDisplacementMap at a low scale
//    (2–3 px) to add micro-distortion to the element's content, simulating
//    viewing through an imperfect glass surface.
//
//  Why SVG filters instead of CSS filter()?
//    CSS backdrop-filter is not compositable with feDisplacementMap in any
//    current browser.  The SVG filter is applied at the wrapper layer, above
//    the backdrop-filter layer, so they work in parallel without interference.
//
//  Animation:
//    The feTurbulence baseFrequency is animated with <animate> to slowly
//    drift, giving the distortion a living, breathing quality.  The seed value
//    is animated discretely to occasionally "snap" the turbulence pattern,
//    adding micro-variation that prevents the animation from looking looped.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds the inner SVG <defs> markup containing the two filter definitions.
 * Returns a simplified no-op version for 'low' tier to avoid filter overhead.
 *
 * @param {GpuTier} tier - GPU capability tier.
 * @returns {string} SVG markup string (safe to assign to .innerHTML).
 */
export function _buildSVGDefs(tier) {
    // Low-tier: return bare filters with no-op feComposite so filter references
    // in CSS resolve without triggering an error, but produce no visual effect.
    if (tier === 'low') {
        return `<defs>
      <filter id="lg-distort"><feComposite operator="atop"/></filter>
      <filter id="lg-refract"><feComposite operator="atop"/></filter>
    </defs>`;
    }

    // Half-strength aberration on mid-tier GPUs to conserve fill-rate.
    const aber  = tier === 'high' ? _opts.aberrationStrength : _opts.aberrationStrength * 0.5;
    // Mid-tier uses scale 2 (subtler displacement); high-tier uses scale 3.
    const refSc = tier === 'high' ? 3 : 2;

    return `<defs>

      <!-- ─────────────────────────────────────────────────────────────────── -->
      <!-- #lg-distort: Chromatic aberration filter applied to .lg-outer       -->
      <!-- Splits RGB channels by driving separate feDisplacementMap stages    -->
      <!-- with different scale factors from the same animated turbulence.     -->
      <!-- x/y oversize (-25%/+50%) prevents edge clipping during displacement.-->
      <!-- ─────────────────────────────────────────────────────────────────── -->
      <filter id="lg-distort" x="-25%" y="-25%" width="150%" height="150%"
              color-interpolation-filters="sRGB">

        <!-- Animated turbulence drives the displacement maps.                 -->
        <!-- baseFrequency is keyframe-animated to slowly drift the pattern.  -->
        <!-- seed is discretely animated (calcMode="discrete") to add variety. -->
        <feTurbulence type="turbulence" baseFrequency="0.015 0.019"
            numOctaves="3" seed="7" result="turb">
          <animate attributeName="baseFrequency"
              values="0.015 0.019;0.022 0.014;0.018 0.024;0.015 0.019"
              dur="12s" repeatCount="indefinite" calcMode="spline"
              keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1"/>
          <animate attributeName="seed" values="7;13;3;19;5;11;7"
              dur="31s" repeatCount="indefinite" calcMode="discrete"/>
        </feTurbulence>

        <!-- Three feDisplacementMap stages, one per RGB channel, at           -->
        <!-- decreasing scale to spread R most, G medium, B least.            -->
        <feDisplacementMap in="SourceGraphic" in2="turb" scale="${aber.toFixed(1)}"
            xChannelSelector="R" yChannelSelector="G" result="dR"/>
        <feDisplacementMap in="SourceGraphic" in2="turb" scale="${(aber * 0.62).toFixed(1)}"
            xChannelSelector="G" yChannelSelector="B" result="dG"/>
        <feDisplacementMap in="SourceGraphic" in2="turb" scale="${(aber * 0.36).toFixed(1)}"
            xChannelSelector="B" yChannelSelector="R" result="dB"/>

        <!-- feColorMatrix isolates one channel from each displaced copy.      -->
        <feColorMatrix in="dR" type="matrix"
            values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="oR"/>
        <feColorMatrix in="dG" type="matrix"
            values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="oG"/>
        <feColorMatrix in="dB" type="matrix"
            values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="oB"/>

        <!-- Screen blend recombines the isolated channels into full colour.   -->
        <feBlend in="oR"  in2="oG" mode="screen" result="rg"/>
        <feBlend in="rg"  in2="oB" mode="screen" result="rgb"/>
        <!-- atop composite clips the result to the original element shape.   -->
        <feComposite in="rgb" in2="SourceGraphic" operator="atop"/>

      </filter>

      <!-- ─────────────────────────────────────────────────────────────────── -->
      <!-- #lg-refract: Micro-distortion filter applied to .lg content         -->
      <!-- Low-frequency fractal noise drives a gentle feDisplacementMap to   -->
      <!-- simulate the slight warping of content seen through real glass.    -->
      <!-- ─────────────────────────────────────────────────────────────────── -->
      <filter id="lg-refract" x="-32%" y="-32%" width="164%" height="164%"
              color-interpolation-filters="sRGB">

        <feTurbulence type="fractalNoise" baseFrequency="0.007 0.011"
            numOctaves="2" seed="3" result="warp">
          <animate attributeName="baseFrequency"
              values="0.007 0.011;0.013 0.008;0.009 0.015;0.007 0.011"
              dur="16s" repeatCount="indefinite" calcMode="spline"
              keySplines=".45 0 .55 1;.45 0 .55 1;.45 0 .55 1"/>
        </feTurbulence>

        <!-- scale="${refSc}" px — barely perceptible, just enough to break   -->
        <!-- the straight-edge appearance of DOM content.                     -->
        <feDisplacementMap in="SourceGraphic" in2="warp" scale="${refSc}"
            xChannelSelector="R" yChannelSelector="G"/>

      </filter>

    </defs>`;
}

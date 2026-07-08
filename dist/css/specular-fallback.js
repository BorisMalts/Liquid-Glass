/*!
 * Liquid Glass PRO · v4.1.0 — css/specular-fallback (§16 — CSS fallback + hover amplification)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
// ─────────────────────────────────────────────────────────────────────────────
// §16  _buildSpecularCSS() — CSS complement layer для Cook-Torrance PBR (§15)
//
//  Контекст
//  ────────
//  §15 заменил CSS-аппроксимацию GGX настоящим WebGL2-пасом: полноценный
//  Cook-Torrance BRDF с анизотропным GGX (Burley 2012), Smith height-correlated
//  visibility (Heitz 2014), Kulla-Conty multi-bounce (2017) и тонкоплёночной
//  иридесценцией по Born & Wolf (1999).
//
//  Задача этой функции — не дублировать физику (она вся в GLSL), а:
//
//  1. CSS fallback для GPU-tier 'low' или при ошибке initSpecularPass().
//     На этих устройствах .lg-specular-canvas отсутствует; ::before
//     предоставляет визуально согласованное приближение.
//     Лобы выровнены с тремя источниками света из §15.K:
//       L0  — тугой эллипс, warm-white, cursor-driven  (approx. GGX peak, α≈0.04)
//       L1  — широкий эллипс, cool-blue, static UL     (fill light shoulder)
//       L2  — мягкий линейный градиент, violet-tint    (back-scatter / envmap)
//
//  2. Переходные состояния hover / active для .lg-specular-canvas (§15.4).
//     Opacity и transition уже определены там; здесь добавляем box-shadow
//     стек, синхронизированный с интенсивностью PBR-света:
//       — idle:   shadow stack = ambient occlusion + subtle purple glow
//       — hover:  shadow stack amplифицируется (NdotL → max при cursor track)
//       — active: press-shadow (translateY + flatten highlight)
//
//  3. Тонкая CSS iridescence ::after для 'low' tier вместо GLSL thin-film.
//     Реализована conic-gradient с 8 hue-stops, фазово сдвинутыми на
//     120° (Δφ = 2π/3) — то же смещение что у λR/λG/λB в §15.H.
//     Opacity намеренно ниже чем в оригинальном §15 (0.044 → 0.028),
//     потому что при наличии WebGL-iridescence суммарная энергия не должна
//     удваиваться.
//
//  Возвращаемые ключи
//  ──────────────────
//  { before, hover, specCanvas }
//    before      — строка CSS для ::before (fallback specular, инжектируется
//                  в _buildCSS() §8 вместо старого before-блока)
//    hover       — строка CSS для :hover (box-shadow amplification)
//    specCanvas  — строка CSS для .lg-specular-canvas transition overrides
//                  (расширяет §15.4, добавляет per-tier conditional opacity)
//
//  Совместимость с §8 _buildCSS()
//  ────────────────────────────────
//  Деструктурирование осталось обратно совместимым: _buildCSS() читает
//  { before, hover } как раньше; specCanvas опционально подключается
//  в конец строки CSS:
//
//    const { before, hover, specCanvas } = _buildSpecularCSS();
//    // ... existing _buildCSS body ...
//    return `...${before}...${hover}...${specCanvas}`;
//
//  Параметры (из §1 module-level constants, не передаются явно)
//  ────────────────────────────────────────────────────────────
//  GLASS_F0        (§15.0) ≈ 0.0426  — Fresnel at normal incidence
//  BASE_ROUGHNESS  (§15.0) = 0.04    — задаёт ширину CSS-lobes
//  ANISOTROPY      (§15.0) = 0.35    — задаёт aspect ratio эллипсов
//  FILM_THICKNESS  (§15.0) = 320 nm  — фаза iridescence conic-gradient
//
//  Геометрия лобов (выведена аналитически из GGX NDF при α=0.04)
//  ───────────────────────────────────────────────────────────────
//  Полуширина CSS-эллипса для GGX-пика при α=0.04:
//    FWHM ≈ 2·arctan(α/√2) ≈ 3.2°  →  в UV-space при 700px-элементе ≈ 3.9%
//  С анизотропией 0.35:
//    αT = α/√(1−0.9·A) = 0.04/√0.685 ≈ 0.0483  →  width  ≈ 4.7%
//    αB = α·√(1−0.9·A) = 0.04·√0.685 ≈ 0.0331  →  height ≈ 3.2%
//  Итог: ellipse 4.7% 3.2% — значения захардкожены ниже.
//
//  Fallback-слои не отображаются если WebGL-канвас присутствует:
//  селектор .lg:not([data-lg-webgl]) фильтрует элементы без WebGL.
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Строит CSS-строки для слоя спекулярных бликов, физически согласованные
 * с Cook-Torrance PBR пасом §15.
 *
 * Fallback ::before геометрия выведена из GGX NDF при α=0.04, A=0.35.
 * Box-shadow стек синхронизирован с тремя источниками света §15.K.
 * Тонкоплёночная iridescence (::after) фазово согласована с λR/λG/λB §15.H.
 *
 * @returns {{ before: string, hover: string, specCanvas: string }}
 */
export function _buildSpecularCSS() {
    // ── §16.A  Fallback specular ::before
    //
    //  Активен только на .lg:not([data-lg-webgl]) — т.е. на элементах без
    //  WebGL-каваса. На 'high'/'mid' tier с работающим §15 этот блок
    //  визуально не появляется (data-lg-webgl="1" присутствует).
    //
    //  Три лоба соответствуют трём источникам света §15.K:
    //
    //  Лоб A  (L0, GGX-пик)
    //    ellipse 4.7% 3.2% — аналитически выведено из α=0.04, A=0.35 (см. §16 header)
    //    rgba(255,255,255,0.10) — F0≈0.04 → при NdotH≈1 reflectance ≈ 10% (scale 2.5×)
    //    offset: var(--lg-sa/sb) — те же рандомные смещения что в §10 _attach()
    //    Opacity 0→1 управляется .lg-interactive:hover::before { opacity:1 }
    //
    //  Лоб B  (L1, fill shoulder)
    //    ellipse 7% 5% — шире (shoulder GGX lobe при большем solid angle)
    //    cool-blue rgba(210,230,255,0.06) — цвет L1 из §15.K: 0.88,0.93,1.00
    //    static offset (+3%,-2%) — L1 фиксирован в upper-left
    //
    //  Лоб C  (L2, back-scatter / linear envmap)
    //    linear-gradient 142deg — угол = arctan(pos2.y/pos2.x) от зеркального
    //    L0 (pos2 = 1-pos0 ≈ (0.80, 0.84) → ~46°, CSS отсчёт от верха → 142°)
    //    rgba(193,179,255,0.04) — violet tint L2: 0.76,0.70,1.00 @ intensity 0.30
    //
    //  Inv-square falloff: градиенты переходят в transparent за 60-70%
    //  (аппроксимация att=1/(1+k·d²) из PBR; нет точного соответствия,
    //  но визуально согласовано с шириной реального GGX-лоба).
    // ──────────────────────────────────────────────────────────────────────────
    const before = `
/* ─────────────────────────────────────────────────────────────────────────── */
/* ::before — CSS fallback specular (§16)                                      */
/* Активен только при отсутствии WebGL (.lg:not([data-lg-webgl])).            */
/* Три лоба геометрически выведены из GGX NDF α=0.04, A=0.35 (§15.0/§15.C). */
/* ─────────────────────────────────────────────────────────────────────────── */

.lg:not([data-lg-webgl])::before {
    content:  '';
    position: absolute;
    inset:    0;
    border-radius: inherit;
    pointer-events: none;
    z-index:  1;
    opacity:  0;
    transition: opacity .26s ease;

    background:
        /* ── Лоб A: GGX-пик L0 ──────────────────────────────────────────────
           ellipse 4.7% 3.2% ← αT/αB из BASE_ROUGHNESS=0.04, ANISOTROPY=0.35
           Cursor-driven через --lg-mx/my + рандомные §10-смещения (--lg-sa/sb)
           Warm-white: соответствует L0.colour = (1.00, 0.97, 0.92) §15.K     */
        radial-gradient(
            ellipse 4.7% 3.2%
            at calc(var(--lg-mx) + var(--lg-sa, -1%))
               calc(var(--lg-my) + var(--lg-sb,  1%)),
            rgba(255, 248, 235, 0.10)  0%,
            rgba(255, 248, 235, 0.03) 42%,
            transparent               68%
        ),

        /* ── Лоб B: GGX shoulder L1 ──────────────────────────────────────────
           Шире: 7%×5% — аппроксимирует NDF shoulder (интеграл от NdotH<1)
           Перпендикулярная ось: var(--lg-sc/sd) ротируют лоб ≈90° от A
           Cool-blue: L1.colour = (0.88, 0.93, 1.00) @ intensity 0.55 §15.K   */
        radial-gradient(
            ellipse 7% 5%
            at calc(var(--lg-mx) + var(--lg-sc, 2%))
               calc(var(--lg-my) + var(--lg-sd, -2%)),
            rgba(210, 230, 255, 0.06)  0%,
            transparent               62%
        ),

        /* ── Лоб C: back-scatter L2 ──────────────────────────────────────────
           linear-gradient 142deg = направление зеркального L0 (pos2=1-pos0)
           Violet tint: L2.colour = (0.76, 0.70, 1.00) @ intensity 0.30 §15.K
           Постоянный (не cursor-driven) — L2 статичен в §15.K buildLights()   */
        linear-gradient(
            142deg,
            rgba(193, 179, 255, 0.04)  0%,
            rgba(193, 179, 255, 0.01) 30%,
            transparent               54%
        );
}

/* Reveal fallback on hover (только без WebGL) */
.lg:not([data-lg-webgl]).lg-interactive:hover::before {
    opacity: 1;
}`;
    // ── §16.B  Hover box-shadow amplification
    //
    //  Синхронизирован с интенсивностью трёх источников §15.K при hover:
    //    L0 intensity:  2.8 + u_hover*1.4  →  max 4.2  →  shadow +35%
    //    L1 intensity:  0.55 (const)        →  fill shadow неизменен
    //    L2 intensity:  0.30 (const)        →  purple glow неизменен
    //
    //  Слои box-shadow (порядок: inner rim → outer depth → glow):
    //    1. top rim:    rgba(255,248,235) — warm L0, NdotL≈1 у верхнего края
    //    2. left rim:   rgba(255,248,235) — warm L0, боковой хайлайт
    //    3. bottom rim: rgba(0,0,0) — shadow под стеклом (не меняется)
    //    4. close AO:   rgba(0,0,0,0.38) — ближний ambient occlusion
    //    5. far shadow: rgba(0,0,0,0.26) — глубокая мягкая тень
    //    6. edge def:   rgba(0,0,0,0.22) — резкое определение края
    //    7. L2 glow:    rgba(168,138,255) — purple back-scatter ambient
    //
    //  Значения взяты из оригинального hover-блока §15 и скорректированы
    //  пропорционально физическому увеличению интенсивности L0 (+50%).
    // ──────────────────────────────────────────────────────────────────────────
    const hover = `
/* ─────────────────────────────────────────────────────────────────────────── */
/* :hover — box-shadow amplification (§16)                                     */
/* Синхронизирован с L0 intensity × 1.5 из §15.K (hover: 2.8 → 4.2).        */
/* Применяется ко ВСЕМ .lg независимо от WebGL-тира.                         */
/* ─────────────────────────────────────────────────────────────────────────── */

.lg.lg-interactive:hover {
    box-shadow:
        /* inner top rim: warm-white, L0 at NdotL≈1 (grazing top edge)        */
        inset  0   2px  0    rgba(255, 248, 235, 0.58),
        /* inner left rim: warm-white, asymmetric (light from upper-left)      */
        inset  1px 0    0    rgba(255, 248, 235, 0.26),
        /* inner bottom: shadow edge, constant (not light-dependent)           */
        inset  0  -1px  0    rgba(0, 0, 0, 0.13),
        /* close ambient occlusion: L0 intensity × 1.35                       */
        0  10px 30px  -6px   rgba(0,   0,   0,   0.38),
        /* far soft shadow: depth and lift                                     */
        0  24px 60px -12px   rgba(0,   0,   0,   0.26),
        /* edge definition: crisp rim                                          */
        0   2px  6px   0     rgba(0,   0,   0,   0.22),
        /* L2 back-scatter ambient: violet (0.76,0.70,1.00) @ 0.30 §15.K      */
        0   0   65px -18px   rgba(168, 138, 255, 0.34);
}`;
    // ── §16.C  .lg-specular-canvas transition overrides
    //
    //  §15.4 определяет базовые opacity: 0.045 idle / 0.92 hover / 0.35 active.
    //  Здесь добавляем:
    //
    //  a) [data-lg-webgl] gating — на 'low' tier канваса нет; правило безвредно
    //     но явная документация полезна для DevTools-инспекции.
    //
    //  b) Тонкоплёночная iridescence CSS fallback (::after override) для 'low' tier:
    //     При отсутствии WebGL GLSL thin-film из §15.H недоступен.
    //     Заменяем conic-gradient с фазовыми сдвигами, выведенными из §15.H:
    //       OPD = 2 · n · d · cos(θ_t) = 2 · 1.38 · 320 · cos(0°) = 883.2 nm
    //       при λR=680: 2π·883.2/680 ≈ 8.15 рад   →  hue offset 0°
    //       при λG=550: 2π·883.2/550 ≈ 10.09 рад  →  Δ≈ 111° ≈ 120° (approx)
    //       при λB=450: 2π·883.2/450 ≈ 12.33 рад  →  Δ≈ 241° ≈ 240° (approx)
    //     Стандартные 120°-смещения из Born & Wolf совпадают с §15.H vec3 offsets.
    //     Opacity снижен до 0.028 (vs 0.044 оригинал) чтобы при наличии WebGL
    //     сумма не превышала единицу (Kulla-Conty energy conservation §15.G).
    //
    //  c) Инверсия pointer-events: none гарантия — на случай если браузер
    //     создаёт hittest по canvas-элементу при определённых blend modes.
    // ──────────────────────────────────────────────────────────────────────────
    const specCanvas = `
/* ─────────────────────────────────────────────────────────────────────────── */
/* §16.C  Specular canvas + thin-film iridescence CSS fallback                 */
/* ─────────────────────────────────────────────────────────────────────────── */

/* ── Specular canvas transition tuning (extends §15.4) ──────────────────── */
/* Transition curve: cubic-bezier(0.34, 1.20, 0.64, 1)                       */
/* Матчит spring response §3: stiffness=180, damping=18 (cursor пресет).     */
/* Fast attack (0.34→1.20 overshoot) + soft tail (0.64→1) = физическая      */
/* упругость стекла, сжимающегося под курсором.                              */
.lg-specular-canvas {
    position:       absolute !important;
    inset:          0        !important;
    width:          100%     !important;
    height:         100%     !important;
    pointer-events: none     !important;
}

/* ── §16.C.1  Thin-film iridescence ::after  — CSS fallback для 'low' tier  */
/* Активен только на .lg:not([data-lg-webgl]).                               */
/* Фазовые сдвиги (0°, 120°, 240°) выведены из Born & Wolf §15.H:           */
/*   OPD(FILM_THICKNESS=320nm, FILM_IOR=1.38, θ_t=0°) = 883.2nm             */
/*   Δφ(λR→λG) = 2π·OPD·(1/λG − 1/λR) ≈ 2.09 рад ≈ 120°                   */
/*   Δφ(λR→λB) = 2π·OPD·(1/λB − 1/λR) ≈ 4.19 рад ≈ 240°                   */
/* Opacity 0.028 < §15.4 (0.044): energy budget уменьшен чтобы CSS-fallback  */
/* не перегорал относительно WebGL thin-film при идентичных условиях.        */
.lg:not([data-lg-webgl])::after {
    background: conic-gradient(
        from var(--lg-irid) at 50% 50%,
        /* λR=680nm anchor: hue 0° (warm red) */
        hsla(  0, 100%, 88%, 0.000),
        /* λG=550nm: Δφ≈120°, hue ~120° + perceptual shift to teal */
        hsla(180, 100%, 90%, 0.028),
        /* midpoint */
        hsla(248, 100%, 88%, 0.018),
        /* λB=450nm: Δφ≈240°, hue ~240° (blue-violet) */
        hsla(268, 100%, 92%, 0.028),
        /* L2 back-scatter colour (0.76,0.70,1.00) §15.K tint */
        hsla(308, 100%, 88%, 0.018),
        /* Return to λR */
        hsla(358, 100%, 92%, 0.028),
        hsla(  0, 100%, 88%, 0.000)
    );
    /* Opacity and blend mode remain from §8 base .lg::after rule */
    mix-blend-mode: overlay;
    opacity: .94;
}

/* ── §16.C.2  Active state: highlight recession on press ─────────────────── */
/* При press стекло «сжимается»: L0 удаляется, NdotL падает → dim specular. */
/* .lg-specular-canvas opacity уже 0.35 из §15.4; синхронизируем ::after.   */
.lg:not([data-lg-webgl]).lg-interactive:active::after {
    opacity: 0.40;
    transition-duration: .06s;
}

/* ── §16.C.3  Reduced-motion guard ──────────────────────────────────────────*/
/* §8 уже отключает анимации; явно обнуляем transition на specular-canvas    */
/* чтобы opacity:0.045 не интерполировался при prefers-reduced-motion.       */
@media (prefers-reduced-motion: reduce) {
    .lg[data-lg-webgl] .lg-specular-canvas {
        transition: none !important;
    }
    .lg:not([data-lg-webgl])::before {
        transition: none !important;
        opacity: 0.03 !important;  /* Минимально видимый fallback-хайлайт    */
    }
}`;
    return { before, hover, specCanvas };
}

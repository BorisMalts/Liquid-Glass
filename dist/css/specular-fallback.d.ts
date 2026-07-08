/*!
 * Liquid Glass PRO · v4.1.0 — css/specular-fallback (§16 — CSS fallback + hover amplification)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
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
export declare function _buildSpecularCSS(): {
    before: string;
    hover: string;
    specCanvas: string;
};

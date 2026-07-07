/*!
 * Liquid Glass PRO · v4.1.0
 * Copyright (C) 2025-2026 Boris Maltsev
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU AGPL along with this program.
 * If not, see <https://www.gnu.org/licenses/>.
 *
 * Commercial licenses are available for proprietary/closed-source use —
 * see LICENSE-COMMERCIAL.md or contact: boris.maltsev222@gmail.com
 */

// liquid-glass-pro.js · v4.1.0 — entry-point shim
//
// The implementation now lives in src/ (one module per subsystem — see
// src/index.js for the full module map).  This file re-exports the public
// API so existing imports of './liquid-glass-pro.js' keep working unchanged.

export * from './src/index.js';

/*!
 * Liquid Glass PRO · v4.1.0 — dom/reply-quote (§13 — chat reply-quote factory)
 * Copyright (C) 2025-2026 Boris Maltsev · AGPL-3.0-or-later
 * Commercial licenses available — see LICENSE-COMMERCIAL.md
 */
import { _opts } from '../state/options.js';
import { _state } from '../state/runtime.js';
import { createGrainLayer } from './grain-layer.js';
import { _attach } from '../elements/attach.js';
/**
 * Factory function for chat message reply-quote elements.
 * Produces a fully styled .lg.lg-reply element with sender and text spans,
 * optional own-message colour variant, and an optional click handler.
 *
 * The created element is automatically attached to the glass effect system
 * if initLiquidGlass() has already been called.
 *
 * @param {string}      sender          - Display name of the quoted sender.
 * @param {string}      text            - Preview text of the quoted message.
 * @param {boolean}     [isOwn=false]   - Apply .lg-own purple tint for own messages.
 * @param {Function}    [onClick=null]  - Click handler; receives the MouseEvent.
 * @returns {HTMLDivElement} Detached element (insert it into your chat DOM).
 *
 * @example
 * const quote = createReplyQuote('Alice', 'Hey, are you coming tonight?');
 * chatContainer.appendChild(quote);
 */
export function createReplyQuote(sender, text, isOwn = false, onClick = null) {
    const el = document.createElement('div');
    el.className = `lg lg-reply lg-interactive${isOwn ? ' lg-own' : ''}`;
    if (_opts.grain) {
        el.appendChild(createGrainLayer());
    }
    el.append(Object.assign(document.createElement('span'), {
        className: 'lg-sender',
        textContent: sender,
    }), Object.assign(document.createElement('span'), {
        className: 'lg-text',
        textContent: text,
    }));
    if (typeof onClick === 'function') {
        // stopPropagation prevents the click from bubbling to a parent message
        // container that may also have a click handler.
        el.addEventListener('click', e => { e.stopPropagation(); onClick(); });
    }
    if (_state.ready)
        _attach(el);
    return el;
}

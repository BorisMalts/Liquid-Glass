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
export declare function createReplyQuote(sender: string, text: string, isOwn?: boolean, onClick?: (() => void) | null): HTMLDivElement;

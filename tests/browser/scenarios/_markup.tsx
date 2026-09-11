/**
 * Shared scenario behind the `markup` fixture: caller-supplied HTML rendered
 * into `#mount-root`. DOM-shape contracts that assert on plain slot markup
 * need nothing more than this.
 */
export default function markup(
  root: HTMLElement,
  options: { html: string }
): void {
  root.innerHTML = options.html;
}

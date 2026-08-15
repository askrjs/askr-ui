import { readHoverCardRootContext } from './hover-card.shared';
import type { HoverCardPortalProps } from './hover-card.types';

/**
 * Renders a part of `hover-card`.
 */
export function HoverCardPortal(
  props: HoverCardPortalProps
): JSX.Element | null {
  const root = readHoverCardRootContext();

  return root.portal.render({
    children: props.children,
  }) as JSX.Element | null;
}

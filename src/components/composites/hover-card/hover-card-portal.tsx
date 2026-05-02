import { readHoverCardRootContext } from './hover-card.shared';
import type { HoverCardPortalProps } from './hover-card.types';

export function HoverCardPortal(props: HoverCardPortalProps): JSX.Element | null {
  const root = readHoverCardRootContext();

  return root.portal.render({
    children: props.children,
  }) as JSX.Element | null;
}

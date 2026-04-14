import { readPopoverRootContext } from './popover.shared';
import type { PopoverPortalProps } from './popover.types';

export function PopoverPortal(props: PopoverPortalProps): JSX.Element | null {
  const root = readPopoverRootContext();

  return root.portal.render({
    children: props.children,
  }) as JSX.Element | null;
}

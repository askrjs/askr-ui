import { readDialogRootContext } from './dialog.shared';
import type { DialogPortalProps } from './dialog.types';

/**
 * Renders a part of `dialog`.
 */
export function DialogPortal(props: DialogPortalProps): JSX.Element | null {
  const root = readDialogRootContext();

  return root.portal.render({
    children: props.children,
  }) as JSX.Element | null;
}

import { readDialogRootContext } from './dialog.shared';
import type { DialogPortalProps } from './dialog.types';

export function DialogPortal(props: DialogPortalProps): JSX.Element | null {
  const root = readDialogRootContext();

  return root.portal.render({
    children: props.children,
  }) as JSX.Element | null;
}
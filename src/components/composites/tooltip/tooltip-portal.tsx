import { readTooltipRootContext } from './tooltip.shared';
import type { TooltipPortalProps } from './tooltip.types';

export function TooltipPortal(props: TooltipPortalProps): JSX.Element | null {
  const root = readTooltipRootContext();

  return root.portal.render({
    children: props.children,
  }) as JSX.Element | null;
}

import { readTooltipRootContext } from './tooltip.shared';
import type { TooltipPortalProps } from './tooltip.types';

/**
 * Renders a part of `tooltip`.
 */
export function TooltipPortal(props: TooltipPortalProps): JSX.Element | null {
  const root = readTooltipRootContext();

  return root.portal.render({
    children: props.children,
  }) as JSX.Element | null;
}

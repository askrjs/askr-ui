import { Slot, mergeProps } from '@askrjs/askr/foundations';
import { readNavigationMenuRootContext } from './navigation-menu.shared';
import type {
  NavigationMenuIndicatorProps,
  NavigationMenuIndicatorAsChildProps,
} from './navigation-menu.types';

export function NavigationMenuIndicator(
  props: NavigationMenuIndicatorProps
): JSX.Element;
export function NavigationMenuIndicator(
  props: NavigationMenuIndicatorAsChildProps
): JSX.Element;
export function NavigationMenuIndicator(
  props: NavigationMenuIndicatorProps | NavigationMenuIndicatorAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const root = readNavigationMenuRootContext();

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'navigation-menu-indicator',
    'data-navigation-menu-indicator': 'true',
    'data-state': root.openPath.length > 0 ? 'open' : 'closed',
    'data-active-item': root.openPath[0] ?? '',
  });

  return asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <div {...finalProps}>{children}</div>
  );
}

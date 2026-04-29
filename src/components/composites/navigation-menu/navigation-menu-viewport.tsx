import { Slot, mergeProps } from '@askrjs/ui/foundations';
import { readNavigationMenuRootContext } from './navigation-menu.shared';
import type {
  NavigationMenuViewportProps,
  NavigationMenuViewportAsChildProps,
} from './navigation-menu.types';

export function NavigationMenuViewport(
  props: NavigationMenuViewportProps
): JSX.Element;
export function NavigationMenuViewport(
  props: NavigationMenuViewportAsChildProps
): JSX.Element;
export function NavigationMenuViewport(
  props: NavigationMenuViewportProps | NavigationMenuViewportAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const root = readNavigationMenuRootContext();

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'navigation-menu-viewport',
    'data-navigation-menu-viewport': 'true',
    'data-state': root.openPath.length > 0 ? 'open' : 'closed',
    'data-active-item': root.openPath[0] ?? '',
  });

  return asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <div {...finalProps}>{children}</div>
  );
}


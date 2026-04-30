import { readNavigationMenuItemContext } from './navigation-menu.shared';
import { NavigationMenuContent } from './navigation-menu-content';
import type {
  NavigationMenuSubContentProps,
  NavigationMenuSubContentAsChildProps,
} from './navigation-menu.types';

export function NavigationMenuSubContent(
  props: NavigationMenuSubContentProps
): JSX.Element | null;
export function NavigationMenuSubContent(
  props: NavigationMenuSubContentAsChildProps
): JSX.Element | null;
export function NavigationMenuSubContent(
  props: NavigationMenuSubContentProps | NavigationMenuSubContentAsChildProps
) {
  readNavigationMenuItemContext();

  return (
    <NavigationMenuContent {...(props as NavigationMenuSubContentProps)} />
  );
}

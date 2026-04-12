import { resolvePartId } from '../../_internal/id';
import {
  NavigationMenuItemContext,
  type NavigationMenuItemContextValue,
  readNavigationMenuRootContext,
} from './navigation-menu.shared';
import type { NavigationMenuItemProps } from './navigation-menu.types';

function NavigationMenuItemScopeView(props: {
  children?: unknown;
}) {
  return <>{props.children}</>;
}

export function NavigationMenuItem(props: NavigationMenuItemProps) {
  const { children } = props;
  const root = readNavigationMenuRootContext();

  const itemKey = props.value ?? `item-${String(children)}`;
  const itemIndex = root.registerItem(itemKey);
  const triggerId = resolvePartId(root.navigationMenuId, `trigger-${itemIndex}`);
  const contentId = resolvePartId(root.navigationMenuId, `content-${itemIndex}`);
  const path = [itemKey];

  const itemContext: NavigationMenuItemContextValue = {
    itemKey,
    itemIndex,
    triggerId,
    contentId,
    path,
  };

  return (
    <NavigationMenuItemContext.Scope value={itemContext}>
      <NavigationMenuItemScopeView>{children}</NavigationMenuItemScopeView>
    </NavigationMenuItemContext.Scope>
  );
}

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

  // Derive item index from the props - it should be passed or derived from position
  // For now, we'll calculate based on children position
  // This will be set properly by the root component scanning children
  const itemIndex = 0; // Placeholder - will be overridden by proper implementation
  const itemKey = props.value ?? `item-${itemIndex}`;
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

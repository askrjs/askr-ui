import { For } from '@askrjs/askr';
import { resolvePartId } from '../../_internal/id';
import { isJsxElement, toChildArray } from '../../_internal/jsx';
import {
  NavigationMenuItemContext,
  type NavigationMenuItemContextValue,
  readNavigationMenuRootContext,
} from './navigation-menu.shared';
import type { NavigationMenuItemProps } from './navigation-menu.types';

function NavigationMenuItemScopeView(props: { children?: unknown }) {
  const keyedChildren = For<unknown>(
    () => toChildArray(props.children),
    (child, index) =>
      isJsxElement(child) && child.key != null ? child.key : index,
    (child) => child as never
  );

  return <>{keyedChildren}</>;
}

export function NavigationMenuItem(props: NavigationMenuItemProps) {
  const { children } = props;
  const root = readNavigationMenuRootContext();

  const itemKey = props.value ?? `item-${String(children)}`;
  const itemIndex = root.registerItem(itemKey);
  const triggerId = resolvePartId(
    root.navigationMenuId,
    `trigger-${itemIndex}`
  );
  const contentId = resolvePartId(
    root.navigationMenuId,
    `content-${itemIndex}`
  );
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

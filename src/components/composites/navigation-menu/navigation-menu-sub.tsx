import { resolvePartId } from '../../_internal/id';
import {
  NavigationMenuItemContext,
  type NavigationMenuItemContextValue,
  readNavigationMenuRootContext,
  readNavigationMenuContentContext,
} from './navigation-menu.shared';
import type { NavigationMenuSubProps } from './navigation-menu.types';

function NavigationMenuSubScopeView(props: {
  children?: unknown;
}) {
  return <>{props.children}</>;
}

export function NavigationMenuSub(props: NavigationMenuSubProps) {
  const { children, value } = props;
  const root = readNavigationMenuRootContext();
  const parentContent = readNavigationMenuContentContext();

  // Generate sub item info
  const subIndex = 0; // Would be tracked properly in real implementation
  const subKey = value ?? `sub-${subIndex}`;
  const subPath = [...Array(1), subKey]; // Parent path would be read from context
  const subTriggerId = resolvePartId(parentContent.contentId, `sub-trigger-${subIndex}`);
  const subContentId = resolvePartId(parentContent.contentId, `sub-content-${subIndex}`);

  const itemContext: NavigationMenuItemContextValue = {
    itemKey: subKey,
    itemIndex: subIndex,
    triggerId: subTriggerId,
    contentId: subContentId,
    path: subPath,
  };

  return (
    <NavigationMenuItemContext.Scope value={itemContext}>
      <NavigationMenuSubScopeView>{children}</NavigationMenuSubScopeView>
    </NavigationMenuItemContext.Scope>
  );
}

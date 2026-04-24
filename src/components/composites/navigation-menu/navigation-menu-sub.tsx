import { For } from '@askrjs/askr';
import { resolvePartId } from '../../_internal/id';
import { isJsxElement, toChildArray } from '../../_internal/jsx';
import {
  NavigationMenuItemContext,
  type NavigationMenuItemContextValue,
  readNavigationMenuItemContext,
  readNavigationMenuContentContext,
} from './navigation-menu.shared';
import type { NavigationMenuSubProps } from './navigation-menu.types';

function NavigationMenuSubScopeView(props: { children?: unknown }) {
  const keyedChildren = For<unknown>(
    () => toChildArray(props.children),
    (child, index) =>
      isJsxElement(child) && child.key != null ? child.key : index,
    (child) => child as never
  );

  return <>{keyedChildren}</>;
}

export function NavigationMenuSub(props: NavigationMenuSubProps) {
  const { children, value } = props;
  const parentItem = readNavigationMenuItemContext();
  const parentContent = readNavigationMenuContentContext();

  const subBaseKey = value ?? `sub-${String(children)}`;
  const subKey = `sub:${subBaseKey}`;
  const subIndex = parentContent.registerSurface(subKey);
  const subPath = [...parentItem.path, subKey];
  const subTriggerId = resolvePartId(
    parentContent.contentId,
    `sub-trigger-${subIndex}`
  );
  const subContentId = resolvePartId(
    parentContent.contentId,
    `sub-content-${subIndex}`
  );

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

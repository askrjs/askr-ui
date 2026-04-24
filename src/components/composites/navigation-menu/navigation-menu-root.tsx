import { For, state } from '@askrjs/askr';
import { mergeProps } from '@askrjs/askr/foundations';
import { resolveCompoundId } from '../../_internal/id';
import { isJsxElement, toChildArray } from '../../_internal/jsx';
import { getPersistentPortal } from '../../_internal/overlay';
import {
  NavigationMenuRootContext,
  type NavigationMenuRootContextValue,
} from './navigation-menu.shared';
import type { NavigationMenuProps } from './navigation-menu.types';

function NavigationMenuRootView(props: {
  children?: unknown;
  finalProps: Record<string, unknown>;
  portalHost: (() => JSX.Element | null) | null;
}) {
  const PortalHost = props.portalHost;
  const keyedChildren = For<unknown>(
    () => toChildArray(props.children),
    (child, index) =>
      isJsxElement(child) && child.key != null ? child.key : index,
    (child) => child as never
  );

  return (
    <nav {...props.finalProps}>
      {keyedChildren}
      {PortalHost ? <PortalHost key="navigation-menu-root-portal" /> : null}
    </nav>
  );
}

export function NavigationMenu(props: NavigationMenuProps) {
  const { children, id, loop = true, ref, ...rest } = props;
  const navigationMenuId = resolveCompoundId('navigation-menu', id, children);

  const openPathState = state<string[]>([]);
  const currentTriggerIndexState = state(0);
  const itemIndexMap = new Map<string, number>();
  let nextItemIndex = 0;

  const registerItem = (itemKey: string): number => {
    const existingIndex = itemIndexMap.get(itemKey);

    if (existingIndex !== undefined) {
      return existingIndex;
    }

    const nextIndex = nextItemIndex;
    itemIndexMap.set(itemKey, nextIndex);
    nextItemIndex += 1;
    return nextIndex;
  };

  const currentTriggerIndex = Math.max(0, currentTriggerIndexState());

  const portal = getPersistentPortal(navigationMenuId);

  const wrappedSetOpenPath = (nextPath: string[]) => {
    openPathState.set(nextPath);
  };

  const rootContext: NavigationMenuRootContextValue = {
    navigationMenuId,
    openPath: openPathState(),
    setOpenPath: wrappedSetOpenPath,
    loop,
    registerItem,
    currentTriggerIndex,
    setCurrentTriggerIndex: currentTriggerIndexState.set,
    portal,
  };

  const finalProps = mergeProps(rest, {
    ref,
    'data-slot': 'navigation-menu',
    'data-navigation-menu': 'true',
  });

  return (
    <NavigationMenuRootContext.Scope value={rootContext}>
      <NavigationMenuRootView
        finalProps={finalProps as Record<string, unknown>}
        portalHost={portal}
      >
        {children}
      </NavigationMenuRootView>
    </NavigationMenuRootContext.Scope>
  );
}

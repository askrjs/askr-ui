import { state } from '@askrjs/askr';
import { mergeProps } from '@askrjs/askr/foundations';
import { collectJsxElements } from '../../_internal/jsx';
import { resolveCompoundId, resolvePartId } from '../../_internal/id';
import {
  disabledIndexes,
  firstEnabledCompositeIndex,
} from '../../_internal/composite';
import {
  getPersistentPortal,
} from '../../_internal/overlay';
import { stripInternalProps } from '../../_internal/props';
import {
  NavigationMenuRootContext,
  type NavigationMenuRootContextValue,
} from './navigation-menu.shared';
import { NavigationMenuTrigger } from './navigation-menu-trigger';
import type { NavigationMenuProps } from './navigation-menu.types';

function NavigationMenuRootView(props: {
  children?: unknown;
  finalProps: Record<string, unknown>;
  portalHost: (() => JSX.Element | null) | null;
}) {
  const PortalHost = props.portalHost;

  return (
    <nav {...props.finalProps}>
      {props.children}
      {PortalHost ? <PortalHost /> : null}
    </nav>
  );
}

function scheduleNavigationMenuPortalSync(_navigationMenuId: string) {
  queueMicrotask(() => {
    // Force re-evaluation of navigation menu portals on next tick
    // Individual portal sync will happen via ref callbacks if content is present
  });
}

export function NavigationMenu(props: NavigationMenuProps) {
  const { children, id, loop = true, ref, ...rest } = props;
  const navigationMenuId = resolveCompoundId('navigation-menu', id, children);
  
  const openPathState = state<string[]>([]);
  const currentTriggerIndexState = state(0);
  
  const triggers = collectJsxElements(
    children,
    (element) => element.type === NavigationMenuTrigger
  ).map((element) => ({
    disabled: Boolean(element.props?.disabled),
  }));
  
  const currentTriggerIndex = triggers[currentTriggerIndexState()]
    ? currentTriggerIndexState()
    : firstEnabledCompositeIndex(triggers);
  
  const portal = getPersistentPortal(navigationMenuId);

  const wrappedSetOpenPath = (nextPath: string[]) => {
    openPathState.set(nextPath);
    scheduleNavigationMenuPortalSync(navigationMenuId);
  };

  const rootContext: NavigationMenuRootContextValue = {
    navigationMenuId,
    openPath: openPathState(),
    setOpenPath: wrappedSetOpenPath,
    loop,
    currentTriggerIndex,
    setCurrentTriggerIndex: currentTriggerIndexState.set,
    triggerCount: Math.max(triggers.length, 1),
    disabledTriggerIndexes: disabledIndexes(triggers),
    portal,
  };

  const finalProps = mergeProps(stripInternalProps(rest), {
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

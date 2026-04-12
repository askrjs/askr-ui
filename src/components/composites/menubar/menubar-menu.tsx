import { Slot, composeRefs, mergeProps, pressable, rovingFocus } from '@askrjs/askr/foundations';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import { resolvePartId } from '../../_internal/id';
import { pathIsOpen } from '../../_internal/hierarchical-menu';
import { getOverlayNodes, getPersistentPortal } from '../../_internal/overlay';
import {
  getCompositeCollection,
  registerCompositeNode,
} from '../../_internal/composite';
import {
  declareMenubarTriggerMetadata,
  readMenubarDeclarationContext,
  readMenubarMenuContext,
  readMenubarRootContext,
  readMenubarRootRenderContext,
  resolveMenubarRootState,
  MenubarMenuContext,
  MenubarRootContext,
  type MenubarMenuContextValue,
  type MenubarRootContextValue,
} from './menubar.shared';
import type {
  MenubarMenuProps,
  MenubarPortalProps,
  MenubarTriggerAsChildProps,
  MenubarTriggerProps,
} from './menubar.types';

function MenubarMenuScopeView(props: { children?: unknown }) {
  return <>{props.children}</>;
}

function scheduleMenubarPortalSync(root: {
  syncPortals: () => void;
}) {
  queueMicrotask(() => {
    root.syncPortals();
  });
}

function MenubarPortalMenuScopeView(props: {
  children?: unknown;
  menuContext: MenubarMenuContextValue;
}) {
  return (
    <MenubarMenuContext.Scope value={props.menuContext}>
      <MenubarMenuScopeView>{props.children}</MenubarMenuScopeView>
    </MenubarMenuContext.Scope>
  );
}

function MenubarPortalRuntimeView(props: {
  children?: unknown;
  menuContext: MenubarMenuContextValue;
  rootContext: MenubarRootContextValue;
}) {
  return (
    <MenubarRootContext.Scope value={props.rootContext}>
      <MenubarPortalMenuScopeView menuContext={props.menuContext}>
        {props.children}
      </MenubarPortalMenuScopeView>
    </MenubarRootContext.Scope>
  );
}

export function MenubarMenu(props: MenubarMenuProps) {
  const root = readMenubarRootContext();
  const renderContext = readMenubarRootRenderContext();
  const menuIndex = renderContext.claimMenuIndex();
  const menuKey = props.value ?? `menu-${menuIndex}`;
  const menuContext: MenubarMenuContextValue = {
    menuKey,
    menuIndex,
    triggerId: resolvePartId(root.menubarId, `trigger-${menuIndex}`),
    contentId: resolvePartId(root.menubarId, `content-${menuIndex}`),
    portalId: resolvePartId(root.menubarId, `portal-${menuIndex}`),
    path: [menuKey],
  };

  return (
    <MenubarMenuContext.Scope value={menuContext}>
      <MenubarMenuScopeView>{props.children}</MenubarMenuScopeView>
    </MenubarMenuContext.Scope>
  );
}

export function MenubarTrigger(props: MenubarTriggerProps): JSX.Element | null;
export function MenubarTrigger(
  props: MenubarTriggerAsChildProps
): JSX.Element | null;
export function MenubarTrigger(
  props: MenubarTriggerProps | MenubarTriggerAsChildProps
) {
  const {
    asChild,
    children,
    disabled = false,
    onPress,
    ref,
    type: typeProp,
    ...rest
  } = props;
  const root = readMenubarRootContext();
  const menu = readMenubarMenuContext();

  if (readMenubarDeclarationContext()) {
    declareMenubarTriggerMetadata(root.menubarId, {
      index: menu.menuIndex,
      disabled,
      menuKey: menu.menuKey,
      triggerId: menu.triggerId,
      contentId: menu.contentId,
      portalId: menu.portalId,
    });
    return null;
  }

  const { items, currentTriggerIndex, disabledTriggerIndexes } =
    resolveMenubarRootState(root);
  const collection = getCompositeCollection(root.menubarId);
  const nav = rovingFocus({
    currentIndex: currentTriggerIndex,
    itemCount: Math.max(items.length, 1),
    orientation: 'horizontal',
    loop: root.loop,
    isDisabled: (index) => disabledTriggerIndexes.includes(index),
    onNavigate: (index) => {
      root.setCurrentTriggerIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const open = pathIsOpen(root.openPath, menu.path);
  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      onPress?.(event);

      if (!event.defaultPrevented) {
        root.setOpenPath(open ? [] : menu.path);
        scheduleMenubarPortalSync(root);
      }
    },
    isNativeButton: !asChild,
  });
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ...nav.item(menu.menuIndex),
    ref: composeRefs(
      ref as
        | ((value: HTMLElement | null) => void)
        | { current: HTMLElement | null }
        | null
        | undefined,
      (node: HTMLElement | null) => {
        getOverlayNodes(menu.triggerId).trigger = node;
        registerCompositeNode(menu.triggerId, collection, node, {
          index: menu.menuIndex,
          disabled,
          value: menu.menuKey,
        });
      }
    ),
    id: menu.triggerId,
    role: 'menuitem',
    'aria-haspopup': 'menu',
    'aria-expanded': open ? 'true' : 'false',
    'aria-controls': menu.contentId,
    'data-slot': 'menubar-trigger',
    'data-disabled': disabled ? 'true' : undefined,
    'data-state': open ? 'open' : 'closed',
    onFocus: () => {
      root.setCurrentTriggerIndex(menu.menuIndex);
    },
    onPointerEnter: () => {
      if (!disabled && root.openPath.length > 0) {
        root.setCurrentTriggerIndex(menu.menuIndex);
        root.setOpenPath(menu.path);
        scheduleMenubarPortalSync(root);
      }
    },
    onKeyDown: (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        root.setOpenPath(menu.path);
        scheduleMenubarPortalSync(root);
      }
    },
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={typeProp ?? 'button'} {...finalProps}>
      {children}
    </button>
  );
}

export function MenubarPortal(props: MenubarPortalProps): JSX.Element | null {
  if (readMenubarDeclarationContext()) {
    return <>{props.children}</>;
  }

  const root = readMenubarRootContext();
  const menu = readMenubarMenuContext();
  const portal = getPersistentPortal(menu.portalId);
  const open = pathIsOpen(root.openPath, menu.path);

  if (!open) {
    return portal.render({ children: null }) as JSX.Element | null;
  }

  return portal.render({
    children: (
      <MenubarPortalRuntimeView menuContext={menu} rootContext={root}>
        {props.children}
      </MenubarPortalRuntimeView>
    ),
  }) as JSX.Element | null;
}
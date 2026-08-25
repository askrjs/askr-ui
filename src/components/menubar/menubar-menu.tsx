import { nativeButtonProps } from '../_internal/native-control';
import { getSignal, state } from '@askrjs/askr';
import { Slot } from '@askrjs/askr/foundations/structures';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { pressable } from '@askrjs/askr/foundations/interactions';
import { rovingFocus } from '../_internal/roving-focus';
import {
  compositeItemFocusProps,
  repairFocusForDisabledItem,
} from '../_internal/focus';
import { resolvePartId } from '../_internal/id';
import { pathIsOpen } from '../_internal/hierarchical-menu';
import { resolveMenuItemText } from '../_internal/menu';
import { getPersistentPortal, registerOverlayNode } from '../_internal/overlay';
import { runCancelablePress } from '../_internal/press';
import {
  readVirtualCompositePlacement,
  resolveVirtualCompositePlacement,
} from '../_internal/virtual-composite';
import {
  getCompositeCollection,
  registerCompositeNode,
} from '../_internal/composite';
import {
  readMenubarMenuContext,
  readMenubarRootContext,
  readMenubarRootRenderContext,
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

function MenubarPortalMenuScopeView(props: {
  children?: unknown;
  menuContext: MenubarMenuContextValue;
}) {
  return (
    <MenubarMenuContext value={props.menuContext}>
      <MenubarMenuScopeView>{props.children}</MenubarMenuScopeView>
    </MenubarMenuContext>
  );
}

function MenubarPortalRuntimeView(props: {
  children?: unknown;
  menuContext: MenubarMenuContextValue;
  rootContext: MenubarRootContextValue;
}) {
  return (
    <MenubarRootContext value={props.rootContext}>
      <MenubarPortalMenuScopeView menuContext={props.menuContext}>
        {props.children}
      </MenubarPortalMenuScopeView>
    </MenubarRootContext>
  );
}

/**
 * Renders a part of `menubar`.
 */
export function MenubarMenu(props: MenubarMenuProps) {
  const root = readMenubarRootContext();
  const renderContext = readMenubarRootRenderContext();
  const scopedVirtualPlacement = readVirtualCompositePlacement(
    renderContext.virtualIdentity
  );
  const placement = state<{ index: number; setSize?: number }>({ index: -1 })();
  if (!scopedVirtualPlacement && placement.index < 0) {
    placement.index = renderContext.claimMenuIndex();
  }
  const resolvedPlacement = scopedVirtualPlacement ?? placement;
  const menuIndex = resolvedPlacement.index;
  const menuKey = props.value ?? `menu-${menuIndex}`;
  const portalRecord = root.ensureMenuPortal(menuKey, getSignal());
  const menuContext: MenubarMenuContextValue = {
    menuKey,
    menuIndex,
    placement: resolvedPlacement,
    triggerId: resolvePartId(root.menubarId, `trigger-${menuKey}`),
    contentId: resolvePartId(root.menubarId, `content-${menuKey}`),
    portalId: resolvePartId(root.menubarId, `portal-${portalRecord.ordinal}`),
    overlayIdentity: portalRecord.identity,
    path: [menuKey],
  };

  return (
    <MenubarMenuContext value={menuContext}>
      <MenubarMenuScopeView>{props.children}</MenubarMenuScopeView>
    </MenubarMenuContext>
  );
}

/**
 * Renders a part of `menubar`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
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
    textValue,
    type: typeProp,
    ...rest
  } = props;
  const root = readMenubarRootContext();
  const menu = readMenubarMenuContext();
  const scopedVirtualPlacement = menu.placement;

  const { currentTriggerIndex, disabledTriggerIndexes } = root.resolvedState;
  const collection = getCompositeCollection(root.menubarId);
  const nav = rovingFocus({
    currentIndex: currentTriggerIndex,
    itemCount: Math.max(root.resolvedState.itemCount, 1),
    orientation: 'horizontal',
    loop: root.loop,
    isDisabled: (index) => disabledTriggerIndexes.includes(index),
    onNavigate: (index) => {
      root.setCurrentTriggerIndex(index);
      root.focusTrigger(index);
    },
  });
  const isOpen = () => pathIsOpen(root.getOpenPath(), menu.path);
  const itemText = resolveMenuItemText(children, textValue);
  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      runCancelablePress(event, onPress, () => {
        root.setCurrentTriggerIndex(menu.menuIndex);
        root.setOpenPath(isOpen() ? [] : menu.path);
      });
    },
    isNativeButton: false,
  });
  const focusRepairProps = compositeItemFocusProps();
  const registrationOwner = {};
  const setNode = (node: HTMLElement | null) => {
    const virtualPlacement =
      scopedVirtualPlacement ??
      (node ? resolveVirtualCompositePlacement(node) : null);
    if (virtualPlacement && !scopedVirtualPlacement) {
      menu.placement.index = virtualPlacement.index;
      menu.placement.setSize = virtualPlacement.setSize;
    }
    const resolvedIndex = virtualPlacement?.index ?? menu.menuIndex;
    registerOverlayNode(
      menu.overlayIdentity,
      'trigger',
      node,
      registrationOwner
    );
    registerCompositeNode(
      menu.triggerId,
      collection,
      node,
      {
        index: resolvedIndex,
        setSize: virtualPlacement?.setSize ?? menu.placement.setSize,
        disabled,
        value: menu.menuKey,
        text: itemText,
      },
      registrationOwner
    );
    root.restoreTriggerFocus(resolvedIndex, node);
    repairFocusForDisabledItem({
      collection,
      disabled,
      index: resolvedIndex,
      loop: root.loop,
      node,
      setCurrentIndex: root.setCurrentTriggerIndex,
    });
  };
  const refHandler = ref
    ? composeRefs(
        ref as
          | ((value: HTMLElement | null) => void)
          | { current: HTMLElement | null }
          | null
          | undefined,
        setNode
      )
    : setNode;
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!disabled && root.handleTypeaheadKeyDown(event)) {
      return;
    }

    interactionProps.onKeyDown?.(event);

    if (!event.defaultPrevented && event.key === 'ArrowDown') {
      event.preventDefault();
      root.setCurrentTriggerIndex(menu.menuIndex);
      root.setOpenPath(menu.path);
    }
  };
  const handleKeyUp = (event: KeyboardEvent) => {
    if (root.handleTypeaheadKeyUp(event)) {
      return;
    }

    interactionProps.onKeyUp?.(event);
  };
  const itemFocusProps = nav.item(menu.menuIndex);
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    ...itemFocusProps,
    ref: refHandler,
    id: menu.triggerId,
    role: 'menuitem',
    disabled: disabled && !asChild ? true : undefined,
    'aria-haspopup': 'menu',
    'aria-expanded': isOpen() ? 'true' : 'false',
    'aria-controls': menu.contentId,
    'data-slot': 'menubar-trigger',
    'data-disabled': disabled ? 'true' : undefined,
    'data-state': isOpen() ? 'open' : 'closed',
    tabIndex: disabled ? -1 : itemFocusProps.tabIndex,
    onFocus: (event: FocusEvent) => {
      focusRepairProps.onFocus(event);
      root.setCurrentTriggerIndex(menu.menuIndex);
    },
    onBlur: focusRepairProps.onBlur,
    onPointerEnter: () => {
      if (!disabled && root.getOpenPath().length > 0) {
        root.setCurrentTriggerIndex(menu.menuIndex);
        root.setOpenPath(menu.path);
      }
    },
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children} />;
  }

  return (
    <button type={typeProp ?? 'button'} {...nativeButtonProps(finalProps)}>
      {children}
    </button>
  );
}

/**
 * Renders a part of `menubar`.
 */
export function MenubarPortal(props: MenubarPortalProps): JSX.Element | null {
  const root = readMenubarRootContext();
  const menu = readMenubarMenuContext();
  const portal = getPersistentPortal(menu.overlayIdentity);
  const open = pathIsOpen(root.getOpenPath(), menu.path);

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

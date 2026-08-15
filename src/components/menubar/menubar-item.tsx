import { nativeButtonProps } from '../_internal/native-control';
import { Slot } from '@askrjs/askr/foundations/structures';
import { state } from '@askrjs/askr';
import { composeRefs, mergeProps } from '@askrjs/askr/foundations/utilities';
import { pressable, rovingFocus } from '@askrjs/askr/foundations/interactions';
import {
  compositeItemFocusProps,
  focusSelectedCollectionItem,
  repairFocusForDisabledItem,
} from '../_internal/focus';
import { resolvePartId } from '../_internal/id';
import { pathIsOpen } from '../_internal/hierarchical-menu';
import { resolveMenuItemText } from '../_internal/menu';
import { getOverlayNodes } from '../_internal/overlay';
import { runCancelablePress } from '../_internal/press';
import {
  getCompositeCollection,
  registerCompositeNode,
} from '../_internal/composite';
import {
  MenubarSubContext,
  readMenubarContentContext,
  readMenubarContentRenderContext,
  readOptionalMenubarRootContext,
  readMenubarSubContext,
  resolveMenubarContentState,
  type MenubarSubContextValue,
} from './menubar.shared';
import type {
  MenubarItemAsChildProps,
  MenubarItemProps,
  MenubarSubProps,
  MenubarSubTriggerAsChildProps,
  MenubarSubTriggerProps,
} from './menubar.types';

function MenubarSubScopeView(props: { children?: unknown }) {
  return <>{props.children}</>;
}

function scheduleMenubarPortalSync(root: { syncPortals: () => void }) {
  queueMicrotask(() => {
    root.syncPortals();
  });
}

/**
 * Renders a part of `menubar`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function MenubarItem(props: MenubarItemProps): JSX.Element | null;
export function MenubarItem(props: MenubarItemAsChildProps): JSX.Element | null;
export function MenubarItem(props: MenubarItemProps | MenubarItemAsChildProps) {
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
  const content = readMenubarContentContext();
  const renderContext = readMenubarContentRenderContext();
  const surfaceIndex = renderContext.claimSurfaceIndex();

  const root = readOptionalMenubarRootContext();

  if (!root) {
    return null;
  }

  const surfaceId = resolvePartId(content.contentId, `item-${surfaceIndex}`);
  const itemText = resolveMenuItemText(children, textValue);
  const { items, currentIndex, disabledItemIndexes } =
    resolveMenubarContentState(content);
  const collection = getCompositeCollection(content.contentId);
  const nav = rovingFocus({
    currentIndex,
    itemCount: Math.max(items.length, 1),
    orientation: 'vertical',
    loop: true,
    isDisabled: (index) => disabledItemIndexes.includes(index),
    onNavigate: (index) => {
      content.setCurrentIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      runCancelablePress(event, onPress, () => {
        root.setOpenPath([]);
        scheduleMenubarPortalSync(root);
      });
    },
    isNativeButton: false,
  });
  const itemFocusProps = nav.item(surfaceIndex);
  const focusRepairProps = compositeItemFocusProps();
  const handleKeyDown = (event: KeyboardEvent) => {
    if (!disabled && content.handleTypeaheadKeyDown(event)) {
      return;
    }

    interactionProps.onKeyDown?.(event);
  };
  const handleKeyUp = (event: KeyboardEvent) => {
    if (content.handleTypeaheadKeyUp(event)) {
      return;
    }

    interactionProps.onKeyUp?.(event);
  };
  const registrationOwner = {};
  const setNode = (node: HTMLElement | null) => {
    registerCompositeNode(
      surfaceId,
      collection,
      node,
      {
        index: surfaceIndex,
        disabled,
        text: itemText,
      },
      registrationOwner
    );
    content.restoreItemFocus(surfaceIndex, node);
    repairFocusForDisabledItem({
      collection,
      disabled,
      index: surfaceIndex,
      loop: true,
      node,
      setCurrentIndex: content.setCurrentIndex,
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
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    ...itemFocusProps,
    ref: refHandler,
    id: surfaceId,
    role: 'menuitem',
    disabled: disabled && !asChild ? true : undefined,
    'aria-disabled': disabled ? 'true' : undefined,
    'data-slot': 'menubar-item',
    'data-disabled': disabled ? 'true' : undefined,
    tabIndex: disabled ? -1 : itemFocusProps.tabIndex,
    ...focusRepairProps,
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
export function MenubarSub(props: MenubarSubProps) {
  const content = readMenubarContentContext();
  const renderContext = readMenubarContentRenderContext();
  const surfaceIndex = renderContext.claimSurfaceIndex();
  const subKey = props.value ?? `sub-${surfaceIndex}`;
  const overlayIdentity = state<object>({})();
  const subContext: MenubarSubContextValue = {
    surfaceIndex,
    triggerId: resolvePartId(content.contentId, `sub-trigger-${surfaceIndex}`),
    contentId: resolvePartId(content.contentId, `sub-content-${surfaceIndex}`),
    path: [...content.path, subKey],
    overlayIdentity,
  };

  return (
    <MenubarSubContext value={subContext}>
      <MenubarSubScopeView>{props.children}</MenubarSubScopeView>
    </MenubarSubContext>
  );
}

/**
 * Renders a part of `menubar`.
 *
 * Supports polymorphic rendering via `asChild`.
 */
export function MenubarSubTrigger(
  props: MenubarSubTriggerProps
): JSX.Element | null;
export function MenubarSubTrigger(
  props: MenubarSubTriggerAsChildProps
): JSX.Element | null;
export function MenubarSubTrigger(
  props: MenubarSubTriggerProps | MenubarSubTriggerAsChildProps
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
  const content = readMenubarContentContext();
  const sub = readMenubarSubContext();

  const root = readOptionalMenubarRootContext();

  if (!root) {
    return null;
  }

  const { items, currentIndex, disabledItemIndexes } =
    resolveMenubarContentState(content);
  const itemText = resolveMenuItemText(children, textValue);
  const collection = getCompositeCollection(content.contentId);
  const nav = rovingFocus({
    currentIndex,
    itemCount: Math.max(items.length, 1),
    orientation: 'vertical',
    loop: true,
    isDisabled: (index) => disabledItemIndexes.includes(index),
    onNavigate: (index) => {
      content.setCurrentIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const isOpen = () => pathIsOpen(root.getOpenPath(), sub.path);
  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      runCancelablePress(event, onPress, () => {
        content.setCurrentIndex(sub.surfaceIndex);
        root.setOpenPath(isOpen() ? content.path : sub.path);
        scheduleMenubarPortalSync(root);
      });
    },
    isNativeButton: false,
  });
  const focusRepairProps = compositeItemFocusProps();
  const registrationOwner = {};
  const setNode = (node: HTMLElement | null) => {
    getOverlayNodes(sub.overlayIdentity).trigger = node;
    registerCompositeNode(
      sub.triggerId,
      collection,
      node,
      {
        index: sub.surfaceIndex,
        disabled,
        text: itemText,
      },
      registrationOwner
    );
    content.restoreItemFocus(sub.surfaceIndex, node);
    repairFocusForDisabledItem({
      collection,
      disabled,
      index: sub.surfaceIndex,
      loop: true,
      node,
      setCurrentIndex: content.setCurrentIndex,
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
    if (!disabled && content.handleTypeaheadKeyDown(event)) {
      return;
    }

    interactionProps.onKeyDown?.(event);

    if (!event.defaultPrevented && event.key === 'ArrowRight') {
      event.preventDefault();
      content.setCurrentIndex(sub.surfaceIndex);
      root.setOpenPath(sub.path);
      scheduleMenubarPortalSync(root);
    }
  };
  const handleKeyUp = (event: KeyboardEvent) => {
    if (content.handleTypeaheadKeyUp(event)) {
      return;
    }

    interactionProps.onKeyUp?.(event);
  };
  const itemFocusProps = nav.item(sub.surfaceIndex);
  const finalProps = mergeProps(rest, {
    ...interactionProps,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    ...itemFocusProps,
    ref: refHandler,
    id: sub.triggerId,
    role: 'menuitem',
    disabled: disabled && !asChild ? true : undefined,
    'aria-haspopup': 'menu',
    'aria-expanded': isOpen() ? 'true' : 'false',
    'aria-controls': sub.contentId,
    'data-slot': 'menubar-sub-trigger',
    'data-state': isOpen() ? 'open' : 'closed',
    'data-disabled': disabled ? 'true' : undefined,
    tabIndex: disabled ? -1 : itemFocusProps.tabIndex,
    ...focusRepairProps,
    onPointerEnter: () => {
      if (!disabled) {
        content.setCurrentIndex(sub.surfaceIndex);
        root.setOpenPath(sub.path);
        scheduleMenubarPortalSync(root);
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

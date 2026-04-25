import {
  Slot,
  composeRefs,
  mergeProps,
  pressable,
  rovingFocus,
} from '@askrjs/askr-ui/foundations';
import {
  registerCompositeNode,
  getCompositeCollection,
  getCompositeCollectionItems,
} from '../../_internal/composite';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import { getOverlayNodes } from '../../_internal/overlay';
import { samePath } from '../../_internal/hierarchical-menu';
import {
  readNavigationMenuRootContext,
  readNavigationMenuItemContext,
} from './navigation-menu.shared';
import type {
  NavigationMenuTriggerProps,
  NavigationMenuTriggerAsChildProps,
} from './navigation-menu.types';

export function NavigationMenuTrigger(
  props: NavigationMenuTriggerProps
): JSX.Element;
export function NavigationMenuTrigger(
  props: NavigationMenuTriggerAsChildProps
): JSX.Element;
export function NavigationMenuTrigger(
  props: NavigationMenuTriggerProps | NavigationMenuTriggerAsChildProps
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

  const root = readNavigationMenuRootContext();
  const item = readNavigationMenuItemContext();

  const collection = getCompositeCollection(root.navigationMenuId);
  const triggerItems = getCompositeCollectionItems(collection);
  const disabledTriggerIndexes = triggerItems
    .filter((entry) => entry.disabled)
    .map((entry) => entry.index);
  const triggerCount = triggerItems.length;
  const nav = rovingFocus({
    currentIndex: root.currentTriggerIndex,
    itemCount: Math.max(triggerCount, 1),
    orientation: 'horizontal',
    loop: root.loop,
    isDisabled: (index) => disabledTriggerIndexes.includes(index),
    onNavigate: (index) => {
      root.setCurrentTriggerIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });

  const open = samePath(root.openPath, [item.itemKey]);
  const overlayNodes = getOverlayNodes(item.triggerId);

  const interactionProps = pressable({
    disabled,
    onPress: (event) => {
      onPress?.(event);
      if (!event.defaultPrevented) {
        root.setOpenPath(open ? [] : [item.itemKey]);
      }
    },
    isNativeButton: !asChild,
  });

  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ...nav.item(item.itemIndex),
    ref: composeRefs(ref as any, (node: HTMLElement | null) => {
      overlayNodes.trigger = node;
      registerCompositeNode(item.triggerId, collection, node, {
        index: item.itemIndex,
        disabled,
        value: item.itemKey,
      });
    }),
    id: item.triggerId,
    'aria-expanded': open ? 'true' : 'false',
    'aria-controls': item.contentId,
    'data-slot': 'navigation-menu-trigger',
    'data-disabled': disabled ? 'true' : undefined,
    'data-state': open ? 'open' : 'closed',
    onFocus: () => {
      root.setCurrentTriggerIndex(item.itemIndex);
    },
    onPointerEnter: () => {
      if (root.openPath.length > 0) {
        root.setOpenPath([item.itemKey]);
      }
    },
  });

  return asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <button type={typeProp ?? 'button'} {...finalProps}>
      {children}
    </button>
  );
}

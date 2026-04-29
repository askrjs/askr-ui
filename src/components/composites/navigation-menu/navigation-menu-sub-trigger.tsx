import {
  Slot,
  composeRefs,
  mergeProps,
  pressable,
  rovingFocus,
} from '@askrjs/ui/foundations';
import {
  registerCompositeNode,
  getCompositeCollection,
} from '../../_internal/composite';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import { getOverlayNodes } from '../../_internal/overlay';
import { pathIsOpen } from '../../_internal/hierarchical-menu';
import {
  readNavigationMenuRootContext,
  readNavigationMenuItemContext,
  readNavigationMenuContentContext,
} from './navigation-menu.shared';
import type {
  NavigationMenuSubTriggerProps,
  NavigationMenuSubTriggerAsChildProps,
} from './navigation-menu.types';

export function NavigationMenuSubTrigger(
  props: NavigationMenuSubTriggerProps
): JSX.Element;
export function NavigationMenuSubTrigger(
  props: NavigationMenuSubTriggerAsChildProps
): JSX.Element;
export function NavigationMenuSubTrigger(
  props: NavigationMenuSubTriggerProps | NavigationMenuSubTriggerAsChildProps
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
  const content = readNavigationMenuContentContext();

  const collection = getCompositeCollection(content.contentId);
  const nav = rovingFocus({
    currentIndex: content.contentCurrentIndex,
    itemCount: Math.max(content.contentItemCount, 1),
    orientation: 'vertical',
    loop: true,
    isDisabled: (index) => content.contentDisabledIndexes.includes(index),
    onNavigate: (index) => {
      content.setContentCurrentIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });

  const isDisabled = disabled;
  const open = pathIsOpen(root.openPath, item.path);
  const overlayNodes = getOverlayNodes(item.triggerId);
  const surfaceIndex = content.registerSurface(`sub:${item.itemKey}`);

  const interactionProps = pressable({
    disabled: isDisabled,
    onPress: (event) => {
      onPress?.(event);
      if (!event.defaultPrevented) {
        root.setOpenPath(open ? item.path.slice(0, -1) : item.path);
      }
    },
    isNativeButton: !asChild,
  });

  const finalProps = mergeProps(rest, {
    ...interactionProps,
    ...nav.item(surfaceIndex),
    ref: composeRefs(ref as any, (node: HTMLElement | null) => {
      overlayNodes.trigger = node;
      registerCompositeNode(item.triggerId, collection, node, {
        index: surfaceIndex,
        disabled: isDisabled,
      });
    }),
    id: item.triggerId,
    'aria-haspopup': 'menu',
    'aria-expanded': open ? 'true' : 'false',
    'data-slot': 'navigation-menu-sub-trigger',
    'data-state': open ? 'open' : 'closed',
    'data-disabled': isDisabled ? 'true' : undefined,
    onPointerEnter: () => {
      if (!isDisabled) {
        root.setOpenPath(item.path);
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


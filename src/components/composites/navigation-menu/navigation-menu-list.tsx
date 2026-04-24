import { Slot, mergeProps, rovingFocus } from '@askrjs/askr/foundations';
import {
  getCompositeCollection,
  getCompositeCollectionItems,
} from '../../_internal/composite';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import { isJsxElement, toChildArray } from '../../_internal/jsx';
import { readNavigationMenuRootContext } from './navigation-menu.shared';
import type {
  NavigationMenuListProps,
  NavigationMenuListAsChildProps,
} from './navigation-menu.types';

export function NavigationMenuList(props: NavigationMenuListProps): JSX.Element;
export function NavigationMenuList(
  props: NavigationMenuListAsChildProps
): JSX.Element;
export function NavigationMenuList(
  props: NavigationMenuListProps | NavigationMenuListAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const root = readNavigationMenuRootContext();
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

  const finalProps = mergeProps(rest, {
    ...nav.container,
    ref,
    'data-slot': 'navigation-menu-list',
    'data-navigation-menu-list': 'true',
  });

  return asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <div {...finalProps}>
      {toChildArray(children).map((child, index) => {
        if (!isJsxElement(child) || child.key != null) {
          return child;
        }

        return {
          ...child,
          key: `navigation-menu-list-${index}`,
        };
      })}
    </div>
  );
}

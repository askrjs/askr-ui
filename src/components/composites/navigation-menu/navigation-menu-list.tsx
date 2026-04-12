import { Slot, mergeProps, rovingFocus } from '@askrjs/askr/foundations';
import { getCompositeCollection } from '../../_internal/composite';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import { stripInternalProps } from '../../_internal/props';
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
  props:
    | NavigationMenuListProps
    | NavigationMenuListAsChildProps
) {
  const { asChild, children, ref, ...rest } = props;
  const root = readNavigationMenuRootContext();
  const collection = getCompositeCollection(root.navigationMenuId);

  const nav = rovingFocus({
    currentIndex: root.currentTriggerIndex,
    itemCount: Math.max(root.triggerCount, 1),
    orientation: 'horizontal',
    loop: root.loop,
    isDisabled: (index) => root.disabledTriggerIndexes.includes(index),
    onNavigate: (index) => {
      root.setCurrentTriggerIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });

  const finalProps = mergeProps(stripInternalProps(rest), {
    ...nav.container,
    ref,
    'data-slot': 'navigation-menu-list',
    'data-navigation-menu-list': 'true',
  });

  return asChild ? (
    <Slot asChild {...finalProps} children={children} />
  ) : (
    <div {...finalProps}>{children}</div>
  );
}

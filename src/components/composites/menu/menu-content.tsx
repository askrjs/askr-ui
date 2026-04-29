import { Slot, mergeProps, rovingFocus } from '@askrjs/ui/foundations';
import { focusSelectedCollectionItem } from '../../_internal/focus';
import { getMenuCollection } from '../../_internal/menu';
import { readMenuRootContext, resolveMenuState } from './menu.shared';
import type { MenuContentAsChildProps, MenuContentProps } from './menu.types';

export function MenuContent(props: MenuContentProps): JSX.Element;
export function MenuContent(props: MenuContentAsChildProps): JSX.Element;
export function MenuContent(props: MenuContentProps | MenuContentAsChildProps) {
  const { asChild, children, ref, ...rest } = props;
  const root = readMenuRootContext();
  const { items, currentIndex, disabledIndexes } = resolveMenuState(root);
  const collection = getMenuCollection(root.menuId);
  const nav = rovingFocus({
    currentIndex,
    itemCount: Math.max(items.length, 1),
    orientation: root.orientation,
    loop: root.loop,
    isDisabled: (index) => disabledIndexes.includes(index),
    onNavigate: (index) => {
      root.setCurrentIndex(index);
      focusSelectedCollectionItem(collection, index);
    },
  });
  const finalProps = mergeProps(rest, {
    ...nav.container,
    ref,
    'data-slot': 'menu-content',
    'data-orientation': root.orientation,
    role: 'menu',
    'aria-orientation':
      root.orientation === 'both' ? undefined : root.orientation,
  });

  if (asChild) {
    return <Slot asChild {...finalProps} children={children as JSX.Element} />;
  }

  return <div {...finalProps}>{children}</div>;
}

